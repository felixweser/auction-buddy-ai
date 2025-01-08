import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { StepProps } from "@/types/listing";

export const PriceStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-semibold">Set your price</h2>
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground">Minimum Price</label>
        <Input
          type="number"
          placeholder="Enter minimum price in €"
          value={formData.minPrice}
          onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Desired Price</label>
        <Input
          type="number"
          placeholder="Enter desired price in €"
          value={formData.desiredPrice}
          onChange={(e) => setFormData({ ...formData, desiredPrice: e.target.value })}
          className="text-lg mt-1"
        />
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="shipping"
          checked={formData.shippingAvailable}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, shippingAvailable: checked as boolean })
          }
        />
        <label htmlFor="shipping" className="text-sm">
          Shipping available
        </label>
      </div>
    </div>
    <div className="flex gap-3">
      <Button variant="outline" onClick={onBack} className="animate-scale-in">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Button 
        className="flex-1 animate-scale-in" 
        onClick={onNext}
        disabled={!formData.minPrice || !formData.desiredPrice || 
                 Number(formData.minPrice) <= 0 || Number(formData.desiredPrice) <= 0 ||
                 Number(formData.desiredPrice) < Number(formData.minPrice)}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);