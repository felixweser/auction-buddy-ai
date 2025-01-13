import { useState } from "react";
import { format, addMinutes, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface BookingDialogProps {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDialog({ propertyId, propertyTitle, isOpen, onClose }: BookingDialogProps) {
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
    enabled: isOpen,
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleTimeSelect = async (slot: { start: string; end: string; slotId: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Fehler",
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
          title: "Fehler",
          description: "Der Termin konnte nicht gebucht werden. Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        });
        return;
      }

      await refetch();
      toast({
        title: "Erfolg",
        description: `Ihr Besichtigungstermin wurde erfolgreich für ${format(selectedDate, 'EEEE, dd. MMMM', { locale: de })} von ${slot.start} bis ${slot.end} Uhr gebucht.`,
      });
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Fehler",
        description: "Der Termin konnte nicht gebucht werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  };

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    const dateStr = date.toISOString().split('T')[0];
    return !availableDates.includes(dateStr);
  };

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Besichtigungstermin auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie einen Tag und eine Uhrzeit für die Besichtigung von {propertyTitle}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Lade Termine...</p>
          ) : (
            <>
              <div className="mb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  locale={de}
                  className="rounded-md border"
                  modifiers={{
                    hasSlots: (date) => {
                      if (isBefore(date, startOfDay(new Date()))) return false;
                      const dateStr = date.toISOString().split('T')[0];
                      return availableDates.includes(dateStr);
                    }
                  }}
                  modifiersStyles={{
                    hasSlots: {
                      color: 'hsl(var(--primary))',
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      borderRadius: 'var(--radius)'
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Tage ohne Verfügbarkeit sind ausgegraut
                </p>
              </div>
              
              {selectedDate && (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">
                    Verfügbare Zeiten am {format(selectedDate, 'EEEE, dd. MMMM', { locale: de })}:
                  </h3>
                  {availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimeSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleTimeSelect(slot)}
                          className="text-sm hover:bg-primary hover:text-primary-foreground"
                        >
                          {slot.start} - {slot.end}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Keine Termine an diesem Tag verfügbar
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}