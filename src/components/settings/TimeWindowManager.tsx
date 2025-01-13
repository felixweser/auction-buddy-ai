import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { CalendarSection } from "./time-windows/CalendarSection";
import { PropertySelect } from "./time-windows/PropertySelect";
import { TimeWindowDialog } from "./time-windows/TimeWindowDialog";
import { TimeWindowsList } from "./TimeWindowsList";
import { useTimeWindows } from "./time-windows/useTimeWindows";

export function TimeWindowManager() {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddWindowDialogOpen, setIsAddWindowDialogOpen] = useState(false);

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

  const {
    timeWindows,
    editingWindow,
    setEditingWindow,
    handleAddWindow,
    handleEditWindow,
    handleDeleteWindow,
  } = useTimeWindows({
    selectedProperty,
    selectedDate,
    session,
  });

  const handleStartEdit = (window: TimeWindow) => {
    setEditingWindow(window);
    setIsAddWindowDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zeitfenster Verwaltung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PropertySelect
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertyChange={(value) => {
              setSelectedProperty(value);
              setSelectedDate(new Date());
            }}
          />

          {selectedProperty ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CalendarSection 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />

              <TimeWindowDialog
                isOpen={isAddWindowDialogOpen}
                onOpenChange={setIsAddWindowDialogOpen}
                selectedDate={selectedDate}
                editingWindow={editingWindow}
                onAdd={handleAddWindow}
                onEdit={handleEditWindow}
                onClose={() => {
                  setEditingWindow(null);
                  setIsAddWindowDialogOpen(false);
                }}
              />

              <div className="space-y-4">
                {selectedDate && (
                  <TimeWindowsList
                    windows={timeWindows || []}
                    onDelete={handleDeleteWindow}
                    onEdit={handleStartEdit}
                    onOpenDialog={() => setIsAddWindowDialogOpen(true)}
                  />
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