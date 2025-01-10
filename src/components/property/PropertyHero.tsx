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

interface PropertyHeroProps {
  imageUrl: string;
  title: string;
  price: number;
  details: PropertyDetails;
}

export const PropertyHero = ({ imageUrl, title, price, details }: PropertyHeroProps) => {
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Temporary images array - in production this would come from props
  const images = [imageUrl, imageUrl, imageUrl];

  const handleScheduleViewing = () => {
    toast({
      title: "Coming Soon",
      description: "Viewing scheduling will be available soon!",
    });
  };

  const handleVirtualTour = () => {
    toast({
      title: "Coming Soon",
      description: "Virtual tours will be available soon!",
    });
  };

  return (
    <div className="relative h-[70vh] group">
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-3">
        <Button 
          size="sm"
          className="bg-white/90 text-foreground hover:bg-white"
          onClick={handleScheduleViewing}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Viewing
        </Button>
        <Button 
          size="sm"
          variant="outline" 
          className="bg-background/50 text-white border-white/20 hover:bg-background/70"
          onClick={handleVirtualTour}
        >
          <Video className="mr-2 h-4 w-4" />
          Virtual Tour
        </Button>
      </div>

      <Carousel className="w-full h-full">
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index} className="h-[70vh]">
              <div className="relative w-full h-full">
                <img
                  src={img}
                  alt={`${title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
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