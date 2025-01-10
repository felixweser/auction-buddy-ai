import { Card } from "@/components/ui/card";

export const FloorPlan = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Interactive Floor Plan</h2>
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Interactive floor plan coming soon</p>
      </div>
    </Card>
  );
};