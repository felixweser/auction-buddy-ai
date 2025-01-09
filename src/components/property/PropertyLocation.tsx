import { Property } from "@/types/property";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PropertyLocationProps {
  property: Property;
}

export const PropertyLocation = ({ property }: PropertyLocationProps) => {
  return (
    <div className="py-12">
      <h2 className="text-2xl font-semibold mb-6">Location</h2>
      <Card className="p-6">
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
      </Card>
    </div>
  );
};