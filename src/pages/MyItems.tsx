import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { ChatDialog } from "@/components/ChatDialog";
import { CreateListingDialog } from "@/components/CreateListingDialog";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
}

const MyItems = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMyListings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view your items",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch your listings",
          variant: "destructive",
        });
        return;
      }

      setListings(data || []);
    };

    fetchMyListings();
  }, [toast]);

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
                <h1 className="text-3xl font-bold text-primary">My Items</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your listed items
                </p>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
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
                  You haven't listed any items yet. Create your first listing!
                </p>
              </div>
            )}
          </main>

          <CreateListingDialog onListingCreated={() => {
            toast({
              title: "Success",
              description: "Listing created successfully",
            });
            // Refresh the listings
            window.location.reload();
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

export default MyItems;