import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TimeWindowsList } from "./TimeWindowsList";
import { TimeWindowForm } from "./TimeWindowForm";

interface TimeWindow {
  id: string;
  date: string;
  window_start: string;
  window_end: string;
  is_available: boolean;
}

export function TimeWindowManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWindow, setEditingWindow] = useState<TimeWindow | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { data: timeWindows, isLoading } = useQuery({
    queryKey: ["timeWindows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_windows")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as TimeWindow[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newWindow: Omit<TimeWindow, "id">) => {
      const { data, error } = await supabase
        .from("time_windows")
        .insert([newWindow])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeWindows"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Zeitfenster erstellt",
        description: "Das Zeitfenster wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Das Zeitfenster konnte nicht erstellt werden.",
        variant: "destructive",
      });
      console.error("Error creating time window:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (window: TimeWindow) => {
      const { data, error } = await supabase
        .from("time_windows")
        .update({
          date: window.date,
          window_start: window.window_start,
          window_end: window.window_end,
        })
        .eq("id", window.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeWindows"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Zeitfenster aktualisiert",
        description: "Das Zeitfenster wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Das Zeitfenster konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      console.error("Error updating time window:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (windowId: string) => {
      const { error } = await supabase
        .from("time_windows")
        .delete()
        .eq("id", windowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeWindows"] });
      toast({
        title: "Zeitfenster gelöscht",
        description: "Das Zeitfenster wurde erfolgreich gelöscht.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Das Zeitfenster konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      console.error("Error deleting time window:", error);
    },
  });

  const resetForm = () => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setEditingWindow(null);
  };

  const handleEdit = (window: TimeWindow) => {
    setEditingWindow(window);
    setDate(window.date);
    setStartTime(window.window_start);
    setEndTime(window.window_end);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    if (editingWindow) {
      updateMutation.mutate({
        ...editingWindow,
        date,
        window_start: startTime,
        window_end: endTime,
      });
    } else {
      createMutation.mutate({
        date,
        window_start: startTime,
        window_end: endTime,
        is_available: true,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Zeitfenster</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          Zeitfenster hinzufügen
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Lade Zeitfenster...</p>
      ) : (
        <TimeWindowsList
          windows={timeWindows || []}
          onEdit={handleEdit}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWindow ? "Zeitfenster bearbeiten" : "Neues Zeitfenster"}
            </DialogTitle>
          </DialogHeader>
          <TimeWindowForm
            date={date}
            startTime={startTime}
            endTime={endTime}
            onDateChange={setDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            onSubmit={handleSubmit}
            isEditing={!!editingWindow}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}