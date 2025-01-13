import { useState } from "react";
import { format, isBefore } from "date-fns";
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
    queryKey: ["viewingSlots", propertyId, selectedDate],
    queryFn: async () => {
      const { data: slots, error: slotsError } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", propertyId)
        .gte("slot_date", format(startOfDay(new Date()), 'yyyy-MM-dd'))
        .order("slot_date")
        .order("start_time");

      if (slotsError) throw slotsError;

      // Filter out slots that are already booked
      const { data: bookings, error: bookingsError } = await supabase
        .from("property_viewing_bookings")
        .select("viewing_slot_id")
        .eq("property_id", propertyId);

      if (bookingsError) throw bookingsError;

      const bookedSlotIds = new Set(bookings?.map(b => b.viewing_slot_id));
      const availableSlots = slots?.filter(slot => !bookedSlotIds.has(slot.id)) || [];

      return {
        slots: availableSlots,
      };
    },
    enabled: true,
  });

  const availableDates = viewingData?.slots 
    ? [...new Set(viewingData.slots.map(slot => slot.slot_date))]
    : [];

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !viewingData?.slots) return [];

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const daySlots = viewingData.slots.filter(
      (slot) => slot.slot_date === selectedDateStr
    );

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