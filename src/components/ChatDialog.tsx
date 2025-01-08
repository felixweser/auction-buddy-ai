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
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Stream the description as the first message
  useEffect(() => {
    if (description && messages.length === 0) {
      setMessages([{ content: description, sender: "ai" }]);
    }
  }, [description]);

  const handleSend = async (content: string) => {
    if (!content.trim() || !currentUserId) return;

    // Add message to local state
    setMessages((prev) => [...prev, { content, sender: "user" }]);
    setInput("");

    try {
      // Save message to Supabase
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
    <Card className="w-full h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat about {productTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
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
                className="text-left h-auto whitespace-normal"
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
          />
          <Button size="icon" onClick={() => handleSend(input)}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};