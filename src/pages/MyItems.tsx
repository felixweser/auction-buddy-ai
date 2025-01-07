import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Pencil, Save, DollarSign } from "lucide-react";

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
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editedListing, setEditedListing] = useState<Listing | null>(null);
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

  const handleSave = async () => {
    if (!editedListing) return;

    const { error } = await supabase
      .from("listings")
      .update({
        title: editedListing.title,
        description: editedListing.description,
        price: editedListing.price,
        is_negotiable: editedListing.is_negotiable,
      })
      .eq("id", editedListing.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Listing updated successfully",
    });

    // Update the listings state with the edited listing
    setListings(listings.map(listing => 
      listing.id === editedListing.id ? editedListing : listing
    ));
    setSelectedListing(editedListing);
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
            <div className="space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedListing(listing);
                    setEditedListing(listing);
                  }}
                >
                  <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {listing.description}
                    </p>
                  </div>
                  <div className="flex items-center text-primary">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{listing.price}</span>
                  </div>
                </div>
              ))}

              {listings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    You haven't listed any items yet. Create your first listing!
                  </p>
                </div>
              )}
            </div>
          </main>

          <Sheet open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
            <SheetContent className="sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Edit Listing</SheetTitle>
              </SheetHeader>
              
              {editedListing && (
                <div className="space-y-6 mt-6">
                  <div className="aspect-video rounded-lg overflow-hidden bg-accent">
                    <img
                      src={editedListing.image_url}
                      alt={editedListing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="text-sm font-medium text-foreground">
                        Title
                      </label>
                      <Input
                        id="title"
                        value={editedListing.title}
                        onChange={(e) => setEditedListing({
                          ...editedListing,
                          title: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="text-sm font-medium text-foreground">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        value={editedListing.description}
                        onChange={(e) => setEditedListing({
                          ...editedListing,
                          description: e.target.value
                        })}
                        className="h-32"
                      />
                    </div>

                    <div>
                      <label htmlFor="price" className="text-sm font-medium text-foreground">
                        Price
                      </label>
                      <Input
                        id="price"
                        type="number"
                        value={editedListing.price}
                        onChange={(e) => setEditedListing({
                          ...editedListing,
                          price: Number(e.target.value)
                        })}
                      />
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleSave}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MyItems;