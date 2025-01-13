import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function ViewingSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewingDuration, setViewingDuration] = useState("30");
  const [bufferTime, setBufferTime] = useState("15");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  // Check authentication status
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

  // Fetch existing settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["viewing-settings"],
    enabled: !!session?.user,
    queryFn: async () => {
      if (!session?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("property_viewing_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setViewingDuration(settings.viewing_duration.toString());
      setBufferTime(settings.buffer_time.toString());
      setStartTime(settings.default_time_window_start);
      setEndTime(settings.default_time_window_end);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      if (!session?.user) {
        toast({
          title: "Nicht authentifiziert",
          description: "Bitte melden Sie sich an",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("property_viewing_settings")
        .upsert({
          user_id: session.user.id,
          viewing_duration: parseInt(viewingDuration),
          buffer_time: parseInt(bufferTime),
          default_time_window_start: startTime,
          default_time_window_end: endTime,
        });

      if (error) throw error;

      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Einstellungen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Fehler",
        description: "Ihre Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  if (sessionLoading || settingsLoading) {
    return <div>Laden...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Besichtigungseinstellungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="viewingDuration">Besichtigungsdauer (Minuten)</Label>
            <Input
              id="viewingDuration"
              type="number"
              min="15"
              step="15"
              value={viewingDuration}
              onChange={(e) => setViewingDuration(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bufferTime">Pufferzeit (Minuten)</Label>
            <Input
              id="bufferTime"
              type="number"
              min="0"
              step="5"
              value={bufferTime}
              onChange={(e) => setBufferTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Standard Startzeit</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">Standard Endzeit</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">
          Einstellungen speichern
        </Button>
      </CardContent>
    </Card>
  );
}