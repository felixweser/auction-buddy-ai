import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { ChatDialog } from "@/components/ChatDialog";
import { CreateListingDialog } from "@/components/CreateListingDialog";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";

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
  const [distance, setDistance] = useState([50]); // Distance in miles
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
          <header className="border-b">
            <div className="container mx-auto flex items-center justify-between px-4 py-6">
              <div>
                <h1 className="text-3xl font-bold text-primary">Marketplace</h1>
                <p className="text-muted-foreground mt-2">
                  Find what you're looking for
                </p>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {/* Search Section */}
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex gap-2">
                <Input
                  placeholder="What are you looking for? (e.g., 'a used MacBook in good condition')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 border rounded-lg bg-muted/50">
                <div className="space-y-4">
                  <h3 className="font-medium">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Distance</h3>
                  <Slider
                    value={distance}
                    onValueChange={setDistance}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0 miles</span>
                    <span>{distance[0]} miles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {hasSearched && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
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
              </div>
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