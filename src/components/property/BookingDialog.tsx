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
import { ConfirmationStep } from "./booking/ConfirmationStep";
import { useBooking } from "@/hooks/use-booking";
import { useState } from "react";

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

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start: string;
    end: string;
    slotId: string;
  } | null>(null);

  const availableTimeSlots = getAvailableTimeSlots();

  const handleTimeSlotSelect = (slot: { start: string; end: string; slotId: string }) => {
    setSelectedTimeSlot(slot);
  };

  const handleConfirm = () => {
    if (selectedTimeSlot) {
      handleTimeSelect(selectedTimeSlot);
    }
  };

  const handleBack = () => {
    setSelectedTimeSlot(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onClose();
          setSelectedTimeSlot(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTimeSlot ? "Termin bestätigen" : "Besichtigungstermin auswählen"}
            </DialogTitle>
            <DialogDescription>
              {selectedTimeSlot 
                ? "Bitte überprüfen Sie die Details Ihres Besichtigungstermins."
                : `Wählen Sie einen Tag und eine Uhrzeit für die Besichtigung von ${propertyTitle}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Lade Termine...</p>
            ) : selectedTimeSlot && selectedDate ? (
              <ConfirmationStep
                selectedDate={selectedDate}
                selectedTime={{
                  start: selectedTimeSlot.start,
                  end: selectedTimeSlot.end
                }}
                propertyTitle={propertyTitle}
                onConfirm={handleConfirm}
                onCancel={handleBack}
              />
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
                    onTimeSelect={handleTimeSlotSelect}
                  />
                )}
              </>
            )}
          </div>
          {!selectedTimeSlot && (
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}