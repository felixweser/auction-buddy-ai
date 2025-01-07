import { useState } from "react";
import { AuctionCard } from "@/components/AuctionCard";
import { ChatDialog } from "@/components/ChatDialog";
import { useToast } from "@/components/ui/use-toast";

// Mock data for our first version
const MOCK_AUCTIONS = [
  {
    id: 1,
    title: "Vintage Camera Collection",
    description: "A rare collection of perfectly maintained vintage cameras from the 1960s. Includes three classic models in their original cases.",
    currentBid: 450,
    imageUrl: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&q=80",
    timeLeft: "2 days, 5 hours",
  },
  {
    id: 2,
    title: "Modern Art Painting",
    description: "Original abstract painting by emerging artist. Acrylic on canvas, 2023. Certificate of authenticity included.",
    currentBid: 1200,
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80",
    timeLeft: "4 days, 12 hours",
  },
  {
    id: 3,
    title: "Luxury Watch",
    description: "Limited edition automatic watch. Swiss made with sapphire crystal and genuine leather strap.",
    currentBid: 3500,
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80",
    timeLeft: "1 day, 8 hours",
  },
];

const Index = () => {
  const { toast } = useToast();
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof MOCK_AUCTIONS[0] | null>(null);

  const handleBid = (auction: typeof MOCK_AUCTIONS[0]) => {
    toast({
      title: "Bid Placed!",
      description: `You've placed a bid on ${auction.title}`,
    });
  };

  const handleChat = (auction: typeof MOCK_AUCTIONS[0]) => {
    setSelectedItem(auction);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">AI Auctions</h1>
          <p className="text-muted-foreground mt-2">
            Discover unique items with AI-powered assistance
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_AUCTIONS.map((auction) => (
            <AuctionCard
              key={auction.id}
              {...auction}
              onBid={() => handleBid(auction)}
              onChat={() => handleChat(auction)}
            />
          ))}
        </div>
      </main>

      {selectedItem && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          productTitle={selectedItem.title}
        />
      )}
    </div>
  );
};

export default Index;