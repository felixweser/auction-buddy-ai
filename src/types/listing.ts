export interface ListingData {
  title: string;
  description: string;
  minPrice: number;
  desiredPrice: number;
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