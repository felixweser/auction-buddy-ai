import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TitleStep } from "@/components/listing/TitleStep";
import { DescriptionStep } from "@/components/listing/DescriptionStep";
import { PriceStep } from "@/components/listing/PriceStep";
import { ImageStep } from "@/components/listing/ImageStep";
import { publishListing } from "@/utils/listingUtils";
import type { ListingData } from "@/types/listing";

export default function CreateListing() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    minPrice: "",
    desiredPrice: "",
    imageUrl: "",
    isNegotiable: false,
    shippingAvailable: false
  });

  const navigate = useNavigate();

  const handleManualNext = async () => {
    if (currentStep === 3) {
      const listing: ListingData = {
        title: formData.title,
        description: formData.description,
        minPrice: parseFloat(formData.minPrice),
        desiredPrice: parseFloat(formData.desiredPrice),
        imageUrl: formData.imageUrl,
        isNegotiable: formData.isNegotiable,
        shippingAvailable: formData.shippingAvailable
      };

      const success = await publishListing(listing);
      if (success) {
        navigate('/my-items');
      }
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleManualBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const steps = [
    <TitleStep 
      key="title" 
      onNext={handleManualNext} 
      formData={formData} 
      setFormData={setFormData} 
    />,
    <DescriptionStep 
      key="description" 
      onNext={handleManualNext} 
      onBack={handleManualBack} 
      formData={formData} 
      setFormData={setFormData} 
    />,
    <PriceStep 
      key="price" 
      onNext={handleManualNext} 
      onBack={handleManualBack} 
      formData={formData} 
      setFormData={setFormData} 
    />,
    <ImageStep 
      key="image" 
      onNext={handleManualNext} 
      onBack={handleManualBack} 
      formData={formData} 
      setFormData={setFormData} 
    />
  ];

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="relative">
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          <div 
            className="w-[800px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(211, 228, 253, 0.6) 0%, rgba(14, 165, 233, 0.3) 50%, transparent 70%)',
              filter: 'blur(100px)',
              position: 'absolute',
            }}
          />
        </div>

        {steps[currentStep]}
      </div>
    </div>
  );
}