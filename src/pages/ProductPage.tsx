import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/ChatDialog";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
  created_at: string;
}

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // Get the listing data
        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .single();

        if (listingError) throw listingError;

        // Get current user
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
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 mb-6 hover:bg-secondary transition-colors"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden border bg-secondary">
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{listing.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Listed on {formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-2xl font-semibold">
              <DollarSign className="h-6 w-6 text-primary" />
              <span>{listing.price.toLocaleString()}</span>
              {listing.is_negotiable && (
                <span className="text-sm text-muted-foreground font-normal">(Price negotiable)</span>
              )}
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>

            {!isOwner && (
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => setChatOpen(true)}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {listing.is_negotiable ? "Negotiate Price" : "Contact Seller"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        productTitle={listing.title}
        listingId={listing.id}
        sellerId={listing.created_by}
      />
    </div>
  );
};

export default ProductPage;