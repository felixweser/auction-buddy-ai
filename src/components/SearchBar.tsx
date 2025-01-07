import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Plus, Languages, MonitorSmartphone } from "lucide-react";
import { PriceFilter } from "./PriceFilter";

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="relative">
        <div className="bg-[#1E1E1E] rounded-xl p-6 shadow-lg">
          <div className="relative">
            <Input
              placeholder="What are you looking for? (e.g., 'a used MacBook in good condition')"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="bg-transparent border-none text-white text-xl placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={onSearch}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-gray-400">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 hover:text-white"
              onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
            >
              <span>Price</span>
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 hover:text-white">
              <Plus className="h-4 w-4" />
              <span>Attach</span>
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 hover:text-white">
              <Languages className="h-4 w-4" />
              <span>Language</span>
            </Button>
            <Button variant="ghost" className="flex items-center gap-2 hover:text-white">
              <MonitorSmartphone className="h-4 w-4" />
              <span>Display</span>
            </Button>
          </div>

          {isPriceFilterOpen && (
            <div className="mt-4 p-4 bg-[#2A2A2A] rounded-lg">
              <PriceFilter value={priceRange} onChange={onPriceRangeChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};