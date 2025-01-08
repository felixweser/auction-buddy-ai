import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListingCard } from "./ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { Listing } from "@/types/listing";
import { toast } from "sonner";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleChat = async (listing: Listing) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please sign in to start a conversation");
      return;
    }

    if (listing.created_by === user.id) {
      toast.error("You cannot start a conversation with yourself");
      return;
    }

    navigate(`/messages?listing=${listing.id}`);
  };

  useEffect(() => {
    const fetchResults = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Format the query for text search by replacing spaces with &
        const formattedQuery = query.split(' ').join(' & ');
        
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .textSearch('title', formattedQuery)
          .neq('created_by', user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching search results:", error);
          toast.error("Failed to fetch search results");
          return;
        }

        setListings(data || []);
      } catch (error) {
        console.error("Error in search:", error);
        toast.error("An error occurred while searching");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-xl text-muted-foreground text-center">
            No items found matching your search criteria.
          </p>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Try adjusting your search terms or browse our other listings.
          </p>
        </div>
      )}
    </div>
  );
}