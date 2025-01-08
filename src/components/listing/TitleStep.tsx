import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { StepProps } from "@/types/listing";

export const TitleStep = ({ onNext, formData, setFormData }: StepProps) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-semibold">What are you selling?</h2>
    <Input
      placeholder="Enter a title for your listing"
      value={formData.title}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      className="text-lg"
    />
    <Button 
      className="w-full animate-scale-in" 
      onClick={onNext}
      disabled={!formData.title.trim()}
    >
      Continue <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);