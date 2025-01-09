import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Send, MessageCircle, Minimize2, Maximize2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";

interface Message {
  content: string;
  sender: "user" | "ai";
}

interface ChatDialogProps {
  productTitle: string;
  listingId: string;
  sellerId: string;
  price: number;
  isNegotiable: boolean;
  description: string;
}

export const ChatDialog = ({ 
  productTitle, 
  listingId, 
  sellerId, 
  price, 
  isNegotiable,
  description 
}: ChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (description && messages.length === 0) {
      setMessages([{ content: description, sender: "ai" }]);
    }
  }, [description]);

  const handleSend = async (content: string) => {
    if (!content.trim() || !currentUserId) return;

    setMessages((prev) => [...prev, { content, sender: "user" }]);
    setInput("");
    setIsSheetOpen(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: currentUserId,
          receiver_id: sellerId,
          listing_id: listingId
        });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    }
  };

  const suggestions = [
    `Hi! Is ${productTitle} still available?`,
    "Could you provide more details about the condition?",
    "When would this be available for pickup/delivery?",
    ...(isNegotiable ? [
      `Would you consider ${(price * 0.9).toFixed(2)}?`,
      `Is the price of $${price} negotiable?`
    ] : [])
  ];

  return (
    <>
      <Card className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out shadow-lg ${
        isMinimized ? 'w-64 h-12' : 'w-96 h-[600px]'
      }`}>
        <CardHeader className={`p-3 cursor-pointer ${isMinimized ? 'border-none' : 'border-b'}`} onClick={() => setIsMinimized(!isMinimized)}>
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat about {productTitle}
            </div>
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-4 flex flex-col h-[calc(100%-60px)]">
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {messages.length === 1 && (
              <div className="grid grid-cols-1 gap-2 mb-4">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left h-auto whitespace-normal text-sm"
                    onClick={() => handleSend(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSend(input)}
                className="text-sm"
              />
              <Button size="icon" onClick={() => handleSend(input)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setIsSheetOpen(false);
                  navigate(-1);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Chat about {productTitle}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSend(input)}
                className="text-sm"
              />
              <Button size="icon" onClick={() => handleSend(input)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};