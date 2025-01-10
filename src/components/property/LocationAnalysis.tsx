import { Card } from "@/components/ui/card";

export const LocationAnalysis = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">KI-generierte Lageanalyse</h2>
      <div className="prose prose-sm max-w-none">
        <p>
          Diese Lage bietet eine einzigartige Mischung aus städtischem Komfort und Wohncharme. 
          Die Nachbarschaft bietet ausgezeichneten Zugang zu öffentlichen Verkehrsmitteln, 
          Einkaufsmöglichkeiten und Restaurants bei gleichzeitiger Wahrung einer ruhigen Atmosphäre.
        </p>
        <ul className="mt-4">
          <li>Gehbarkeits-Score: 85/100</li>
          <li>ÖPNV-Score: 90/100</li>
          <li>Lärmbelastung: Moderat</li>
          <li>Grünflächen: Mehrere Parks in Gehweite</li>
        </ul>
      </div>
    </Card>
  );
};