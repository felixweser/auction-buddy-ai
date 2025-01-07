import React, { useEffect, useState } from 'react';
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChatDialog } from "@/components/ChatDialog";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
}

interface SearchResultsProps {
  query: string;
}

export const SearchResults = ({ query }: SearchResultsProps) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to search listings",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .textSearch('title', query)
        .neq('created_by', user.id) // Filter out the current user's listings
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

    fetchResults();
  }, [query, toast]);

  const handleChat = (listing: Listing) => {
    setSelectedListing(listing);
    setChatOpen(true);
  };

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            description={listing.description}
            price={listing.price}
            imageUrl={listing.image_url}
            isNegotiable={listing.is_negotiable}
            onChat={() => handleChat(listing)}
          />
        ))}
      </div>
      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No items found matching your search criteria.
          </p>
        </div>
      )}

      {selectedListing && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          productTitle={selectedListing.title}
        />
      )}
    </div>
  );
};