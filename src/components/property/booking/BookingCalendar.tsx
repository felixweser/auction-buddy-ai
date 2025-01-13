import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { isBefore, startOfDay } from "date-fns";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  availableDates: string[];
}

export function BookingCalendar({ selectedDate, onDateSelect, availableDates }: BookingCalendarProps) {
  const isDateDisabled = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    const dateStr = date.toISOString().split('T')[0];
    return !availableDates.includes(dateStr);
  };

  return (
    <div className="mb-6">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
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
  );
}