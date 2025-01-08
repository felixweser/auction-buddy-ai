import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Robot, PenLine } from "lucide-react";
import { toast } from "sonner";
import { ChatWindow } from "@/components/listing/ChatWindow";
import { ListingData, publishListing } from "@/utils/listingUtils";
import { TitleStep } from "@/components/listing/TitleStep";
import { DescriptionStep } from "@/components/listing/DescriptionStep";
import { PriceStep } from "@/components/listing/PriceStep";
import { ImageStep } from "@/components/listing/ImageStep";

interface Message {
  content: string;
  sender: "ai" | "user";
}

export default function CreateListing() {
  const [mode, setMode] = useState<"manual" | "ai" | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
    isNegotiable: false,
    shippingAvailable: false
  });

  // AI Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [generatedListing, setGeneratedListing] = useState<ListingData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "ai") {
      handleAIResponse("Hi! Let's create your listing. What are you selling?");
    }
  }, [mode]);

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
      const context = newAnswers.length === 4 ? 'generate_listing' : 'question';
      const messageForAI = newAnswers.length === 4 
        ? `Create a listing based on these details:
           Item: ${newAnswers[0]}
           Price range: ${newAnswers[1]} (extract a single numeric value from this)
           Additional details: ${newAnswers[2]}
           Description: ${newAnswers[3]}`
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
          // Ensure price is a valid number
          listing.price = parseFloat(listing.price);
          if (isNaN(listing.price)) {
            throw new Error('Invalid price generated');
          }
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
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalResponse = async (response: string) => {
    if (response.toLowerCase() === 'yes' && generatedListing) {
      const success = await publishListing(generatedListing);
      if (success) {
        navigate('/my-items');
      }
    } else if (response.toLowerCase() === 'no') {
      setAnswers([]);
      setGeneratedListing(null);
      handleAIResponse("Let's start over. What are you selling?");
    } else {
      handleAIResponse("Please type 'yes' to publish or 'no' to start over.");
    }
  };

  const onSend = () => {
    if (generatedListing) {
      handleFinalResponse(input);
    } else {
      handleUserInput();
    }
  };

  const handleManualNext = async () => {
    if (currentStep === 3) {
      const listing: ListingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
        isNegotiable: formData.isNegotiable,
        shippingAvailable: formData.shippingAvailable
      };

      const success = await publishListing(listing);
      if (success) {
        navigate('/my-items');
      }
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleManualBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (!mode) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-center">Create a New Listing</h1>
          <p className="text-center text-muted-foreground">
            Choose how you'd like to create your listing
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              size="lg"
              className="h-32 flex flex-col gap-2"
              onClick={() => setMode("manual")}
            >
              <PenLine className="h-8 w-8" />
              <span>Create Manually</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-32 flex flex-col gap-2"
              onClick={() => setMode("ai")}
            >
              <Robot className="h-8 w-8" />
              <span>AI-Assisted Creation</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "manual") {
    const steps = [
      <TitleStep key="title" onNext={handleManualNext} formData={formData} setFormData={setFormData} />,
      <DescriptionStep key="description" onNext={handleManualNext} onBack={handleManualBack} formData={formData} setFormData={setFormData} />,
      <PriceStep key="price" onNext={handleManualNext} onBack={handleManualBack} formData={formData} setFormData={setFormData} />,
      <ImageStep key="image" onNext={handleManualNext} onBack={handleManualBack} formData={formData} setFormData={setFormData} />
    ];

    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {steps[currentStep]}
      </div>
    );
  }

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
          onSend={onSend}
        />
      </div>
    </div>
  );
}
