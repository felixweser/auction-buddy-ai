export interface ListingData {
  title: string;
  description: string;
  minPrice: number;
  desiredPrice: number;
  imageUrl: string;
  isNegotiable: boolean;
  shippingAvailable: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
  created_at: string;
  shipping_available: boolean;
}

export interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  formData: {
    title: string;
    description: string;
    minPrice: string;
    desiredPrice: string;
    imageUrl: string;
    isNegotiable: boolean;
    shippingAvailable: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    minPrice: string;
    desiredPrice: string;
    imageUrl: string;
    isNegotiable: boolean;
    shippingAvailable: boolean;
  }>>;
}