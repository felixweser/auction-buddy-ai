import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TitleStep } from "@/components/listing/TitleStep";
import { DescriptionStep } from "@/components/listing/DescriptionStep";
import { PriceStep } from "@/components/listing/PriceStep";
import { ImageStep } from "@/components/listing/ImageStep";
import { ListingFormData } from "@/types/listing";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreateListing = () => {
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
  const navigate = useNavigate();

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

      navigate('/my-items');
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
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-3xl font-bold">Create New Listing</h1>
            <div className="text-sm text-muted-foreground">
              Step {step} of 4
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

export default CreateListing;