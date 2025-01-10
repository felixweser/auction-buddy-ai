import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Send, Mic, ArrowLeft } from "lucide-react";
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

  return (
    <>
      <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[600px] max-w-[90vw] bg-gray-100/90 backdrop-blur-sm border-0 shadow-lg rounded-full">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyPress={(e) => e.key === "Enter" && handleSend(input)}
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500"
            />
            <div className="flex items-center gap-2 pr-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full hover:bg-gray-200/50"
              >
                <Mic className="h-5 w-5 text-teal-600" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                className="rounded-full hover:bg-gray-200/50"
                onClick={() => handleSend(input)}
              >
                <Send className="h-5 w-5 text-teal-600" />
              </Button>
            </div>
          </div>
        </CardContent>
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
          <ScrollArea className="flex-1 h-[calc(100vh-8rem)] mt-6">
            <div className="space-y-4 pr-4">
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