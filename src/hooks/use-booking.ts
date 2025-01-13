import { useState } from "react";
import { format, addMinutes, isBefore } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { startOfDay } from "date-fns";

export function useBooking(propertyId: string, onClose: () => void) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
    slotId: string;
  } | null>(null);

  const { data: viewingData, isLoading, refetch } = useQuery({
    queryKey: ["viewingSlots", propertyId, selectedDate],
    queryFn: async () => {
      const { data: slots, error: slotsError } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", propertyId)
        .gte("slot_date", startOfDay(new Date()).toISOString())
        .order("slot_date")
        .order("start_time");

      if (slotsError) throw slotsError;

      let bookings = [];
      if (selectedDate) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("property_viewing_bookings")
          .select("*")
          .eq("property_id", propertyId)
          .eq("booking_date", selectedDate.toISOString().split('T')[0]);

        if (bookingsError) throw bookingsError;
        bookings = bookingsData || [];
      }

      return {
        slots: slots || [],
        bookings: bookings
      };
    },
    enabled: true,
  });

  const availableDates = viewingData?.slots 
    ? [...new Set(viewingData.slots.map(slot => slot.slot_date))]
    : [];

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !viewingData?.slots) return [];

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const daySlots = viewingData.slots.filter(
      (slot) => slot.slot_date === selectedDateStr
    );

    const bookedSlots = viewingData.bookings || [];
    const availableSlots = [];

    for (const slot of daySlots) {
      const startTime = new Date(`2024-01-01T${slot.start_time}`);
      const endTime = new Date(`2024-01-01T${slot.end_time}`);
      let currentTime = startTime;

      while (isBefore(currentTime, endTime)) {
        const slotEndTime = addMinutes(currentTime, slot.slot_duration_minutes);
        if (!isBefore(slotEndTime, endTime)) break;

        const currentTimeStr = format(currentTime, 'HH:mm:ss');
        const slotEndTimeStr = format(slotEndTime, 'HH:mm:ss');

        const isBooked = bookedSlots.some(booking => 
          booking.start_time === currentTimeStr && 
          booking.end_time === slotEndTimeStr &&
          booking.viewing_slot_id === slot.id
        );

        if (!isBooked) {
          availableSlots.push({
            start: format(currentTime, 'HH:mm'),
            end: format(slotEndTime, 'HH:mm'),
            slotId: slot.id
          });
        }

        currentTime = addMinutes(slotEndTime, slot.buffer_minutes);
      }
    }

    return availableSlots;
  };

  const handleTimeSelect = async (slot: { start: string; end: string; slotId: string }) => {
    try {
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
        booking_date: selectedDate.toISOString().split('T')[0],
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

      await refetch();
      toast({
        title: "Besichtigungstermin gebucht!",
        description: `Ihr Termin für ${format(selectedDate, 'EEEE, dd. MMMM', { locale: de })} von ${slot.start} bis ${slot.end} Uhr wurde erfolgreich gebucht. Sie erhalten in Kürze eine Bestätigung per E-Mail.`,
        variant: "default",
      });
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Buchung fehlgeschlagen",
        description: "Der Termin konnte nicht gebucht werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    isLoading,
    availableDates,
    getAvailableTimeSlots,
    handleTimeSelect
  };
}