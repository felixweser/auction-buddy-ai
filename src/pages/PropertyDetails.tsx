import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { ChatDialog } from "@/components/ChatDialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PropertyHeader } from "@/components/property/PropertyHeader";
import { PropertyDetailsSection } from "@/components/property/PropertyDetails";
import { PropertyLocation } from "@/components/property/PropertyLocation";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select(`
            *,
            property_details (*)
          `)
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Property not found");
        return data as Property;
      } catch (err) {
        console.error("Failed to fetch property:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load property details. Please try again later.",
        });
        throw err;
      }
    },
    retry: 1,
  });

  const handleScheduleTour = () => {
    toast({
      title: "Coming Soon",
      description: "Virtual tour scheduling will be available soon!",
    });
  };

  const handleWatchVideo = () => {
    toast({
      title: "Coming Soon",
      description: "Video tours will be available soon!",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Error loading property</h1>
            <p className="text-muted-foreground mb-4">
              There was an error loading the property details.
            </p>
            <Button onClick={() => navigate("/search")}>Back to Search</Button>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Button
        variant="outline"
        className="fixed top-6 left-6 z-10"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <PropertyHeader
        property={property}
        onScheduleTour={handleScheduleTour}
        onWatchVideo={handleWatchVideo}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="py-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {property.description}
            </p>
            <Button 
              className="mt-8"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Seller
            </Button>
          </div>

          {property.property_details?.[0] && (
            <PropertyDetailsSection details={property.property_details[0]} />
          )}

          <PropertyLocation property={property} />
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
  );
};

export default PropertyDetails;