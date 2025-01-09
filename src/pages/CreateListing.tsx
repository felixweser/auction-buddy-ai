import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TitleStep } from "@/components/listing/TitleStep";
import { DescriptionStep } from "@/components/listing/DescriptionStep";
import { PriceStep } from "@/components/listing/PriceStep";
import { AddressStep } from "@/components/listing/AddressStep";
import { PropertyDetailsStep } from "@/components/listing/PropertyDetailsStep";
import { ImageStep } from "@/components/listing/ImageStep";
import { publishListing } from "@/utils/listingUtils";
import type { PropertyFormData } from "@/types/listing";

export default function CreateListing() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    isNegotiable: false,
    shippingAvailable: false,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    yearBuilt: "",
    squareFootage: "",
    bedrooms: "",
    bathrooms: "",
    heatingSystem: "",
    coolingSystem: "",
    electricalSystem: "",
    lastSystemServiceDate: "",
  });

  const navigate = useNavigate();

  const handleManualNext = async () => {
    if (currentStep === 5) {
      const listing = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
        isNegotiable: formData.isNegotiable,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        yearBuilt: parseInt(formData.yearBuilt),
        squareFootage: parseFloat(formData.squareFootage),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        heatingSystem: formData.heatingSystem,
        coolingSystem: formData.coolingSystem,
        electricalSystem: formData.electricalSystem,
        lastSystemServiceDate: formData.lastSystemServiceDate,
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
    <AddressStep 
      key="address" 
      onNext={handleManualNext} 
      onBack={handleManualBack} 
      formData={formData} 
      setFormData={setFormData} 
    />,
    <PropertyDetailsStep 
      key="details" 
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