import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { Listing } from "@/types/listing";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const handleSearch = () => {
    setSearchParams({ q: searchInput });
    fetchResults(searchInput);
  };

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

  const fetchResults = async (searchQuery: string) => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .textSearch('title', searchQuery)
      .neq('created_by', user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching search results:", error);
      toast.error("Failed to fetch search results");
      return;
    }

    setListings(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    setSearchInput(query);
    fetchResults(query);
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 
          before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-primary/5 
          before:blur-2xl after:absolute after:inset-0 after:-z-10 after:rounded-xl 
          after:bg-background/10 after:blur-xl relative z-10">
          <div className="flex gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Refine your search..."
              className="bg-background/50 border-none text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
            />
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleSearch}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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