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
    <div className={`mx-auto space-y-8 transition-all duration-300 ease-in-out
      ${state === "expanded" ? "max-w-3xl" : "max-w-5xl"}`}>
      <div className="relative">
        <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
          <div className="relative">
            <Input
              placeholder="What are you looking for? (e.g., 'a used MacBook in good condition')"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="bg-transparent border-none text-foreground text-2xl placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={onSearch}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-6 text-muted-foreground">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 hover:text-foreground"
              onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
            >
              <span>Price</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              <span>Attach</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 hover:text-foreground"
              onClick={() => setIsDistanceFilterOpen(!isDistanceFilterOpen)}
            >
              <span>Distance</span>
            </Button>
          </div>

          {isPriceFilterOpen && (
            <div className="mt-4 p-4 bg-card/50 rounded-lg border border-border">
              <PriceFilter value={priceRange} onChange={onPriceRangeChange} />
            </div>
          )}

          {isDistanceFilterOpen && (
            <div className="mt-4 p-4 bg-card/50 rounded-lg border border-border">
              <DistanceFilter value={distanceRange} onChange={setDistanceRange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};