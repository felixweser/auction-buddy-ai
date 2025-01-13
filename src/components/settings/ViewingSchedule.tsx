import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DAYS_OF_WEEK = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export function ViewingSchedule() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Initialize with current date
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

  // Fetch all viewing slots for the selected property
  const { data: allViewingSlots } = useQuery({
    queryKey: ["all-viewing-slots", selectedProperty],
    enabled: !!selectedProperty,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", selectedProperty);

      if (error) throw error;
      return data;
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
        .eq("day_of_week", selectedDate?.getDay());

      if (error) throw error;
      return data;
    },
  });

  // Create a set of days that have slots for the selected property
  const daysWithSlots = useMemo(() => {
    if (!allViewingSlots) return new Set<number>();
    return new Set(allViewingSlots.map(slot => slot.day_of_week));
  }, [allViewingSlots]);

  // Function to check if a date is in the past (including today)
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Custom modifiers for the calendar
  const modifiers = useMemo(() => ({
    hasSlots: (date: Date) => {
      // Only show slots for future dates
      if (isPastDate(date)) return false;
      return daysWithSlots.has(date.getDay());
    },
    today: (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    }
  }), [daysWithSlots]);

  // Custom modifier styles using the site's color scheme
  const modifiersStyles = {
    hasSlots: {
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      color: 'hsl(var(--primary))',
      fontWeight: 'bold',
      borderRadius: 'var(--radius)'
    },
    today: {
      backgroundColor: 'hsl(var(--accent))',
      color: 'hsl(var(--accent-foreground))',
      fontWeight: 'bold',
      borderRadius: 'var(--radius)'
    }
  };

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
      day_of_week: selectedDate.getDay(),
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
              setSelectedDate(new Date()); // Reset to current date when property changes
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
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  disabled={isPastDate}
                  fromDate={new Date()} // Only allow future dates
                  defaultMonth={selectedDate}
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Tage mit Besichtigungsterminen sind hervorgehoben</p>
                  <p>Vergangene Tage sind nicht auswählbar</p>
                </div>
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
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Terminlänge (Minuten)</Label>
                                <Select value={slotDuration} onValueChange={setSlotDuration}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Dauer auswählen" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="15">15 Minuten</SelectItem>
                                    <SelectItem value="30">30 Minuten</SelectItem>
                                    <SelectItem value="45">45 Minuten</SelectItem>
                                    <SelectItem value="60">1 Stunde</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Pufferzeit (Minuten)</Label>
                                <Select value={bufferTime} onValueChange={setBufferTime}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pufferzeit auswählen" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">Kein Puffer</SelectItem>
                                    <SelectItem value="5">5 Minuten</SelectItem>
                                    <SelectItem value="10">10 Minuten</SelectItem>
                                    <SelectItem value="15">15 Minuten</SelectItem>
                                    <SelectItem value="30">30 Minuten</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Startzeit</Label>
                                <Input
                                  type="time"
                                  value={startTime}
                                  onChange={(e) => setStartTime(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Endzeit</Label>
                                <Input
                                  type="time"
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                                />
                              </div>
                            </div>
                            <Button onClick={handleAddSlot}>
                              {editingSlotId ? "Termin aktualisieren" : "Termin hinzufügen"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-2">
                      {viewingSlots?.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div className="space-y-1">
                            <div>
                              {format(new Date(`2024-01-01T${slot.start_time}`), "HH:mm", { locale: de })} -{" "}
                              {format(new Date(`2024-01-01T${slot.end_time}`), "HH:mm", { locale: de })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {slot.slot_duration_minutes} Min. Termine mit {slot.buffer_minutes} Min. Puffer
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSlot(slot)}
                            >
                              Bearbeiten
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              Löschen
                            </Button>
                          </div>
                        </div>
                      ))}
                      {viewingSlots?.length === 0 && (
                        <p className="text-muted-foreground">
                          Keine Besichtigungstermine für diesen Tag
                        </p>
                      )}
                    </div>
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