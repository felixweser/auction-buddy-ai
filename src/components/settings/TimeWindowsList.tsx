import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TimeWindow {
  id: string;
  date: string;
  window_start: string;
  window_end: string;
  is_available: boolean;
}

interface TimeWindowsListProps {
  windows: TimeWindow[];
  onEdit: (window: TimeWindow) => void;
  onDelete: (windowId: string) => void;
}

export function TimeWindowsList({ windows, onEdit, onDelete }: TimeWindowsListProps) {
  if (windows.length === 0) {
    return (
      <p className="text-muted-foreground">
        Keine Zeitfenster verfügbar
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {windows.map((window) => (
        <div
          key={window.id}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div className="space-y-1">
            <div>
              {format(new Date(window.date), "dd.MM.yyyy", { locale: de })}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(`2024-01-01T${window.window_start}`), "HH:mm", { locale: de })} -{" "}
              {format(new Date(`2024-01-01T${window.window_end}`), "HH:mm", { locale: de })}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(window)}
            >
              Bearbeiten
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(window.id)}
            >
              Löschen
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}