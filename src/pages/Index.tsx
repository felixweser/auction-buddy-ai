import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChatDialog } from "@/components/ChatDialog";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
}

const Index = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

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
    setHasSearched(true);
  };

  const handleChat = (listing: Listing) => {
    setSelectedListing(listing);
    setChatOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <main className="container mx-auto px-4 py-8">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
            />

            {hasSearched && (
              <SearchResults 
                listings={listings}
                onChat={handleChat}
              />
            )}
          </main>

          <Button 
            className="fixed bottom-6 right-6"
            onClick={() => navigate('/create-listing')}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Listing
          </Button>
          
          {selectedListing && (
            <ChatDialog
              open={chatOpen}
              onOpenChange={setChatOpen}
              productTitle={selectedListing.title}
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;