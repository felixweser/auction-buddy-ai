import { useState } from "react";
import { AuctionCard } from "@/components/AuctionCard";
import { ChatDialog } from "@/components/ChatDialog";
import { CreateListingDialog } from "@/components/CreateListingDialog";

interface Listing {
  id: number;
  title: string;
  description: string;
  currentBid: number;
  imageUrl: string;
  timeLeft: string;
}

const Index = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleListingCreated = (formData: any) => {
    const newListing: Listing = {
      id: listings.length + 1,
      title: formData.title,
      description: formData.description,
      currentBid: Number(formData.price),
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&q=80",
      timeLeft: "30 days",
    };
    setListings([...listings, newListing]);
  };

  const handleChat = (listing: Listing) => {
    setSelectedListing(listing);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Buy and sell items with AI-powered assistance
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <AuctionCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              description={listing.description}
              currentBid={listing.currentBid}
              imageUrl={listing.imageUrl}
              timeLeft={listing.timeLeft}
              onBid={() => {}}
              onChat={() => handleChat(listing)}
            />
          ))}
        </div>
        {listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No listings yet. Create your first listing!</p>
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
  );
};

export default Index;