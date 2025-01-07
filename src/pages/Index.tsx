import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSetup } from "@/components/ProfileSetup";
import { ListingCard } from "@/components/ListingCard";
import { ChatDialog } from "@/components/ChatDialog";
import { CreateListingDialog } from "@/components/CreateListingDialog";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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

const Index = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        
        setProfileComplete(!!profile?.username);
      }
    };

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

    checkProfile();
    fetchListings();
  }, [toast]);

  const handleListingCreated = async (formData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("listings").insert({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      image_url: formData.imageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      is_negotiable: true,
      created_by: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive",
      });
      return;
    }

    // Refresh listings
    const { data: newListings } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    
    setListings(newListings || []);
    
    toast({
      title: "Success",
      description: "Listing created successfully",
    });
  };

  const handleChat = (listing: Listing) => {
    setSelectedListing(listing);
    setChatOpen(true);
  };

  if (profileComplete === false) {
    return <ProfileSetup />;
  }

  if (profileComplete === null) {
    return <div>Loading...</div>;
  }

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
                  Buy and sell items with chat-based price negotiation
                </p>
              </div>
              <SidebarTrigger />
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
                  No listings yet. Create your first listing!
                </p>
              </div>
            )}
          </main>

          <CreateListingDialog onListingCreated={handleListingCreated} />
          
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