import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startOfDay } from "date-fns";

export function useBooking(propertyId: string, onClose: () => void) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);

  const { data: viewingData, isLoading } = useQuery({
    queryKey: ["viewingSlots", propertyId],
    queryFn: async () => {
      console.log("Fetching slots for property:", propertyId);
      
      const { data: slots, error: slotsError } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", propertyId)
        .gte("slot_date", format(startOfDay(new Date()), 'yyyy-MM-dd'))
        .order("slot_date")
        .order("start_time");

      if (slotsError) {
        console.error("Error fetching slots:", slotsError);
        throw slotsError;
      }

      console.log("Retrieved slots:", slots);

      // Filter out slots that are already booked
      const { data: bookings, error: bookingsError } = await supabase
        .from("property_viewing_bookings")
        .select("viewing_slot_id")
        .eq("property_id", propertyId);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        throw bookingsError;
      }

      console.log("Retrieved bookings:", bookings);

      const bookedSlotIds = new Set(bookings?.map(b => b.viewing_slot_id));
      const availableSlots = slots?.filter(slot => !bookedSlotIds.has(slot.id)) || [];

      console.log("Available slots after filtering:", availableSlots);

      return {
        slots: availableSlots,
      };
    },
  });

  const availableDates = viewingData?.slots 
    ? [...new Set(viewingData.slots.map(slot => slot.slot_date))]
    : [];

  console.log("Available dates:", availableDates);

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !viewingData?.slots) return [];

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    console.log("Getting slots for date:", selectedDateStr);
    
    const daySlots = viewingData.slots.filter(
      (slot) => slot.slot_date === selectedDateStr
    );

    console.log("Slots for selected date:", daySlots);

    return daySlots.map(slot => ({
      start: format(new Date(`2000-01-01T${slot.start_time}`), 'HH:mm'),
      end: format(new Date(`2000-01-01T${slot.end_time}`), 'HH:mm'),
      slotId: slot.id
    }));
  };

  const handleTimeSelect = async (slot: { start: string; end: string; slotId: string }) => {
    try {
      setIsBookingInProgress(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Anmeldung erforderlich",
          description: "Bitte melden Sie sich an, um einen Termin zu buchen.",
          variant: "destructive",
        });
        return;
      }

      if (!selectedDate) return;

      const bookingData = {
        viewing_slot_id: slot.slotId,
        property_id: propertyId,
        booked_by: user.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: `${slot.start}:00`,
        end_time: `${slot.end}:00`,
      };

      const { error } = await supabase
        .from("property_viewing_bookings")
        .insert(bookingData);

      if (error) {
        console.error('Booking error:', error);
        toast({
          title: "Buchung fehlgeschlagen",
          description: "Der Termin konnte nicht gebucht werden. Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Besichtigungstermin gebucht!",
        description: `Ihr Termin für ${format(selectedDate, 'EEEE, dd. MMMM', { locale: de })} von ${slot.start} bis ${slot.end} Uhr wurde erfolgreich gebucht.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Buchung fehlgeschlagen",
        description: "Der Termin konnte nicht gebucht werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsBookingInProgress(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    isLoading,
    availableDates,
    getAvailableTimeSlots,
    handleTimeSelect,
    isBookingInProgress
  };
}