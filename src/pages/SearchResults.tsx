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
      <div className="container mx-auto py-8">
        <Button
          variant="outline"
          className="flex items-center gap-2 mb-8 hover:bg-secondary transition-colors"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <div>
          <h1 className="text-2xl font-semibold mb-6">
            Search results for "{query}"
          </h1>
          <SearchResultsComponent query={query} />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;