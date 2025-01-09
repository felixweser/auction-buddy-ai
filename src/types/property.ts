export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
  created_at: string;
  last_updated: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  property_details?: PropertyDetails | null;
}

export interface PropertyDetails {
  id: string;
  property_id: string | null;
  year_built: number;
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  heating_system?: string | null;
  cooling_system?: string | null;
  electrical_system?: string | null;
  last_system_service_date?: string | null;
  created_at: string;
}