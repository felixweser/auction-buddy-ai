import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay } from "date-fns";

interface CalendarSectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  selectedProperty: string | null;
}

export function CalendarSection({ selectedDate, onDateSelect, selectedProperty }: CalendarSectionProps) {
  const { data: daysWithSlots } = useQuery({
    queryKey: ["days-with-slots", selectedProperty],
    enabled: !!selectedProperty,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_viewing_slots")
        .select("slot_date")
        .eq("property_id", selectedProperty)
        .gte("slot_date", format(startOfDay(new Date()), 'yyyy-MM-dd'));

      if (error) throw error;
      
      // Convert the dates to Date objects
      return data.map(slot => {
        const [year, month, day] = slot.slot_date.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-based in JS Date
      });
    },
  });

  return (
    <div className="flex flex-col">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="border-0"
        locale={de}
        fromDate={new Date()}
        modifiers={{ hasSlot: daysWithSlots || [] }}
        modifiersClassNames={{
          hasSlot: "relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary"
        }}
      />
    </div>
  );
}