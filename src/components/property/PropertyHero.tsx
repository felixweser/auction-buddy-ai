import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Calendar, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PropertyDetails } from "@/types/property";
import { PropertyStats } from "./PropertyStats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, isBefore, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface PropertyHeroProps {
  imageUrl: string;
  title: string;
  price: number;
  details: PropertyDetails;
}

export const PropertyHero = ({ imageUrl, title, price, details }: PropertyHeroProps) => {
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showViewingDialog, setShowViewingDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
    slotId: string;
  } | null>(null);

  const resetAllStates = () => {
    setShowViewingDialog(false);
    setSelectedDate(undefined);
    setShowConfirmDialog(false);
    setShowSuccessDialog(false);
    setSelectedSlot(null);
  };

  const images = [imageUrl, imageUrl, imageUrl];

  const { data: viewingData, isLoading, refetch } = useQuery({
    queryKey: ["viewingSlots", details.property_id, selectedDate],
    queryFn: async () => {
      const { data: slots, error: slotsError } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", details.property_id)
        .gte("slot_date", startOfDay(new Date()).toISOString())
        .order("slot_date")
        .order("start_time");

      if (slotsError) throw slotsError;

      let bookings = [];
      if (selectedDate) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("property_viewing_bookings")
          .select("*")
          .eq("property_id", details.property_id)
          .eq("booking_date", selectedDate.toISOString().split('T')[0]);

        if (bookingsError) throw bookingsError;
        bookings = bookingsData;
      }

      return {
        slots: slots || [],
        bookings: bookings || []
      };
    },
    enabled: showViewingDialog,
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

    const timeSlots = [];
    for (const slot of daySlots) {
      const startTime = new Date(`2024-01-01T${slot.start_time}`);
      const endTime = new Date(`2024-01-01T${slot.end_time}`);

      let currentTime = startTime;
      while (isBefore(currentTime, endTime)) {
        const slotEndTime = addMinutes(currentTime, slot.slot_duration_minutes);
        if (!isBefore(slotEndTime, endTime)) break;

        const currentTimeStr = format(currentTime, 'HH:mm:ss');
        const slotEndTimeStr = format(slotEndTime, 'HH:mm:ss');

        const isBooked = viewingData.bookings.some(booking => {
          const bookingStart = new Date(`2024-01-01T${booking.start_time}`);
          const bookingEnd = new Date(`2024-01-01T${booking.end_time}`);
          const slotStart = new Date(`2024-01-01T${currentTimeStr}`);
          const slotEnd = new Date(`2024-01-01T${slotEndTimeStr}`);

          return (
            (slotStart <= bookingEnd && slotEnd >= bookingStart) ||
            (bookingStart <= slotEnd && bookingEnd >= slotStart)
          );
        });

        if (!isBooked) {
          timeSlots.push({
            start: format(currentTime, 'HH:mm'),
            end: format(slotEndTime, 'HH:mm'),
            slotId: slot.id
          });
        }

        currentTime = addMinutes(slotEndTime, slot.buffer_minutes);
      }
    }

    return timeSlots;
  };

  const handleVirtualTour = () => {
    toast({
      title: "Demnächst verfügbar",
      description: "Virtuelle Besichtigungen werden in Kürze verfügbar sein!",
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (slot: { start: string; end: string; slotId: string }) => {
    setSelectedSlot(slot);
    setShowConfirmDialog(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !selectedDate) return;

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

      const { data: existingBooking, error: checkError } = await supabase
        .from("property_viewing_bookings")
        .select("*")
        .eq("viewing_slot_id", selectedSlot.slotId)
        .eq("booking_date", selectedDate.toISOString().split('T')[0])
        .eq("start_time", `${selectedSlot.start}:00`)
        .maybeSingle();

      if (checkError) {
        toast({
          title: "Fehler",
          description: "Der Termin konnte nicht überprüft werden. Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        });
        return;
      }

      if (existingBooking) {
        toast({
          title: "Termin nicht verfügbar",
          description: "Dieser Termin wurde leider bereits gebucht. Bitte wählen Sie einen anderen Termin.",
          variant: "destructive",
        });
        setShowConfirmDialog(false);
        return;
      }

      const { error } = await supabase
        .from("property_viewing_bookings")
        .insert({
          viewing_slot_id: selectedSlot.slotId,
          property_id: details.property_id,
          booked_by: user.id,
          booking_date: selectedDate.toISOString().split('T')[0],
          start_time: `${selectedSlot.start}:00`,
          end_time: `${selectedSlot.end}:00`,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Termin nicht verfügbar",
            description: "Dieser Termin wurde leider bereits gebucht. Bitte wählen Sie einen anderen Termin.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Fehler",
            description: "Der Termin konnte nicht gebucht werden. Bitte versuchen Sie es später erneut.",
            variant: "destructive",
          });
        }
        return;
      }

      await refetch();
      
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
    } catch (error) {
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
    <div className="relative h-[70vh] group">
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-3">
        <Button 
          variant="agora"
          onClick={() => setShowViewingDialog(true)}
        >
          <Calendar />
          <span>Besichtigung planen</span>
        </Button>
        <Button 
          variant="agora"
          onClick={handleVirtualTour}
        >
          <Video />
          <span>Virtuelle Tour</span>
        </Button>
      </div>

      <Dialog open={showViewingDialog} onOpenChange={(open) => {
        if (!open) resetAllStates();
        else setShowViewingDialog(true);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Besichtigungstermin auswählen</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Lade Termine...</p>
            ) : (
              <>
                <div className="mb-6">
                  <CalendarComponent
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
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={showConfirmDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmDialog(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Besichtigungstermin bestätigen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Besichtigungstermin am {selectedDate && format(selectedDate, 'EEEE, dd. MMMM', { locale: de })} 
              von {selectedSlot?.start} bis {selectedSlot?.end} Uhr buchen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking}>Termin buchen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog 
        open={showSuccessDialog} 
        onOpenChange={(open) => {
          if (!open) resetAllStates();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Besichtigungstermin erfolgreich gebucht!</DialogTitle>
            <DialogDescription>
              Ihr Besichtigungstermin wurde erfolgreich gebucht für:
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">{title}</p>
                <p className="mt-2">
                  Datum: {selectedDate && format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
                </p>
                <p>
                  Uhrzeit: {selectedSlot?.start} - {selectedSlot?.end} Uhr
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={resetAllStates}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Carousel className="w-full h-full">
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index} className="h-[70vh]">
              <div className="relative w-full h-full">
                <img
                  src={img}
                  alt={`${title} - Bild ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Carousel>

      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <div className="max-w-7xl mx-auto space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-3xl font-bold text-foreground">
              €{price.toLocaleString()}
            </p>
          </div>
          <PropertyStats price={price} details={details} />
        </div>
      </div>
    </div>
  );
};
