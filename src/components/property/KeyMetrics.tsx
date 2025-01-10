import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Property } from "@/types/property";

interface KeyMetricsProps {
  property: Property;
}

const historicalPriceData = [
  { month: 'Jan', price: 450000 },
  { month: 'Feb', price: 455000 },
  { month: 'Mar', price: 460000 },
  { month: 'Apr', price: 465000 },
  { month: 'May', price: 470000 },
  { month: 'Jun', price: 475000 },
];

const percentileData = [
  { price: '400k', count: 10 },
  { price: '450k', count: 25 },
  { price: '500k', count: 40 },
  { price: '550k', count: 25 },
  { price: '600k', count: 10 },
];

const costProjectionData = [
  { year: '2024', mortgage: 24000, utilities: 3600, taxes: 5000, maintenance: 2400 },
  { year: '2025', mortgage: 24000, utilities: 3700, taxes: 5100, maintenance: 2500 },
  { year: '2026', mortgage: 24000, utilities: 3800, taxes: 5200, maintenance: 2600 },
];

const charts = [
  { id: 'price-per-sqm', label: 'Price per Square Meter' },
  { id: 'historical-price', label: 'Historical Prices' },
  { id: 'percentile', label: 'Price Position' },
  { id: 'cost-projection', label: 'Cost Projection' },
];

export const KeyMetrics = ({ property }: KeyMetricsProps) => {
  const [activeChart, setActiveChart] = useState(charts[0].id);

  // Check if we have valid property data
  if (!property || !property.property_details?.[0]) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Key Metrics & Comparisons</h2>
        <p className="text-muted-foreground">Property details are not available.</p>
      </Card>
    );
  }

  // Calculate price per square meter
  const pricePerSqm = property.price / property.property_details[0].square_footage;
  const avgNeighborhoodPricePerSqm = pricePerSqm * 0.9; // Example: 90% of property's price for demonstration

  const priceComparisonData = [
    { name: 'This Property', value: Math.round(pricePerSqm) },
    { name: 'Neighborhood Avg', value: Math.round(avgNeighborhoodPricePerSqm) },
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'price-per-sqm':
        return (
          <div className="h-[300px]">
            <h3 className="text-lg font-medium mb-4 text-foreground">Price per Square Meter vs. Neighborhood</h3>
            <ResponsiveContainer>
              <BarChart data={priceComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}/m²`} />
                <Bar dataKey="value" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'historical-price':
        return (
          <div className="h-[300px]">
            <h3 className="text-lg font-medium mb-4 text-foreground">Historical Price Development</h3>
            <ResponsiveContainer>
              <LineChart data={historicalPriceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#4f46e5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'percentile':
        return (
          <div className="h-[300px]">
            <h3 className="text-lg font-medium mb-4 text-foreground">Price Position Distribution</h3>
            <ResponsiveContainer>
              <AreaChart data={percentileData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="price" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" fill="#4f46e5" stroke="#4f46e5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'cost-projection':
        return (
          <div className="h-[300px]">
            <h3 className="text-lg font-medium mb-4 text-foreground">Total Cost of Ownership Projection</h3>
            <ResponsiveContainer>
              <BarChart data={costProjectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mortgage" stackId="a" fill="#4f46e5" />
                <Bar dataKey="utilities" stackId="a" fill="#818cf8" />
                <Bar dataKey="taxes" stackId="a" fill="#a5b4fc" />
                <Bar dataKey="maintenance" stackId="a" fill="#c7d2fe" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">Key Metrics & Comparisons</h2>
      <div className="flex gap-6">
        <NavigationMenu orientation="vertical" className="min-w-[200px]">
          <NavigationMenuList className="flex-col items-start space-y-2">
            {charts.map((chart) => (
              <NavigationMenuItem key={chart.id}>
                <NavigationMenuLink
                  href={`#${chart.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveChart(chart.id);
                  }}
                  className={cn(
                    "block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-md w-full",
                    activeChart === chart.id && "bg-accent text-accent-foreground"
                  )}
                >
                  {chart.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1">
          {renderChart()}
        </div>
      </div>
    </Card>
  );
};