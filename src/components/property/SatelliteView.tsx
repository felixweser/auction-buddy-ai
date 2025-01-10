import { Property } from "@/types/property";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface SatelliteViewProps {
  property: Property;
}

export const SatelliteView = ({ property }: SatelliteViewProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Location</h2>
      
      {/* Location Information */}
      <div className="mb-6">
        <div className="flex items-start gap-4">
          <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
          <div className="space-y-1">
            <p className="text-lg">{property.address_line1}</p>
            {property.address_line2 && (
              <p className="text-lg">{property.address_line2}</p>
            )}
            <p className="text-lg">
              {property.city}, {property.state} {property.zip_code}
            </p>
          </div>
        </div>
      </div>

      {/* Satellite View Placeholder */}
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">3D satellite view coming soon</p>
      </div>
    </Card>
  );
};