import { Listing } from "@/types/listing";
import { Edit, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListingItemProps {
  listing: Listing;
  onClick: () => void;
}

export const ListingItem = ({ listing, onClick }: ListingItemProps) => {
  return (
    <div
      className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div 
        className="h-12 w-12 md:h-16 md:w-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={listing.image_url}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={onClick}
      >
        <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
          {listing.title}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
          {listing.description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-primary">
          <span className="font-semibold text-sm md:text-base">${listing.price}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};