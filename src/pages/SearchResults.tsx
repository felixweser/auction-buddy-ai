import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AISearchResults } from "@/components/search/AISearchResults";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [properties, setProperties] = useState<Property[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          property_details (*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch properties",
          variant: "destructive",
        });
        return;
      }

      if (!data) return;
      setProperties(data as Property[]);
    };

    fetchProperties();
  }, [toast]);

  const handlePropertyClick = (property: {
    listingId: string;
    sellerId: string;
    productTitle: string;
    price: number;
    isNegotiable: boolean;
    description: string;
  }) => {
    navigate(`/property/${property.listingId}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <AISearchResults 
            properties={properties} 
            searchQuery={query} 
            onPropertyClick={handlePropertyClick}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SearchResults;