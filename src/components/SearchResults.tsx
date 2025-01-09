import { useState, useEffect } from "react";
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { ChatDialog } from "@/components/ChatDialog";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/types/property";

export const SearchResults = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch properties",
          variant: "destructive",
        });
        return;
      }

      setProperties(data as Property[]);
    };

    fetchProperties();
  }, [toast]);

  const handleChatOpen = ({
    listingId,
    sellerId,
    productTitle,
    price,
    isNegotiable,
  }: {
    listingId: string;
    sellerId: string;
    productTitle: string;
    price: number;
    isNegotiable: boolean;
  }) => {
    const property = properties.find((p) => p.id === listingId);
    if (property) {
      setSelectedProperty(property);
      setIsChatOpen(true);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <ListingCard
          key={property.id}
          id={property.id}
          title={property.title}
          description={property.description}
          price={property.price}
          imageUrl={property.image_url}
          isNegotiable={property.is_negotiable}
          sellerId={property.created_by}
          onChat={handleChatOpen}
        />
      ))}
      {selectedProperty && (
        <ChatDialog
          productTitle={selectedProperty.title}
          listingId={selectedProperty.id}
          sellerId={selectedProperty.created_by}
          price={selectedProperty.price}
          isNegotiable={selectedProperty.is_negotiable}
          description={selectedProperty.description}
        />
      )}
    </div>
  );
};