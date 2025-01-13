import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface UseTimeWindowsProps {
  selectedProperty: string | null;
  selectedDate: Date | undefined;
  session: Session | null;
}

export function useTimeWindows({ selectedProperty, selectedDate, session }: UseTimeWindowsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [editingWindow, setEditingWindow] = useState<TimeWindow | null>(null);

  const { data: timeWindows, refetch: refetchWindows } = useQuery({
    queryKey: ["time-windows", selectedProperty, selectedDate],
    enabled: !!selectedProperty && !!selectedDate && !!session?.user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_windows")
        .select("*")
        .eq("property_id", selectedProperty)
        .eq("date", format(selectedDate!, 'yyyy-MM-dd'));

      if (error) throw error;
      return data as TimeWindow[];
    },
  });

  const validateTimeWindow = (start: string, end: string) => {
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    
    if (startTime >= endTime) {
      throw new Error("Die Startzeit muss vor der Endzeit liegen");
    }
  };

  const handleAddWindow = async (startTime: string, endTime: string) => {
    if (!session?.user) {
      toast({
        title: "Nicht authentifiziert",
        description: "Bitte melden Sie sich an",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!selectedProperty || !selectedDate || !startTime || !endTime) {
      toast({
        title: "Fehlende Informationen",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      validateTimeWindow(startTime, endTime);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      const { error } = await supabase.from("time_windows").insert({
        user_id: session.user.id,
        property_id: selectedProperty,
        date: formattedDate,
        window_start: startTime,
        window_end: endTime,
        is_available: true,
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Zeitfenster erfolgreich hinzugefügt",
      });

      refetchWindows();
    } catch (error) {
      console.error("Error adding time window:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Hinzufügen des Zeitfensters",
        variant: "destructive",
      });
    }
  };

  const handleEditWindow = async (startTime: string, endTime: string) => {
    if (!editingWindow || !session?.user) return;

    try {
      validateTimeWindow(startTime, endTime);

      // First, delete existing slots for this time window
      const { error: deleteError } = await supabase
        .from("property_viewing_slots")
        .delete()
        .eq("slot_date", editingWindow.date)
        .gte("start_time", editingWindow.window_start)
        .lte("end_time", editingWindow.window_end);

      if (deleteError) throw deleteError;

      // Then update the time window
      const { error: updateError } = await supabase
        .from("time_windows")
        .update({
          window_start: startTime,
          window_end: endTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingWindow.id);

      if (updateError) throw updateError;

      toast({
        title: "Erfolg",
        description: "Zeitfenster erfolgreich aktualisiert",
      });

      refetchWindows();
      setEditingWindow(null);
    } catch (error) {
      console.error("Error updating time window:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Aktualisieren des Zeitfensters",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWindow = async (windowId: string) => {
    const { error } = await supabase
      .from("time_windows")
      .delete()
      .eq("id", windowId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Zeitfensters",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Erfolg",
      description: "Zeitfenster erfolgreich gelöscht",
    });

    refetchWindows();
  };

  return {
    timeWindows,
    editingWindow,
    setEditingWindow,
    handleAddWindow,
    handleEditWindow,
    handleDeleteWindow,
    refetchWindows,
  };
}