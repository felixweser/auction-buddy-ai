import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmationStepProps {
  selectedDate: Date;
  selectedTime: {
    start: string;
    end: string;
  };
  propertyTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmationStep({
  selectedDate,
  selectedTime,
  propertyTitle,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Besichtigungstermin bestätigen</h3>
        <p className="text-muted-foreground">
          Bitte überprüfen Sie die Details Ihres Besichtigungstermins für {propertyTitle}:
        </p>
      </div>
      
      <div className="space-y-2 bg-secondary/20 p-4 rounded-lg">
        <p><strong>Datum:</strong> {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}</p>
        <p><strong>Uhrzeit:</strong> {selectedTime.start} - {selectedTime.end} Uhr</p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Zurück
        </Button>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gebucht...
            </>
          ) : (
            "Termin bestätigen"
          )}
        </Button>
      </div>
    </div>
  );
}