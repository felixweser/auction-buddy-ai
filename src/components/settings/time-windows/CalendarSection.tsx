import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CalendarSectionProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function CalendarSection({ selectedDate, onDateSelect }: CalendarSectionProps) {
  const { data: daysWithSlots } = useQuery({
    queryKey: ["days-with-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_windows")
        .select("date")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id || '')
        .gte("date", format(new Date(), 'yyyy-MM-dd'));

      if (error) throw error;
      return data.map(slot => new Date(slot.date));
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
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            textDecorationThickness: "3px",
            textUnderlineOffset: "5px",
          }
        }}
      />
    </div>
  );
}