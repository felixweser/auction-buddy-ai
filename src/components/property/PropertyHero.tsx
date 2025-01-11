import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Calendar, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PropertyDetails } from "@/types/property";
import { PropertyStats } from "./PropertyStats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PropertyHeroProps {
  imageUrl: string;
  title: string;
  price: number;
  details: PropertyDetails;
}

export const PropertyHero = ({ imageUrl, title, price, details }: PropertyHeroProps) => {
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showViewingDialog, setShowViewingDialog] = useState(false);

  const images = [imageUrl, imageUrl, imageUrl];

  const { data: viewingSlots, isLoading } = useQuery({
    queryKey: ["viewingSlots", details.property_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_viewing_slots")
        .select("*")
        .eq("property_id", details.property_id)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;
      return data;
    },
    enabled: showViewingDialog,
  });

  const getDayName = (dayOfWeek: number) => {
    const date = new Date(2024, 0, dayOfWeek);
    return format(date, "EEEE", { locale: de });
  };

  const handleVirtualTour = () => {
    toast({
      title: "Demnächst verfügbar",
      description: "Virtuelle Besichtigungen werden in Kürze verfügbar sein!",
    });
  };

  return (
    <div className="relative h-[70vh] group">
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-3">
        <Button 
          variant="agora"
          onClick={() => setShowViewingDialog(true)}
        >
          <Calendar />
          <span>Besichtigung planen</span>
        </Button>
        <Button 
          variant="agora"
          onClick={handleVirtualTour}
        >
          <Video />
          <span>Virtuelle Tour</span>
        </Button>
      </div>

      <Dialog open={showViewingDialog} onOpenChange={setShowViewingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verfügbare Besichtigungstermine</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Lade Termine...</p>
            ) : viewingSlots && viewingSlots.length > 0 ? (
              <div className="space-y-4">
                {viewingSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{getDayName(slot.day_of_week)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(`2024-01-01T${slot.start_time}`), 'HH:mm')} - 
                        {format(new Date(`2024-01-01T${slot.end_time}`), 'HH:mm')}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Termin angefragt",
                          description: "Wir werden uns in Kürze bei Ihnen melden!",
                        });
                        setShowViewingDialog(false);
                      }}
                    >
                      Auswählen
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Keine Besichtigungstermine verfügbar
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Carousel className="w-full h-full">
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index} className="h-[70vh]">
              <div className="relative w-full h-full">
                <img
                  src={img}
                  alt={`${title} - Bild ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Carousel>

      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <div className="max-w-7xl mx-auto space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-3xl font-bold text-foreground">
              €{price.toLocaleString()}
            </p>
          </div>
          <PropertyStats price={price} details={details} />
        </div>
      </div>
    </div>
  );
};