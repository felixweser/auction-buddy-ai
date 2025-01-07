import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Image } from "lucide-react";
import { ListingFormData } from "./types";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  formData: ListingFormData;
  setFormData: (data: ListingFormData) => void;
}

export const ImageStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold">Add photos</h2>
    <Input
      placeholder="Image URL"
      value={formData.imageUrl}
      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
      className="text-lg"
    />
    {formData.imageUrl && (
      <div className="aspect-video rounded-lg overflow-hidden bg-accent">
        <img
          src={formData.imageUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
    )}
    <div className="flex gap-3">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Button 
        className="flex-1" 
        onClick={onNext}
        disabled={!formData.imageUrl}
      >
        Create Listing <Image className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);