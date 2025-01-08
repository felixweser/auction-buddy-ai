import { useSearchParams } from "react-router-dom";
import { SearchResults as SearchResultsComponent } from "@/components/SearchResults";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="container py-8 px-4 md:px-6">
      <SearchResultsComponent query={query} />
    </div>
  );
}