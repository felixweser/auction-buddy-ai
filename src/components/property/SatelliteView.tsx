import { Card } from "@/components/ui/card";

export const SatelliteView = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">3D Satellite View</h2>
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">3D satellite view coming soon</p>
      </div>
    </Card>
  );
};