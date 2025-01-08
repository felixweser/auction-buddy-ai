export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  isNegotiable: boolean;
  shippingAvailable: boolean;
  imageUrl: string;
}

export interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  formData: ListingFormData;
  setFormData: (data: ListingFormData) => void;
}