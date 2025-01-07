import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { EditPanel } from "@/components/MyItems/EditPanel";
import { ListingItem } from "@/components/MyItems/ListingItem";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@/types/listing";
import { useIsMobile } from "@/hooks/use-mobile";

const MyItems = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editedListing, setEditedListing] = useState<Listing | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setEditedListing(listing);
  };

  const handleCloseEdit = () => {
    setSelectedListing(null);
    setEditedListing(null);
  };

  const handleListingUpdate = (updatedListing: Listing) => {
    setListings(listings.map(listing => 
      listing.id === updatedListing.id ? updatedListing : listing
    ));
    handleCloseEdit();
    fetchMyListings(); // Refresh the list to ensure we have the latest data
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <header className="border-b">
            <div className="container mx-auto flex items-center justify-between px-4 py-4 md:py-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary">My Items</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
                  Manage your listed items
                </p>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-4 md:py-8">
            <div className="space-y-3 md:space-y-4">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing}
                  onClick={() => handleListingClick(listing)}
                />
              ))}

              {listings.length === 0 && (
                <div className="text-center py-8 md:py-12">
                  <p className="text-muted-foreground text-sm md:text-base">
                    You haven't listed any items yet. Create your first listing!
                  </p>
                </div>
              )}
            </div>
          </main>

          <EditPanel
            listing={selectedListing}
            editedListing={editedListing}
            setEditedListing={setEditedListing}
            onClose={handleCloseEdit}
            onUpdate={handleListingUpdate}
            isMobile={isMobile}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MyItems;