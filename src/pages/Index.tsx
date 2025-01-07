import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatDialog } from "@/components/ChatDialog";
import { CreateListingDialog } from "@/components/CreateListingDialog";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";

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

          <CreateListingDialog onListingCreated={() => {
            toast({
              title: "Success",
              description: "Listing created successfully",
            });
            if (hasSearched) {
              handleSearch();
            }
          }} />
          
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