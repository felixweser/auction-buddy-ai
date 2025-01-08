import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChatWindow } from "@/components/listing/ChatWindow";

interface Message {
  content: string;
  sender: "ai" | "user";
  type?: "title" | "description" | "price";
}

const CreateListing = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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

  useEffect(() => {
    handleAIResponse("Hi! What would you like to sell today?");
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
    setInput("");
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-claude', {
        body: { message: input }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data?.response) {
        throw new Error('Invalid response from AI');
      }

      handleAIResponse(data.response);
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
          onSend={handleUserInput}
        />
      </div>
    </div>
  );
};

export default CreateListing;
