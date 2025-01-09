export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
  created_at: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  last_updated: string;
  property_details: PropertyDetails | null;
}

export interface PropertyDetails {
  id: string;
  property_id: string | null;
  year_built: number;
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  heating_system: string | null;
  cooling_system: string | null;
  electrical_system: string | null;
  last_system_service_date: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  created_at: string;
  property?: Property;
}

export interface ChatGroup {
  chats: {
    listing_id: string;
    listing_title: string;
    messages: {
      id: string;
      content: string;
      created_at: string;
      sender_id: string;
      listing_id: string;
      listings: {
        title: string;
      };
    }[];
  }[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}