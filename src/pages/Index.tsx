import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <main className="container mx-auto px-4 flex items-center justify-center min-h-screen relative">
            {/* Radial gradient background */}
            <div className="absolute pointer-events-none">
              <div 
                className="w-[800px] h-[600px] rounded-full"
                style={{
                  background: 'radial-gradient(circle at center, rgba(211, 228, 253, 0.6) 0%, rgba(14, 165, 233, 0.3) 50%, transparent 70%)',
                  filter: 'blur(100px)',
                  transform: 'translate(-50%, -50%)',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                }}
              />
            </div>
            
            <div className="w-full max-w-2xl relative z-10">
              <h1 className="text-4xl font-bold mb-2 text-center">Großanzeigen</h1>
              <p className="text-xl text-muted-foreground mb-8 text-center">Finden was man sucht!</p>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearch={handleSearch}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </div>
          </main>

          <Button 
            className="fixed bottom-6 right-6"
            onClick={() => navigate('/create-listing')}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Listing
          </Button>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;