import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  content: string;
  sender: "ai" | "user";
  type?: "title" | "description" | "price";
}

const CreateListing = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "What would you like to sell today?",
      sender: "ai",
      type: "title"
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    idealPrice: "",
    minPrice: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.idealPrice || !formData.minPrice) {
      toast({
        title: "Missing information",
        description: "Please complete all the required information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a listing",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('listings')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            price: Number(formData.idealPrice),
            image_url: 'https://via.placeholder.com/400',
            created_by: user.id,
            is_negotiable: Number(formData.minPrice) < Number(formData.idealPrice)
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your listing has been created!",
      });

      navigate('/my-items');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserInput = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      content: input,
      sender: "user",
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Process user input based on current stage
    const currentStage = messages[messages.length - 1];
    
    if (currentStage.type === "title") {
      setFormData(prev => ({ ...prev, title: input }));
      // Add follow-up questions based on title
      const followUpQuestions: Message[] = [
        {
          content: `Tell me more about your ${input}. What condition is it in?`,
          sender: "ai",
          type: "description"
        }
      ];
      setMessages(prev => [...prev, ...followUpQuestions]);
    } else if (currentStage.type === "description") {
      setFormData(prev => ({ ...prev, description: input }));
      // Ask about pricing
      const priceQuestion: Message = {
        content: "What's your ideal selling price?",
        sender: "ai",
        type: "price"
      };
      setMessages(prev => [...prev, priceQuestion]);
    } else if (currentStage.type === "price") {
      setFormData(prev => ({ ...prev, idealPrice: input }));
      const minPriceQuestion: Message = {
        content: "What's the minimum price you'd accept?",
        sender: "ai",
        type: "price"
      };
      setMessages(prev => [...prev, minPriceQuestion]);
    }

    setInput("");
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="relative min-h-[600px]">
        {/* Centered radial gradient background */}
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          <div 
            className="w-[800px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(211, 228, 253, 0.6) 0%, rgba(14, 165, 233, 0.3) 50%, transparent 70%)',
              filter: 'blur(100px)',
              position: 'absolute',
            }}
          />
        </div>

        <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 relative">
          <ScrollArea className="h-[400px] pr-4 mb-4">
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

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              onKeyPress={(e) => e.key === "Enter" && handleUserInput()}
              className="flex-1"
            />
            <Button 
              onClick={handleUserInput}
              disabled={isProcessing || !input.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;