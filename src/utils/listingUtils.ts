import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ListingData } from "@/types/listing";

export const publishListing = async (listing: ListingData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a listing");
      return false;
    }

    const { error } = await supabase
      .from('listings')
      .insert([
        {
          title: listing.title,
          description: listing.description,
          price: listing.desiredPrice,
          image_url: listing.imageUrl || 'https://via.placeholder.com/400',
          created_by: user.id,
          is_negotiable: listing.isNegotiable,
          shipping_available: listing.shippingAvailable
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