import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
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

export function ViewingSchedule() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("15");
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Fetch properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("created_by", user.id);

      if (error) throw error;
      return data as Property[];
    },
  });

  // Fetch viewing slots for the selected date and property
  const { data: viewingSlots, refetch: refetchSlots } = useQuery({
    queryKey: ["viewing-slots", selectedProperty, selectedDate],
    enabled: !!selectedProperty && !!selectedDate,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", selectedProperty)
        .eq("slot_date", selectedDate?.toISOString().split('T')[0]);

      if (error) throw error;
      return data;
    },
  });

  const handleAddSlot = async () => {
    if (!selectedProperty || !selectedDate || !startTime || !endTime) {
      toast({
        title: "Fehlende Informationen",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("property_viewing_slots").insert({
      property_id: selectedProperty,
      slot_date: selectedDate.toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      slot_duration_minutes: parseInt(slotDuration),
      buffer_minutes: parseInt(bufferTime),
    });

    if (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Hinzufügen des Besichtigungstermins",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Erfolg",
      description: "Besichtigungstermin erfolgreich hinzugefügt",
    });

    setIsAddSlotDialogOpen(false);
    resetForm();
    refetchSlots();
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

  if (propertiesLoading) {
    return <div>Laden...</div>;
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