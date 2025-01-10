import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "./chat/ChatInput";
import { ChatSheet } from "./chat/ChatSheet";

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  useEffect(() => {
    if (description && messages.length === 0) {
      setMessages([{ content: description, sender: "ai" }]);
    }
  }, [description]);

  const handleSend = async (content: string) => {
    if (!content.trim() || !currentUserId) return;

    // Add message to local state first
    setMessages((prev) => [...prev, { content, sender: "user" }]);
    
    // Open the sheet before clearing input
    setIsSheetOpen(true);
    
    // Clear input after opening sheet
    setInput("");

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

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[600px] max-w-[90vw]">
        <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => handleSend(input)}
          />
        </div>
      </div>

      <ChatSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSend={() => handleSend(input)}
        productTitle={productTitle}
      />
    </>
  );
};