import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { StepProps } from "@/types/listing";

export const DescriptionStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-semibold">Describe your item</h2>
    <Textarea
      placeholder="Tell us more about what you're selling..."
      value={formData.description}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      className="min-h-[150px] text-lg"
    />
    <div className="flex gap-3">
      <Button variant="outline" onClick={onBack} className="animate-scale-in">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Button 
        className="flex-1 animate-scale-in" 
        onClick={onNext}
        disabled={!formData.description.trim()}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);