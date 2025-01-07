import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { StepProps } from "@/types/listing";

export const PriceStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold">Set your price</h2>
    <Input
      type="number"
      placeholder="Enter price in €"
      value={formData.price}
      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
      className="text-lg"
    />
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="negotiable"
          checked={formData.isNegotiable}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, isNegotiable: checked as boolean })
          }
        />
        <label htmlFor="negotiable" className="text-sm">
          Price is negotiable
        </label>
      </div>
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
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Button 
        className="flex-1" 
        onClick={onNext}
        disabled={!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);