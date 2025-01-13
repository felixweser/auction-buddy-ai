import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface TimeWindowFormProps {
  date: string;
  startTime: string;
  endTime: string;
  onDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export function TimeWindowForm({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onSubmit,
  isEditing,
}: TimeWindowFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Datum</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          min={format(new Date(), "yyyy-MM-dd")}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Startzeit</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Endzeit</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={onSubmit}>
        {isEditing ? "Zeitfenster aktualisieren" : "Zeitfenster hinzufügen"}
      </Button>
    </div>
  );
}