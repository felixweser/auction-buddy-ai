import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { useToast } from "@/hooks/use-toast";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          property_details (*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch property details",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Transform the data to match the Property type
        const transformedData: Property = {
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          image_url: data.image_url,
          is_negotiable: data.is_negotiable,
          created_by: data.created_by,
          created_at: data.created_at,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          last_updated: data.last_updated,
          property_details: data.property_details?.[0] ? {
            id: data.property_details[0].id,
            property_id: data.property_details[0].property_id,
            year_built: data.property_details[0].year_built,
            square_footage: data.property_details[0].square_footage,
            bedrooms: data.property_details[0].bedrooms,
            bathrooms: data.property_details[0].bathrooms,
            heating_system: data.property_details[0].heating_system,
            cooling_system: data.property_details[0].cooling_system,
            electrical_system: data.property_details[0].electrical_system,
            last_system_service_date: data.property_details[0].last_system_service_date,
            created_at: data.property_details[0].created_at
          } : null
        };
        setProperty(transformedData);
      }
    };

    fetchProperty();
  }, [id, toast]);

  if (!property) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold">{property.title}</h1>
      <img src={property.image_url} alt={property.title} className="w-full h-64 object-cover mt-4 rounded-lg" />
      <p className="mt-4 text-lg">{property.description}</p>
      <p className="mt-2 text-2xl font-semibold">${property.price.toLocaleString()}</p>
      {property.is_negotiable && (
        <p className="text-sm text-muted-foreground">Price is negotiable</p>
      )}
      <p className="mt-2 text-muted-foreground">
        {property.address_line1}
        {property.address_line2 && `, ${property.address_line2}`}
        <br />
        {property.city}, {property.state} {property.zip_code}
      </p>
      
      {property.property_details && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Year Built</h3>
              <p className="text-lg">{property.property_details.year_built}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Square Footage</h3>
              <p className="text-lg">{property.property_details.square_footage} sq ft</p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Bedrooms</h3>
              <p className="text-lg">{property.property_details.bedrooms}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Bathrooms</h3>
              <p className="text-lg">{property.property_details.bathrooms}</p>
            </div>
            {property.property_details.heating_system && (
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-muted-foreground">Heating System</h3>
                <p className="text-lg">{property.property_details.heating_system}</p>
              </div>
            )}
            {property.property_details.cooling_system && (
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-muted-foreground">Cooling System</h3>
                <p className="text-lg">{property.property_details.cooling_system}</p>
              </div>
            )}
            {property.property_details.electrical_system && (
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-muted-foreground">Electrical System</h3>
                <p className="text-lg">{property.property_details.electrical_system}</p>
              </div>
            )}
            {property.property_details.last_system_service_date && (
              <div className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-muted-foreground">Last Service Date</h3>
                <p className="text-lg">
                  {new Date(property.property_details.last_system_service_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;