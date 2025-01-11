import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
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

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ViewingSchedule() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAddSlotDialogOpen, setIsAddSlotDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("15");
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

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

  const handleAddSlot = async () => {
    if (!selectedProperty || !selectedDate || !startTime || !endTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
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
        title: "Error",
        description: "Failed to add viewing slot",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Viewing slot added successfully",
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
        title: "Error",
        description: "Failed to delete viewing slot",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Viewing slot deleted successfully",
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
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Viewing Schedule Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select
            value={selectedProperty || ""}
            onValueChange={setSelectedProperty}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
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
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-4">
                {selectedDate && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Slots for {format(selectedDate, "EEEE, MMMM d")}
                      </h3>
                      <Dialog open={isAddSlotDialogOpen} onOpenChange={setIsAddSlotDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            resetForm();
                            setIsAddSlotDialogOpen(true);
                          }}>
                            Add Slot
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingSlotId ? "Edit Viewing Slot" : "Add New Viewing Slot"}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Slot Duration (minutes)</Label>
                                <Select value={slotDuration} onValueChange={setSlotDuration}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Buffer Time (minutes)</Label>
                                <Select value={bufferTime} onValueChange={setBufferTime}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select buffer time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">No buffer</SelectItem>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="10">10 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                  type="time"
                                  value={startTime}
                                  onChange={(e) => setStartTime(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                  type="time"
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                                />
                              </div>
                            </div>
                            <Button onClick={handleAddSlot}>
                              {editingSlotId ? "Update Slot" : "Add Slot"}
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
                              {format(new Date(`2024-01-01T${slot.start_time}`), "h:mm a")} -{" "}
                              {format(new Date(`2024-01-01T${slot.end_time}`), "h:mm a")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {slot.slot_duration_minutes} min slots with {slot.buffer_minutes} min buffer
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSlot(slot)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      {viewingSlots?.length === 0 && (
                        <p className="text-muted-foreground">
                          No viewing slots set for this day
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