import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { TitleStep } from "@/components/listing/TitleStep";
import { DescriptionStep } from "@/components/listing/DescriptionStep";
import { PriceStep } from "@/components/listing/PriceStep";
import { ImageStep } from "@/components/listing/ImageStep";
import { ListingFormData } from "@/types/listing";

const CreateListing = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "",
    isNegotiable: false,
    shippingAvailable: false,
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
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

      const { error } = await supabase
        .from('listings')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            image_url: formData.imageUrl,
            created_by: user.id,
            is_negotiable: formData.isNegotiable,
            shipping_available: formData.shippingAvailable,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your listing has been created!",
      });

      navigate('/my-items');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const commonProps = {
      formData,
      setFormData,
    };

    switch (step) {
      case 1:
        return (
          <TitleStep
            {...commonProps}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <DescriptionStep
            {...commonProps}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <PriceStep
            {...commonProps}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        );
      case 4:
        return (
          <ImageStep
            {...commonProps}
            onNext={handleSubmit}
            onBack={() => setStep(3)}
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
        {renderStep()}
      </div>
    </div>
  );
};

export default CreateListing;