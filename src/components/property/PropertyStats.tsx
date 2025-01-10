import { PropertyDetails } from "@/types/property";
import { 
  Ruler,
  BedDouble,
  Bath,
  Calendar,
  Zap
} from "lucide-react";

interface PropertyStatsProps {
  price: number;
  details: PropertyDetails;
}

export const PropertyStats = ({ price, details }: PropertyStatsProps) => {
  const stats = [
    {
      label: "Quadratmeter",
      value: details.square_footage.toLocaleString(),
      icon: Ruler,
    },
    {
      label: "Schlafzimmer",
      value: details.bedrooms,
      icon: BedDouble,
    },
    {
      label: "Badezimmer",
      value: details.bathrooms,
      icon: Bath,
    },
    {
      label: "Baujahr",
      value: details.year_built,
      icon: Calendar,
    },
    {
      label: "Energieeffizienz",
      value: "A+",
      icon: Zap,
    },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-6 bg-white/90 backdrop-blur-sm rounded-lg p-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          <stat.icon className="h-5 w-5 text-foreground" />
          <div>
            <div className="text-sm font-medium text-foreground">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};