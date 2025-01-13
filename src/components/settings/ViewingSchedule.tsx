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
import { TimeSlotsList } from "./TimeSlotsList";
import { SlotForm } from "./SlotForm";
import { generateTimeSlots } from "@/utils/slotGenerationUtils";

export function ViewingSchedule() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("15");
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const { data: session, isLoading: sessionLoading } = useQuery({
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

  // Fetch properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
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

  const { data: viewingSlots, refetch: refetchSlots } = useQuery({
    queryKey: ["viewing-slots", selectedProperty, selectedDate],
    enabled: !!selectedProperty && !!selectedDate && !!session?.user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", selectedProperty)
        .eq("slot_date", format(selectedDate!, 'yyyy-MM-dd'));

      if (error) throw error;
      return data;
    },
  });

  const handleAddSlot = async () => {
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
    const slots = generateTimeSlots({
      startTime,
      endTime,
      slotDuration: parseInt(slotDuration),
      bufferTime: parseInt(bufferTime),
      date: formattedDate,
    });

    try {
      const { error } = await supabase.from("property_viewing_slots").insert(
        slots.map(slot => ({
          property_id: selectedProperty,
          slot_date: formattedDate,
          start_time: slot.start,
          end_time: slot.end,
          slot_duration_minutes: parseInt(slotDuration),
          buffer_minutes: parseInt(bufferTime),
        }))
      );

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Besichtigungstermine erfolgreich hinzugefügt",
      });

      setIsAddSlotDialogOpen(false);
      resetForm();
      refetchSlots();
    } catch (error) {
      console.error("Error adding viewing slots:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen der Besichtigungstermine",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from("property_viewing_slots")
      .delete()
      .eq("id", slotId);

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Löschen des Besichtigungstermins",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Erfolg",
      description: "Besichtigungstermin erfolgreich gelöscht",
    });

    refetchSlots();
  };

  const handleEditSlot = (slot: any) => {
    setStartTime(slot.start_time);
    setEndTime(slot.end_time);
    setSlotDuration(slot.slot_duration_minutes.toString());
    setBufferTime(slot.buffer_minutes.toString());
    setEditingSlotId(slot.id);
    setIsAddSlotDialogOpen(true);
  };

  const resetForm = () => {
    setStartTime("");
    setEndTime("");
    setSlotDuration("30");
    setBufferTime("15");
    setEditingSlotId(null);
  };

  if (sessionLoading || propertiesLoading) {
    return <div>Laden...</div>;
  }

  if (!session) {
    return null; // The useQuery hook will handle the redirect
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Besichtigungstermine Verwaltung</CardTitle>
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

          {selectedProperty && (
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
                        Termine für {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
                      </h3>
                      <Dialog open={isAddSlotDialogOpen} onOpenChange={setIsAddSlotDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            resetForm();
                            setIsAddSlotDialogOpen(true);
                          }}>
                            Termin hinzufügen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingSlotId ? "Besichtigungstermin bearbeiten" : "Neuen Besichtigungstermin hinzufügen"}
                            </DialogTitle>
                          </DialogHeader>
                          <SlotForm
                            startTime={startTime}
                            endTime={endTime}
                            slotDuration={slotDuration}
                            bufferTime={bufferTime}
                            onStartTimeChange={setStartTime}
                            onEndTimeChange={setEndTime}
                            onSlotDurationChange={setSlotDuration}
                            onBufferTimeChange={setBufferTime}
                            onSubmit={handleAddSlot}
                            isEditing={!!editingSlotId}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

                    <TimeSlotsList
                      slots={viewingSlots || []}
                      onEdit={handleEditSlot}
                      onDelete={handleDeleteSlot}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
