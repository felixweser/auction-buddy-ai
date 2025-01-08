export interface ListingData {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isNegotiable: boolean;
  shippingAvailable: boolean;
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