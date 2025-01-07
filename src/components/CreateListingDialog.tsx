import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TitleStep } from "./CreateListing/TitleStep";
import { DescriptionStep } from "./CreateListing/DescriptionStep";
import { PriceStep } from "./CreateListing/PriceStep";
import { ImageStep } from "./CreateListing/ImageStep";
import { ListingFormData } from "./CreateListing/types";

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