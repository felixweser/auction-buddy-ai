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
import { TitleStep } from "./listing/TitleStep";
import { DescriptionStep } from "./listing/DescriptionStep";
import { PriceStep } from "./listing/PriceStep";
import { ImageStep } from "./listing/ImageStep";
import { ListingFormData } from "@/types/listing";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price) {
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a listing",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('listings')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            image_url: formData.imageUrl || 'https://via.placeholder.com/400',
            is_negotiable: formData.isNegotiable,
            shipping_available: formData.shippingAvailable,
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        toast({
          title: "Error",
          description: "Failed to create listing. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Listing created successfully!",
      });

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
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
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