export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  isNegotiable: boolean;
  shippingAvailable: boolean;
}

export interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  formData: ListingFormData;
  setFormData: (data: ListingFormData) => void;
}