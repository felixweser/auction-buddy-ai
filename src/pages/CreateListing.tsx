import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatWindow } from "@/components/listing/ChatWindow";

interface Message {
  content: string;
  sender: "ai" | "user";
}

interface ListingData {
  title: string;
  description: string;
  price: number;
  isNegotiable: boolean;
  imageUrl?: string;
}

const CreateListing = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [generatedListing, setGeneratedListing] = useState<ListingData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    handleAIResponse("Hi! Let's create your listing. What are you selling?");
  }, []);

  const handleAIResponse = async (message: string) => {
    setMessages(prev => [...prev, {
      content: message,
      sender: "ai"
    }]);
  };

  const handleUserInput = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input,
      sender: "user",
    };
    
    setMessages(prev => [...prev, userMessage]);
    const newAnswers = [...answers, input];
    setAnswers(newAnswers);
    setInput("");
    setIsProcessing(true);

    try {
      // If we have 4 answers, generate the listing
      const context = newAnswers.length === 4 ? 'generate_listing' : 'question';
      const messageForAI = newAnswers.length === 4 
        ? `Create a listing based on these details:
           Item: ${newAnswers[0]}
           Minimum price: ${newAnswers[1]}
           Ideal price: ${newAnswers[2]}
           Additional details: ${newAnswers[3]}`
        : input;

      const { data, error } = await supabase.functions.invoke('chat-with-claude', {
        body: { 
          message: messageForAI,
          context
        }
      });

      if (error) throw error;

      if (newAnswers.length === 4) {
        try {
          const listing = JSON.parse(data.response);
          setGeneratedListing(listing);
          handleAIResponse(
            `Great! I've created a listing based on your input. Here's what I came up with:\n\n` +
            `Title: ${listing.title}\n` +
            `Description: ${listing.description}\n` +
            `Price: €${listing.price}\n\n` +
            `Would you like to publish this listing? Type 'yes' to publish or 'no' to start over.`
          );
        } catch (e) {
          console.error('Error parsing listing:', e);
          handleAIResponse("I had trouble creating your listing. Let's start over. What are you selling?");
          setAnswers([]);
        }
      } else {
        handleAIResponse(data.response);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishListing = async () => {
    if (!generatedListing) return;

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
            title: generatedListing.title,
            description: generatedListing.description,
            price: generatedListing.price,
            image_url: generatedListing.imageUrl || 'https://via.placeholder.com/400',
            created_by: user.id,
            is_negotiable: generatedListing.isNegotiable
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

  const handleFinalResponse = async (response: string) => {
    if (response.toLowerCase() === 'yes') {
      await handlePublishListing();
    } else if (response.toLowerCase() === 'no') {
      setAnswers([]);
      setGeneratedListing(null);
      handleAIResponse("Let's start over. What are you selling?");
    } else {
      handleAIResponse("Please type 'yes' to publish or 'no' to start over.");
    }
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

        <ChatWindow
          messages={messages}
          input={input}
          isProcessing={isProcessing}
          onInputChange={setInput}
          onSend={generatedListing ? handleFinalResponse : handleUserInput}
        />
      </div>
    </div>
  );
};

export default CreateListing;