import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import { StepProps } from "@/types/listing";

export const AddressStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-semibold">Property Address</h2>
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground">Address Line 1</label>
        <Input
          placeholder="Street address"
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Address Line 2 (Optional)</label>
        <Input
          placeholder="Apartment, suite, unit, etc."
          value={formData.addressLine2}
          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">City</label>
          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="text-lg mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">State</label>
          <Input
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="text-lg mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground">ZIP Code</label>
        <Input
          placeholder="ZIP Code"
          value={formData.zipCode}
          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
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
        disabled={!formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);