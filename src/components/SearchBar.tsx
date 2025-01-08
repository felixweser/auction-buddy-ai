import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Plus } from "lucide-react";
import { PriceFilter } from "./PriceFilter";
import { DistanceFilter } from "./DistanceFilter";
import { useSidebar } from "@/components/ui/sidebar";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  priceRange: number[];
  onPriceRangeChange: (value: number[]) => void;
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  onSearch,
  priceRange,
  onPriceRangeChange,
}: SearchBarProps) => {
  const [isPriceFilterOpen, setIsPriceFilterOpen] = React.useState(false);
  const [isDistanceFilterOpen, setIsDistanceFilterOpen] = React.useState(false);
  const [distanceRange, setDistanceRange] = React.useState([0, 25]);
  const { state } = useSidebar();

  return (
    <div className={`mx-auto space-y-4 transition-all duration-300 ease-in-out
      ${state === "expanded" ? "max-w-4xl" : "max-w-7xl"}`}>
      <div className="relative">
        <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50">
          <div className="relative">
            <Input
              placeholder="What are you looking for? (e.g., 'a used MacBook in good condition')"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="bg-card border-none text-foreground text-lg placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0 rounded-xl h-14"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={onSearch}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
            >
              <span>Price</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Attach</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setIsDistanceFilterOpen(!isDistanceFilterOpen)}
            >
              <span>Distance</span>
            </Button>
          </div>

          {isPriceFilterOpen && (
            <div className="mt-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <PriceFilter value={priceRange} onChange={onPriceRangeChange} />
            </div>
          )}

          {isDistanceFilterOpen && (
            <div className="mt-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <DistanceFilter value={distanceRange} onChange={setDistanceRange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};