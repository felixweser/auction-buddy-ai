export interface ListingData {
  title: string;
  description: string;
  price: number;
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
  shipping_available: boolean;
  created_by: string;
  created_at: string;
}

export interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  formData: {
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    isNegotiable: boolean;
    shippingAvailable: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    isNegotiable: boolean;
    shippingAvailable: boolean;
  }>>;
}