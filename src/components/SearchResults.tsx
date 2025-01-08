import { useState, useEffect } from "react";
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { ChatDialog } from "@/components/ChatDialog";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
}

export const SearchResults = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch listings",
          variant: "destructive",
        });
        return;
      }

      setListings(data || []);
    };

    fetchListings();
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
    const listing = listings.find((l) => l.id === listingId);
    if (listing) {
      setSelectedListing(listing);
      setIsChatOpen(true);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          description={listing.description}
          price={listing.price}
          imageUrl={listing.image_url}
          isNegotiable={listing.is_negotiable}
          sellerId={listing.created_by}
          onChat={handleChatOpen}
        />
      ))}
      {selectedListing && (
        <ChatDialog
          productTitle={selectedListing.title}
          listingId={selectedListing.id}
          sellerId={selectedListing.created_by}
          price={selectedListing.price}
          isNegotiable={selectedListing.is_negotiable}
          description={selectedListing.description}
        />
      )}
    </div>
  );
};