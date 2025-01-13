import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { ChatDialog } from "@/components/ChatDialog";
import { useToast } from "@/hooks/use-toast";
import { PropertyHero } from "@/components/property/PropertyHero";
import { FloorPlan } from "@/components/property/FloorPlan";
import { KeyMetrics } from "@/components/property/KeyMetrics";
import { SatelliteView } from "@/components/property/SatelliteView";
import { LocationAnalysis } from "@/components/property/LocationAnalysis";
import { PropertySpecs } from "@/components/property/PropertySpecs";
import { BookingDialog } from "@/components/property/BookingDialog";
import { useState } from "react";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

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
        if (!data) throw new Error("Immobilie nicht gefunden");
        return data as Property;
      } catch (err) {
        console.error("Fehler beim Laden der Immobilie:", err);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Die Immobiliendetails konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
        });
        throw err;
      }
    },
    retry: 1,
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Fehler beim Laden der Immobilie</h1>
            <p className="text-muted-foreground mb-4">
              Beim Laden der Immobiliendetails ist ein Fehler aufgetreten.
            </p>
            <Button onClick={() => navigate("/search")}>Zurück zur Suche</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Wird geladen...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Immobilie nicht gefunden</h1>
            <Button onClick={() => navigate("/search")}>Zurück zur Suche</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Button
        variant="agora"
        className="fixed top-6 left-6 z-10"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft />
        <span>Zurück</span>
      </Button>

      <PropertyHero
        imageUrl={property.image_url}
        title={property.title}
        price={property.price}
        details={property.property_details[0]}
      />

      <div className="max-w-7xl mx-auto px-4">
        <div className="py-12">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {property.description}
          </p>
        </div>

        <div className="space-y-12 pb-12">
          <FloorPlan />
          <KeyMetrics property={property} />
          <SatelliteView property={property} />
          <LocationAnalysis />
          <PropertySpecs details={property.property_details[0]} />
        </div>
      </div>

      <ChatDialog
        listingId={property.id}
        sellerId={property.created_by}
        productTitle={property.title}
        price={property.price}
        isNegotiable={property.is_negotiable}
        description={property.description}
      />

      <BookingDialog
        propertyId={property.id}
        propertyTitle={property.title}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default PropertyDetails;