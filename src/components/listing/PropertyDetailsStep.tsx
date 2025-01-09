import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Home } from "lucide-react";
import { StepProps } from "@/types/listing";

export const PropertyDetailsStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-semibold">Property Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-muted-foreground">Year Built</label>
        <Input
          type="number"
          placeholder="Year built"
          value={formData.yearBuilt}
          onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Square Footage</label>
        <Input
          type="number"
          placeholder="Square footage"
          value={formData.squareFootage}
          onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Bedrooms</label>
        <Input
          type="number"
          placeholder="Number of bedrooms"
          value={formData.bedrooms}
          onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Bathrooms</label>
        <Input
          type="number"
          placeholder="Number of bathrooms"
          value={formData.bathrooms}
          onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
          className="text-lg mt-1"
          step="0.5"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Heating System</label>
        <Input
          placeholder="Heating system type"
          value={formData.heatingSystem}
          onChange={(e) => setFormData({ ...formData, heatingSystem: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Cooling System</label>
        <Input
          placeholder="Cooling system type"
          value={formData.coolingSystem}
          onChange={(e) => setFormData({ ...formData, coolingSystem: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
    </div>
    <div className="flex gap-3">
      <Button variant="outline" onClick={onBack} className="animate-scale-in">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Button 
        className="flex-1 animate-scale-in" 
        onClick={onNext}
        disabled={!formData.yearBuilt || !formData.squareFootage || !formData.bedrooms || !formData.bathrooms}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);