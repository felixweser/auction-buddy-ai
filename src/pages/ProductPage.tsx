import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/ChatDialog";
import { useState, useEffect } from "react";
import { ArrowLeft, DollarSign, Calendar, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
  created_at: string;
  shipping_available: boolean;
}

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .single();

        if (listingError) throw listingError;

        const { data: { user } } = await supabase.auth.getUser();
        
        setListing(listingData);
        setIsOwner(user?.id === listingData.created_by);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch listing details",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    fetchListing();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Listing not found</p>
      </div>
    );
  }

  const formattedDate = new Date(listing.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-secondary/80 -ml-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Image Section */}
            <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-secondary/20">
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">About this item</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </Card>
          </div>

          {/* Right Column - Details and Actions */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
              
              <div className="flex items-baseline gap-2 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold">{listing.price.toLocaleString()}</span>
                {listing.is_negotiable && (
                  <span className="text-sm text-muted-foreground">(Negotiable)</span>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Listed on {formattedDate}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>
                    {listing.shipping_available 
                      ? "Shipping available" 
                      : "Local pickup only"}
                  </span>
                </div>
              </div>

              {!isOwner && (
                <div className="mt-6">
                  <ChatDialog
                    productTitle={listing.title}
                    listingId={listing.id}
                    sellerId={listing.created_by}
                    price={listing.price}
                    isNegotiable={listing.is_negotiable}
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;