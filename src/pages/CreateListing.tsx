import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const CreateListing = () => {
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Description needed",
        description: "Please describe your item first",
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

      // For now, we'll create a basic listing
      // This will be enhanced with AI processing later
      const { error } = await supabase
        .from('listings')
        .insert([
          {
            title: description.split('\n')[0] || 'New Item',
            description: description,
            price: 0, // This will be extracted by AI later
            image_url: 'https://via.placeholder.com/400',
            created_by: user.id,
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

      <div className="bg-card rounded-lg shadow-lg p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Tell me about your item</h1>
          <p className="text-muted-foreground">
            Describe your item naturally, as if you're telling a friend about it.
            Include details about its condition, features, and your desired price.
          </p>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Example: I'm selling my iPhone 13 Pro that I bought last year. It's in great condition with no scratches. Comes with original charger and box. Looking to get around €800 for it."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[200px] text-lg leading-relaxed resize-none"
          />
          <MessageSquare className="absolute right-3 bottom-3 h-5 w-5 text-muted-foreground opacity-50" />
        </div>

        <Button 
          className="w-full h-12 text-lg"
          onClick={handleSubmit}
          disabled={isProcessing || !description.trim()}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Create Listing"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateListing;