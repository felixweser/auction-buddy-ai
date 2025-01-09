export interface ListingData {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  isNegotiable: boolean;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  yearBuilt: number;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  heatingSystem?: string;
  coolingSystem?: string;
  electricalSystem?: string;
  lastSystemServiceDate?: string;
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
}

export interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  isNegotiable: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  yearBuilt: string;
  squareFootage: string;
  bedrooms: string;
  bathrooms: string;
  heatingSystem: string;
  coolingSystem: string;
  electricalSystem: string;
  lastSystemServiceDate: string;
}