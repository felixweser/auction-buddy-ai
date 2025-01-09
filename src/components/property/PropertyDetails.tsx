import { PropertyDetails as PropertyDetailsType } from "@/types/property";
import { Card } from "@/components/ui/card";
import { 
  Home,
  CalendarClock,
  Ruler,
  BedDouble,
  Bath,
  Thermometer,
  Wind
} from "lucide-react";

interface PropertyDetailsProps {
  details: PropertyDetailsType;
}

export const PropertyDetailsSection = ({ details }: PropertyDetailsProps) => {
  return (
    <div className="py-12">
      <h2 className="text-2xl font-semibold mb-6">Property Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-5 w-5" />
            <span>Year Built</span>
          </div>
          <p className="text-2xl font-semibold">{details.year_built}</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ruler className="h-5 w-5" />
            <span>Square Footage</span>
          </div>
          <p className="text-2xl font-semibold">{details.square_footage} sq ft</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BedDouble className="h-5 w-5" />
            <span>Bedrooms</span>
          </div>
          <p className="text-2xl font-semibold">{details.bedrooms}</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bath className="h-5 w-5" />
            <span>Bathrooms</span>
          </div>
          <p className="text-2xl font-semibold">{details.bathrooms}</p>
        </Card>

        {details.heating_system && (
          <Card className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Thermometer className="h-5 w-5" />
              <span>Heating System</span>
            </div>
            <p className="text-2xl font-semibold">{details.heating_system}</p>
          </Card>
        )}

        {details.cooling_system && (
          <Card className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wind className="h-5 w-5" />
              <span>Cooling System</span>
            </div>
            <p className="text-2xl font-semibold">{details.cooling_system}</p>
          </Card>
        )}
      </div>
    </div>
  );
};