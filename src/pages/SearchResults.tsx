import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SearchResults as SearchResultsComponent } from "@/components/SearchResults";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="outline"
            className="flex items-center gap-2 mb-6 hover:bg-secondary transition-colors"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-foreground">
              Search results for "<span className="text-primary">{query}</span>"
            </h1>
            <SearchResultsComponent query={query} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;