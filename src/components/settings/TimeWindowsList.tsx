import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { TimeSlotsList } from "./TimeSlotsList";

interface TimeWindow {
  id: string;
  date: string;
  window_start: string;
  window_end: string;
  is_available: boolean;
}

interface TimeSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  is_selected?: boolean;
}

interface TimeWindowsListProps {
  windows: TimeWindow[];
  onEdit: (window: TimeWindow) => void;
  onDelete: (windowId: string) => void;
}

export function TimeWindowsList({ windows, onEdit, onDelete }: TimeWindowsListProps) {
  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({});

  const { data: slotsData } = useQuery({
    queryKey: ["timeWindowSlots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .in(
          "slot_date",
          windows.map((w) => w.date)
        );

      if (error) throw error;
      return data as TimeSlot[];
    },
    enabled: windows.length > 0,
  });

  const getSlotsByDate = (date: string) => {
    return (slotsData?.filter((slot) => slot.slot_date === date) || []).map(slot => ({
      ...slot,
      is_selected: selectedSlots[slot.id] || false
    }));
  };

  const handleSlotToggle = (slot: TimeSlot) => {
    setSelectedSlots(prev => ({
      ...prev,
      [slot.id]: !prev[slot.id]
    }));
  };

  if (windows.length === 0) {
    return (
      <p className="text-muted-foreground">
        Keine Zeitfenster verfügbar
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {windows.map((window) => (
        <div
          key={window.id}
          className="space-y-2"
        >
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
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
          
          {/* Display slots for this time window */}
          <div className="ml-4 space-y-2">
            <TimeSlotsList
              slots={getSlotsByDate(window.date)}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggle={handleSlotToggle}
            />
          </div>
        </div>
      ))}
    </div>
  );
}