import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ListingData {
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  imageUrl?: string;
}

export const publishListing = async (generatedListing: ListingData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a listing");
      return false;
    }

    // Ensure price is a valid number
    if (isNaN(generatedListing.price) || generatedListing.price <= 0) {
      toast.error("Invalid price value");
      return false;
    }

    const { error } = await supabase
      .from('listings')
      .insert([
        {
          title: generatedListing.title,
          description: generatedListing.description,
          price: generatedListing.price,
          image_url: generatedListing.imageUrl || 'https://via.placeholder.com/400',
          created_by: user.id,
          is_negotiable: generatedListing.isNegotiable
        }
      ]);

    if (error) throw error;

    toast.success("Your listing has been created!");
    return true;
  } catch (error) {
    console.error('Error:', error);
    toast.error("Failed to create listing. Please try again.");
    return false;
  }
};