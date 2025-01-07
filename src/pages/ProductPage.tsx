import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/ChatDialog";
import { useState } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  // This would typically come from an API/database
  // For now we'll use mock data
  const product = {
    id: Number(id),
    title: "Vintage Camera",
    description: "A beautiful vintage camera in excellent condition. Perfect for collectors or photography enthusiasts. Includes original leather case and manual.",
    currentBid: 299.99,
    imageUrl: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&q=80",
    timeLeft: "2 days",
    seller: "John Doe",
    condition: "Used - Like New",
    location: "Berlin, Germany",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-2xl font-semibold mt-2 text-primary">
              ${product.currentBid}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Condition</h3>
              <p className="text-muted-foreground">{product.condition}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-muted-foreground">{product.location}</p>
            </div>
            <div>
              <h3 className="font-semibold">Seller</h3>
              <p className="text-muted-foreground">{product.seller}</p>
            </div>
            <div>
              <h3 className="font-semibold">Time Left</h3>
              <p className="text-muted-foreground">{product.timeLeft}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1" onClick={() => setChatOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with AI Assistant
            </Button>
          </div>
        </div>
      </div>

      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        productTitle={product.title}
      />
    </div>
  );
};

export default ProductPage;