import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { SearchResults as SearchResultsGrid } from "@/components/SearchResults";
import { AISearchResults } from "@/components/search/AISearchResults";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { useToast } from "@/hooks/use-toast";
import { ChatDialog } from "@/components/ChatDialog";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [viewMode, setViewMode] = useState<"ai" | "grid">("ai");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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

  const handleChatOpen = ({
    listingId,
    sellerId,
    productTitle,
    price,
    isNegotiable,
    description,
  }: {
    listingId: string;
    sellerId: string;
    productTitle: string;
    price: number;
    isNegotiable: boolean;
    description: string;
  }) => {
    const property = properties.find((p) => p.id === listingId);
    if (property) {
      setSelectedProperty(property);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="agora"
              className="flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Startseite
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "ai" ? "grid" : "ai")}
              className="ml-4"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-foreground">
              Suchergebnisse für "<span className="text-[#D3E4FD]">{query}</span>"
            </h1>
            
            {viewMode === "ai" ? (
              <AISearchResults 
                properties={properties} 
                searchQuery={query} 
                onPropertyClick={handleChatOpen}
              />
            ) : (
              <SearchResultsGrid />
            )}
          </div>
        </div>
      </div>

      {selectedProperty && (
        <ChatDialog
          productTitle={selectedProperty.title}
          listingId={selectedProperty.id}
          sellerId={selectedProperty.created_by}
          price={selectedProperty.price}
          isNegotiable={selectedProperty.is_negotiable}
          description={selectedProperty.description}
        />
      )}
    </div>
  );
};

export default SearchResults;