import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ViewingSchedule() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Fetch user's properties
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

  // Fetch viewing slots for selected property
  const { data: viewingSlots, refetch: refetchSlots } = useQuery({
    queryKey: ["viewing-slots", selectedProperty],
    enabled: !!selectedProperty,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", selectedProperty)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;
      return data;
    },
  });

  const handleAddSlot = async () => {
    if (!selectedProperty || !selectedDay || !startTime || !endTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("property_viewing_slots").insert({
      property_id: selectedProperty,
      day_of_week: DAYS_OF_WEEK.indexOf(selectedDay),
      start_time: startTime,
      end_time: endTime,
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

    // Reset form and refresh slots
    setSelectedDay(null);
    setStartTime("");
    setEndTime("");
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
          <div className="space-y-4">
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
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add New Viewing Slot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={selectedDay || ""} onValueChange={setSelectedDay}>
                      <SelectTrigger>
                        <SelectValue placeholder="Day of week" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="Start time"
                    />
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="End time"
                    />
                    <Button onClick={handleAddSlot}>Add Slot</Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Viewing Slots</h3>
                  <div className="space-y-2">
                    {viewingSlots?.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div>
                          <span className="font-medium">
                            {DAYS_OF_WEEK[slot.day_of_week]}:
                          </span>{" "}
                          {format(new Date(`2024-01-01T${slot.start_time}`), "h:mm a")} -{" "}
                          {format(new Date(`2024-01-01T${slot.end_time}`), "h:mm a")}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                    {viewingSlots?.length === 0 && (
                      <p className="text-muted-foreground">
                        No viewing slots set for this property
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}