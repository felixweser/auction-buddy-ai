import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Plus, ArrowRight, ArrowLeft, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  isNegotiable: boolean;
  shippingAvailable: boolean;
}

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  formData: ListingFormData;
  setFormData: (data: ListingFormData) => void;
}

const TitleStep = ({ onNext, formData, setFormData }: StepProps) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold">What are you selling?</h2>
    <Input
      placeholder="Enter a title for your listing"
      value={formData.title}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      className="text-lg"
    />
    <Button 
      className="w-full" 
      onClick={onNext}
      disabled={!formData.title.trim()}
    >
      Continue <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
);

const DescriptionStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold">Describe your item</h2>
    <Textarea
      placeholder="Tell us more about what you're selling..."
      value={formData.description}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      className="min-h-[150px] text-lg"
    />
    <div className="flex gap-3">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Button 
        className="flex-1" 
        onClick={onNext}
        disabled={!formData.description.trim()}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);

const PriceStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold">Set your price</h2>
    <Input
      type="number"
      placeholder="Enter price in VB"
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

const ImageStep = ({ onNext, onBack, formData, setFormData }: StepProps) => (
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

export const CreateListingDialog = ({ onListingCreated }: { onListingCreated: (listing: ListingFormData) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    isNegotiable: false,
    shippingAvailable: false,
  });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.price || !formData.imageUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      });
      return;
    }

    onListingCreated(formData);
    setFormData({
      title: "",
      description: "",
      price: "",
      imageUrl: "",
      isNegotiable: false,
      shippingAvailable: false,
    });
    setStep(1);
    setOpen(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <TitleStep
            onNext={() => setStep(2)}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 2:
        return (
          <DescriptionStep
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <PriceStep
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <ImageStep
            onNext={handleSubmit}
            onBack={() => setStep(3)}
            formData={formData}
            setFormData={setFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setStep(1);
        setFormData({
          title: "",
          description: "",
          price: "",
          imageUrl: "",
          isNegotiable: false,
          shippingAvailable: false,
        });
      }
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6">
          <Plus className="mr-2 h-4 w-4" /> Create Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};