import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Users, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@/types/listing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InterestedBuyer {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  last_message: string;
  last_message_date: string;
  offered_price: number | null;
}

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [interestedBuyers, setInterestedBuyers] = useState<InterestedBuyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        // Fetch listing details
        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .single();

        if (listingError) throw listingError;
        setListing(listingData);

        // Fetch messages and interested buyers
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select(`
            content,
            created_at,
            sender_id,
            profiles:sender_id (
              username,
              avatar_url
            )
          `)
          .eq("listing_id", id)
          .order("created_at", { ascending: false });

        if (messagesError) throw messagesError;

        // Process messages to get unique buyers with their latest message and offered price
        const buyersMap = new Map<string, InterestedBuyer>();
        
        messagesData.forEach((message: any) => {
          const priceMatch = message.content.match(/\$(\d+)/);
          const offeredPrice = priceMatch ? parseInt(priceMatch[1]) : null;
          
          if (!buyersMap.has(message.sender_id)) {
            buyersMap.set(message.sender_id, {
              user_id: message.sender_id,
              username: message.profiles?.username,
              avatar_url: message.profiles?.avatar_url,
              last_message: message.content,
              last_message_date: new Date(message.created_at).toLocaleDateString(),
              offered_price: offeredPrice,
            });
          }
        });

        setInterestedBuyers(Array.from(buyersMap.values()));
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch listing details",
          variant: "destructive",
        });
        navigate("/my-items");
      }
    };

    fetchListingDetails();
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

  const totalInterested = interestedBuyers.length;
  const averageOffer = interestedBuyers
    .filter(buyer => buyer.offered_price)
    .reduce((acc, curr) => acc + (curr.offered_price || 0), 0) / totalInterested || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-secondary/80 -ml-4"
          onClick={() => navigate("/my-items")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Items
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-secondary/20">
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>
              <p className="text-muted-foreground mb-4">{listing.description}</p>
              
              <div className="flex items-baseline gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="text-3xl font-bold">
                  {listing.price.toLocaleString()}
                </span>
                {listing.is_negotiable && (
                  <span className="text-sm text-muted-foreground">(Negotiable)</span>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Statistics */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Listing Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Interested Buyers</span>
                  </div>
                  <span className="font-semibold">{totalInterested}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span>Average Offer</span>
                  </div>
                  <span className="font-semibold">
                    ${averageOffer.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Interested Buyers</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Last Message</TableHead>
                      <TableHead>Offer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interestedBuyers.map((buyer) => (
                      <TableRow key={buyer.user_id}>
                        <TableCell className="font-medium">
                          {buyer.username || "Anonymous"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {buyer.last_message}
                        </TableCell>
                        <TableCell>
                          {buyer.offered_price 
                            ? `$${buyer.offered_price.toLocaleString()}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {interestedBuyers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No interested buyers yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;