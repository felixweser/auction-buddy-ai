import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyDetails } from "@/types/property";
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
  details: PropertyDetails;
}

export const PropertySpecs = ({ details }: PropertySpecsProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Property Details</h2>
      <Tabs defaultValue="specs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specs">Technical Details</TabsTrigger>
          <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Square Footage</p>
                <p className="font-medium">{details.square_footage} sq ft</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Bedrooms</p>
                <p className="font-medium">{details.bedrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Bathrooms</p>
                <p className="font-medium">{details.bathrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Heating</p>
                <p className="font-medium">{details.heating_system || "N/A"}</p>
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
              <span>Property Deed</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Floor Plan Document</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Property Report</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};