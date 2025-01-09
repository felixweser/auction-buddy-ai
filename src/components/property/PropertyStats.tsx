import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home,
  Ruler,
  BedDouble,
  Bath,
  Calendar,
  Zap
} from "lucide-react";
import { PropertyDetails } from "@/types/property";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      tooltip: "Current listing price",
    },
    {
      label: "Square Feet",
      value: details.square_footage.toLocaleString(),
      icon: Ruler,
      tooltip: "Total living area",
    },
    {
      label: "Bedrooms",
      value: details.bedrooms,
      icon: BedDouble,
      tooltip: "Number of bedrooms",
    },
    {
      label: "Bathrooms",
      value: details.bathrooms,
      icon: Bath,
      tooltip: "Number of bathrooms",
    },
    {
      label: "Year Built",
      value: details.year_built,
      icon: Calendar,
      tooltip: "Year of construction",
    },
    {
      label: "Energy Rating",
      value: "A+",
      icon: Zap,
      tooltip: "Energy efficiency rating",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <stat.icon className="h-6 w-6 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="text-xl font-semibold">
                      {stat.value}
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};