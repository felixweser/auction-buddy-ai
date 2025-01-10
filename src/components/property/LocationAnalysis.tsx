import { Card } from "@/components/ui/card";

export const LocationAnalysis = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">AI-Generated Location Analysis</h2>
      <div className="prose prose-sm max-w-none">
        <p>
          This location offers a unique blend of urban convenience and residential charm. 
          The neighborhood provides excellent access to public transportation, shopping, 
          and dining options while maintaining a peaceful atmosphere.
        </p>
        <ul className="mt-4">
          <li>Walkability Score: 85/100</li>
          <li>Transit Score: 90/100</li>
          <li>Noise Level: Moderate</li>
          <li>Green Spaces: Multiple parks within walking distance</li>
        </ul>
      </div>
    </Card>
  );
};