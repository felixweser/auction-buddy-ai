import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TimeWindowsList } from "./TimeWindowsList";
import { TimeWindowForm } from "./TimeWindowForm";

interface TimeWindow {
  id: string;
  date: string;
  window_start: string;
  window_end: string;
  is_available: boolean;
  property_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function TimeWindowManager() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddWindowDialogOpen, setIsAddWindowDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editingWindow, setEditingWindow] = useState<TimeWindow | null>(null);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate("/auth");
        throw error || new Error("No session found");
      }
      return session;
    },
  });

  const { data: properties } = useQuery({
    queryKey: ["my-properties"],
    enabled: !!session?.user,
    queryFn: async () => {
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("created_by", session.user.id);

      if (error) throw error;
      return data as Property[];
    },
  });

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

  const handleAddWindow = async () => {
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

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    try {
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

      setIsAddWindowDialogOpen(false);
      resetForm();
      refetchWindows();
    } catch (error) {
      console.error("Error adding time window:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen des Zeitfensters",
        variant: "destructive",
      });
    }
  };

  const handleEditWindow = async () => {
    if (!editingWindow || !session?.user) return;

    try {
      const { error } = await supabase
        .from("time_windows")
        .update({
          window_start: startTime,
          window_end: endTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingWindow.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Zeitfenster erfolgreich aktualisiert",
      });

      setIsAddWindowDialogOpen(false);
      setEditingWindow(null);
      resetForm();
      refetchWindows();
    } catch (error) {
      console.error("Error updating time window:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Zeitfensters",
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

  const resetForm = () => {
    setStartTime("");
    setEndTime("");
    setEditingWindow(null);
  };

  const handleStartEdit = (window: TimeWindow) => {
    setEditingWindow(window);
    setStartTime(window.window_start);
    setEndTime(window.window_end);
    setIsAddWindowDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zeitfenster Verwaltung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
            value={selectedProperty || ""}
            onValueChange={(value) => {
              setSelectedProperty(value);
              setSelectedDate(new Date());
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Immobilie auswählen" />
            </SelectTrigger>
            <SelectContent>
              {properties?.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProperty ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border-0"
                  locale={de}
                  fromDate={new Date()}
                />
              </div>

              <div className="space-y-4">
                {selectedDate && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Zeitfenster für {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
                      </h3>
                      <Dialog open={isAddWindowDialogOpen} onOpenChange={setIsAddWindowDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            resetForm();
                            setIsAddWindowDialogOpen(true);
                          }}>
                            Zeitfenster hinzufügen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingWindow ? "Zeitfenster bearbeiten" : "Neues Zeitfenster hinzufügen"}
                            </DialogTitle>
                          </DialogHeader>
                          <TimeWindowForm
                            date={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                            startTime={startTime}
                            endTime={endTime}
                            onDateChange={() => {}} // Date is controlled by calendar
                            onStartTimeChange={setStartTime}
                            onEndTimeChange={setEndTime}
                            onSubmit={editingWindow ? handleEditWindow : handleAddWindow}
                            isEditing={!!editingWindow}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

                    <TimeWindowsList
                      windows={timeWindows || []}
                      onDelete={handleDeleteWindow}
                      onEdit={handleStartEdit}
                    />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Bitte wählen Sie zuerst eine Immobilie aus, um Zeitfenster zu verwalten.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}