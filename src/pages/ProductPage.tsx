import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/ChatDialog";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  // Mock data - in a real app, this would come from your state management or API
  const listing = {
    id: Number(id),
    title: "Sample Product",
    description: "Product description",
    currentBid: 100,
    imageUrl: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848",
    timeLeft: "30 days",
    createdBy: "current-user",
    messages: [
      {
        content: "Is this item still available?",
        sender: "user",
        timestamp: new Date(),
      },
      {
        content: "Yes, it's still available!",
        sender: "ai",
        timestamp: new Date(),
      },
    ],
  };

  const isOwner = listing.createdBy === "current-user"; // In a real app, compare with actual user ID

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full rounded-lg object-cover aspect-square"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <p className="text-muted-foreground mt-2">{listing.description}</p>
            <div className="mt-4">
              <p className="text-xl font-semibold">
                Current Price: ${listing.currentBid}
              </p>
              <p className="text-muted-foreground">Time Left: {listing.timeLeft}</p>
            </div>

            {isOwner ? (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Buyer Messages</h2>
                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  {listing.messages.length > 0 ? (
                    listing.messages.map((message, index) => (
                      <div
                        key={index}
                        className="mb-4 p-3 rounded-lg bg-muted"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {message.sender === "user" ? "Potential Buyer" : "AI Assistant"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {message.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p>{message.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No messages from buyers yet
                    </p>
                  )}
                </ScrollArea>
              </div>
            ) : (
              <Button
                className="mt-6 w-full"
                onClick={() => setChatOpen(true)}
              >
                Chat with AI Assistant
              </Button>
            )}
          </div>
        </div>
      </div>

      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        productTitle={listing.title}
      />
    </div>
  );
};

export default ProductPage;