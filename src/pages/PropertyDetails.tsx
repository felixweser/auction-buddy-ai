import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { ChatDialog } from "@/components/ChatDialog";
import { useState } from "react";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          property_details (*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Property;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Property not found</h1>
            <Button onClick={() => navigate("/search")}>Back to Search</Button>
          </div>
        </div>
      </div>
    );
  }

  const propertyDetails = property.property_details?.[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="aspect-video rounded-lg overflow-hidden bg-accent">
              <img
                src={property.image_url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-3xl font-semibold mb-2">{property.title}</h1>
              <p className="text-2xl font-bold text-primary mb-4">
                €{property.price.toLocaleString()}
                {property.is_negotiable && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Negotiable)
                  </span>
                )}
              </p>
              <p className="text-muted-foreground">{property.description}</p>
            </div>

            <Button 
              className="w-full"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Seller
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="space-y-4">
                {propertyDetails && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Year Built</p>
                        <p className="font-medium">{propertyDetails.year_built}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Square Footage</p>
                        <p className="font-medium">{propertyDetails.square_footage} sq ft</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                        <p className="font-medium">{propertyDetails.bedrooms}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bathrooms</p>
                        <p className="font-medium">{propertyDetails.bathrooms}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {propertyDetails.heating_system && (
                        <div>
                          <p className="text-sm text-muted-foreground">Heating System</p>
                          <p className="font-medium">{propertyDetails.heating_system}</p>
                        </div>
                      )}
                      {propertyDetails.cooling_system && (
                        <div>
                          <p className="text-sm text-muted-foreground">Cooling System</p>
                          <p className="font-medium">{propertyDetails.cooling_system}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="space-y-2">
                <p>{property.address_line1}</p>
                {property.address_line2 && <p>{property.address_line2}</p>}
                <p>{property.city}, {property.state} {property.zip_code}</p>
              </div>
            </div>
          </div>
        </div>

        {isChatOpen && property && (
          <ChatDialog
            listingId={property.id}
            sellerId={property.created_by}
            productTitle={property.title}
            price={property.price}
            isNegotiable={property.is_negotiable}
            description={property.description}
          />
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;