import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";

interface CalendarSectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function CalendarSection({ selectedDate, onDateSelect }: CalendarSectionProps) {
  return (
    <div className="flex flex-col">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="border-0"
        locale={de}
        fromDate={new Date()}
      />
    </div>
  );
}