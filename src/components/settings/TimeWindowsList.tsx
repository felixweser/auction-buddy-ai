import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
}

interface TimeWindowsListProps {
  windows: TimeWindow[];
  onEdit: (window: TimeWindow) => void;
  onDelete: (windowId: string) => void;
}

export function TimeWindowsList({ windows, onEdit, onDelete }: TimeWindowsListProps) {
  const [expandedWindows, setExpandedWindows] = useState<Record<string, boolean>>({});

  // Fetch slots for all dates in the windows
  const { data: slotsData } = useQuery({
    queryKey: ["timeWindowSlots", windows.map(w => w.date).join(',')],
    queryFn: async () => {
      if (windows.length === 0) return [];
      
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

  const toggleWindow = (windowId: string) => {
    setExpandedWindows(prev => ({
      ...prev,
      [windowId]: !prev[windowId]
    }));
  };

  // Helper function to check if a slot falls within a time window
  const isSlotInWindow = (slot: TimeSlot, window: TimeWindow) => {
    const slotStart = slot.start_time;
    const slotEnd = slot.end_time;
    const windowStart = window.window_start;
    const windowEnd = window.window_end;

    return (
      slot.slot_date === window.date &&
      slotStart >= windowStart &&
      slotEnd <= windowEnd
    );
  };

  // Get slots for a specific time window
  const getWindowSlots = (window: TimeWindow) => {
    const windowSlots = slotsData?.filter(slot => isSlotInWindow(slot, window)) || [];
    return windowSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Sort windows first by date, then by start time
  const sortedWindows = [...windows].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.window_start.localeCompare(b.window_start);
  });

  if (windows.length === 0) {
    return (
      <p className="text-muted-foreground">
        Keine Zeitfenster verfügbar
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sortedWindows.map((window) => (
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
            <div className="flex gap-2 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleWindow(window.id)}
              >
                {expandedWindows[window.id] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
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
          
          {expandedWindows[window.id] && (
            <div className="ml-4 space-y-2">
              {getWindowSlots(window).map((slot) => (
                <div
                  key={slot.id}
                  className="p-2 bg-muted/50 rounded text-sm flex justify-between items-center"
                >
                  <span>
                    {format(new Date(`2024-01-01T${slot.start_time}`), "HH:mm", { locale: de })} -{" "}
                    {format(new Date(`2024-01-01T${slot.end_time}`), "HH:mm", { locale: de })}
                  </span>
                  <span className="text-muted-foreground">
                    {slot.slot_duration_minutes} Min. + {slot.buffer_minutes} Min. Puffer
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}