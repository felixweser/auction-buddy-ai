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

    // First, create the property
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .insert([
        {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          image_url: listing.imageUrl,
          created_by: user.id,
          is_negotiable: listing.isNegotiable,
          address_line1: listing.addressLine1,
          address_line2: listing.addressLine2 || null,
          city: listing.city,
          state: listing.state,
          zip_code: listing.zipCode,
        }
      ])
      .select()
      .single();

    if (propertyError) {
      console.error('Property Error:', propertyError);
      throw propertyError;
    }

    // Then, create the property details
    const { error: detailsError } = await supabase
      .from('property_details')
      .insert([{
        property_id: propertyData.id,
        year_built: listing.yearBuilt,
        square_footage: listing.squareFootage,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        heating_system: listing.heatingSystem || null,
        cooling_system: listing.coolingSystem || null,
        electrical_system: listing.electricalSystem || null,
        last_system_service_date: listing.lastSystemServiceDate || null
      }]);

    if (detailsError) {
      console.error('Details Error:', detailsError);
      throw detailsError;
    }

    toast.success("Your property listing has been created!");
    return true;
  } catch (error) {
    console.error('Error:', error);
    toast.error("Failed to create property listing. Please try again.");
    return false;
  }
};