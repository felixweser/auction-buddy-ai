import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
        .gte("slot_date", format(new Date(), 'yyyy-MM-dd'));

      if (error) throw error;
      return data.map(slot => new Date(slot.slot_date));
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
        modifiersStyles={{
          hasSlot: {
            textDecoration: "none",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "hsl(var(--primary))",
            }
          }
        }}
      />
    </div>
  );
}