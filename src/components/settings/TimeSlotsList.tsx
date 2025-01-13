import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  is_selected?: boolean;
}

interface TimeSlotsListProps {
  slots: TimeSlot[];
  onEdit: (slot: TimeSlot) => void;
  onDelete: (slotId: string) => void;
  onToggle?: (slot: TimeSlot) => void;
}

export function TimeSlotsList({ slots, onEdit, onDelete, onToggle }: TimeSlotsListProps) {
  if (slots.length === 0) {
    return (
      <p className="text-muted-foreground">
        Keine Besichtigungstermine für diesen Tag
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <Toggle
            pressed={slot.is_selected}
            onPressedChange={() => onToggle?.(slot)}
            className="flex-1 justify-start gap-4"
          >
            <div className="space-y-1">
              <div>
                {format(new Date(`2024-01-01T${slot.start_time}`), "HH:mm", { locale: de })} -{" "}
                {format(new Date(`2024-01-01T${slot.end_time}`), "HH:mm", { locale: de })}
              </div>
              <div className="text-sm text-muted-foreground">
                {slot.slot_duration_minutes} Min. Termine mit {slot.buffer_minutes} Min. Puffer
              </div>
            </div>
          </Toggle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(slot)}
            >
              Bearbeiten
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(slot.id)}
            >
              Löschen
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}