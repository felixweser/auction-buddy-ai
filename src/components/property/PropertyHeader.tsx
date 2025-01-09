import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Calendar, Video } from "lucide-react";

interface PropertyHeaderProps {
  property: Property;
  onScheduleTour: () => void;
  onWatchVideo: () => void;
}

export const PropertyHeader = ({ property, onScheduleTour, onWatchVideo }: PropertyHeaderProps) => {
  return (
    <div className="relative min-h-[80vh] group">
      <div className="absolute inset-0">
        <img
          src={property.image_url}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <h1 className="text-4xl font-bold text-white">{property.title}</h1>
        <div className="flex items-baseline gap-4">
          <p className="text-3xl font-bold text-white">
            €{property.price.toLocaleString()}
          </p>
          {property.is_negotiable && (
            <span className="text-sm text-white/80">Negotiable</span>
          )}
        </div>
        
        <div className="flex gap-4 mt-6">
          <Button 
            size="lg" 
            className="bg-white/90 text-foreground hover:bg-white"
            onClick={onScheduleTour}
          >
            <Calendar className="mr-2" />
            Schedule Virtual Tour
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-background/50 text-white border-white/20 hover:bg-background/70"
            onClick={onWatchVideo}
          >
            <Video className="mr-2" />
            Watch Video Tour
          </Button>
        </div>
      </div>
    </div>
  );
};