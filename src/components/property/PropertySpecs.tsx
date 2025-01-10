import { PropertyDetails as PropertyDetailsType } from "@/types/property";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Image as ImageIcon,
  Ruler,
  BedDouble,
  Bath,
  Thermometer,
  Wind
} from "lucide-react";

interface PropertySpecsProps {
  details: PropertyDetailsType;
}

export const PropertySpecs = ({ details }: PropertySpecsProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Immobiliendetails</h2>
      <Tabs defaultValue="specs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specs">Technische Details</TabsTrigger>
          <TabsTrigger value="gallery">Fotogalerie</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Wohnfläche</p>
                <p className="font-medium">{details.square_footage} m²</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Schlafzimmer</p>
                <p className="font-medium">{details.bedrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Badezimmer</p>
                <p className="font-medium">{details.bathrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Heizung</p>
                <p className="font-medium">{details.heating_system || "k.A."}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="gallery" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Grundbuchauszug</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Grundriss-Dokument</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Immobilienbericht</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};