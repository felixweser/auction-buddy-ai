import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchResults as SearchResultsList } from "@/components/SearchResults";
import { supabase } from "@/integrations/supabase/client";
import { ChatDialog } from "@/components/ChatDialog";
import { useToast } from "@/components/ui/use-toast";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
}

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const [listings, setListings] = useState<Listing[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleChat = (listing: Listing) => {
    setSelectedListing(listing);
    setChatOpen(true);
  };

  // Fetch results when the component mounts
  useState(() => {
    const fetchResults = async () => {
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

    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/')}
        className="mb-8 text-primary hover:underline"
      >
        ← Back to Search
      </button>
      
      <h2 className="text-2xl font-semibold mb-6">
        Search results for "{query}"
      </h2>

      <SearchResultsList 
        listings={listings}
        onChat={handleChat}
      />

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

export default SearchResultsPage;