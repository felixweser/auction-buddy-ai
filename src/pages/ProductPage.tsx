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
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch property details",
          variant: "destructive",
        });
        return;
      }

      setProperty(data as Property);
    };

    fetchProperty();
  }, [id, toast]);

  if (!property) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold">{property.title}</h1>
      <img src={property.image_url} alt={property.title} className="w-full h-64 object-cover mt-4" />
      <p className="mt-2 text-lg">{property.description}</p>
      <p className="mt-2 text-xl font-semibold">${property.price}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {property.address_line1}, {property.city}, {property.state} {property.zip_code}
      </p>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Property Details</h2>
        {property.property_details && (
          <ul className="list-disc list-inside">
            <li>Year Built: {property.property_details.year_built}</li>
            <li>Square Footage: {property.property_details.square_footage} sq ft</li>
            <li>Bedrooms: {property.property_details.bedrooms}</li>
            <li>Bathrooms: {property.property_details.bathrooms}</li>
            <li>Heating System: {property.property_details.heating_system || "N/A"}</li>
            <li>Cooling System: {property.property_details.cooling_system || "N/A"}</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
