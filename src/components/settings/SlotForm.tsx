import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SlotFormProps {
  startTime: string;
  endTime: string;
  slotDuration: string;
  bufferTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onSlotDurationChange: (value: string) => void;
  onBufferTimeChange: (value: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export function SlotForm({
  startTime,
  endTime,
  slotDuration,
  bufferTime,
  onStartTimeChange,
  onEndTimeChange,
  onSlotDurationChange,
  onBufferTimeChange,
  onSubmit,
  isEditing,
}: SlotFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Terminlänge (Minuten)</Label>
          <Select value={slotDuration} onValueChange={onSlotDurationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Dauer auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 Minuten</SelectItem>
              <SelectItem value="30">30 Minuten</SelectItem>
              <SelectItem value="45">45 Minuten</SelectItem>
              <SelectItem value="60">1 Stunde</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Pufferzeit (Minuten)</Label>
          <Select value={bufferTime} onValueChange={onBufferTimeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pufferzeit auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Kein Puffer</SelectItem>
              <SelectItem value="5">5 Minuten</SelectItem>
              <SelectItem value="10">10 Minuten</SelectItem>
              <SelectItem value="15">15 Minuten</SelectItem>
              <SelectItem value="30">30 Minuten</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        {isEditing ? "Termin aktualisieren" : "Termin hinzufügen"}
      </Button>
    </div>
  );
}