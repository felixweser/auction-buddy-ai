import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PropertyActions() {
  const { toast } = useToast();

  const handleVirtualTour = () => {
    toast({
      title: "Demnächst verfügbar",
      description: "Virtuelle Besichtigungen werden in Kürze verfügbar sein!",
    });
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center space-x-3">
      <Button variant="agora" onClick={handleVirtualTour}>
        <Video />
        <span>Virtuelle Tour</span>
      </Button>
    </div>
  );
}