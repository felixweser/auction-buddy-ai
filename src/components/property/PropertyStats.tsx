import { PropertyDetails } from "@/types/property";
import { 
  Home,
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
      label: "Price",
      value: `€${price.toLocaleString()}`,
      icon: Home,
    },
    {
      label: "Square Feet",
      value: details.square_footage.toLocaleString(),
      icon: Ruler,
    },
    {
      label: "Bedrooms",
      value: details.bedrooms,
      icon: BedDouble,
    },
    {
      label: "Bathrooms",
      value: details.bathrooms,
      icon: Bath,
    },
    {
      label: "Year Built",
      value: details.year_built,
      icon: Calendar,
    },
    {
      label: "Energy Rating",
      value: "A+",
      icon: Zap,
    },
  ];

  return (
    <div className="w-full bg-white/90 py-4 px-4 z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};