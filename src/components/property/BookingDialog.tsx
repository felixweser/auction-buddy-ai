import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { BookingCalendar } from "./booking/BookingCalendar";
import { TimeSlots } from "./booking/TimeSlots";
import { useBooking } from "@/hooks/use-booking";

interface BookingDialogProps {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDialog({ propertyId, propertyTitle, isOpen, onClose }: BookingDialogProps) {
  const {
    selectedDate,
    setSelectedDate,
    isLoading,
    availableDates,
    getAvailableTimeSlots,
    handleTimeSelect
  } = useBooking(propertyId, onClose);

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <>
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
                <BookingCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  availableDates={availableDates}
                />
                
                {selectedDate && (
                  <TimeSlots
                    selectedDate={selectedDate}
                    availableTimeSlots={availableTimeSlots}
                    onTimeSelect={handleTimeSelect}
                  />
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
      <Toaster />
    </>
  );
}