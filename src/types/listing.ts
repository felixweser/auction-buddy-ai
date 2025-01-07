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

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  image_url: string;
  created_by: string;
  created_at: string;
  shipping_available: boolean;
}