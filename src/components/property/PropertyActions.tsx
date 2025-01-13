import { Button } from "@/components/ui/button";
import { Calendar, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PropertyActionsProps {
  onBookingClick: () => void;
}

export function PropertyActions({ onBookingClick }: PropertyActionsProps) {
  const { toast } = useToast();

  const handleVirtualTour = () => {
    toast({
      title: "Demnächst verfügbar",
      description: "Virtuelle Besichtigungen werden in Kürze verfügbar sein!",
    });
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center space-x-3">
      <Button variant="agora" onClick={onBookingClick}>
        <Calendar />
        <span>Besichtigung planen</span>
      </Button>
      <Button variant="agora" onClick={handleVirtualTour}>
        <Video />
        <span>Virtuelle Tour</span>
      </Button>
    </div>
  );
}