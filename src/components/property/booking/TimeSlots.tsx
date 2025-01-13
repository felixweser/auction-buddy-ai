import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface TimeSlotsProps {
  selectedDate: Date;
  availableTimeSlots: Array<{
    start: string;
    end: string;
    slotId: string;
  }>;
  onTimeSelect: (slot: { start: string; end: string; slotId: string }) => void;
}

export function TimeSlots({ selectedDate, availableTimeSlots, onTimeSelect }: TimeSlotsProps) {
  return (
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
              onClick={() => onTimeSelect(slot)}
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
  );
}