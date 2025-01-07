import { Listing } from "@/types/listing";
import { DollarSign } from "lucide-react";

interface ListingItemProps {
  listing: Listing;
  onClick: () => void;
}

export const ListingItem = ({ listing, onClick }: ListingItemProps) => {
  return (
    <div
      className="flex items-center space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={listing.image_url}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">
          {listing.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {listing.description}
        </p>
      </div>
      <div className="flex items-center text-primary">
        <DollarSign className="w-4 h-4" />
        <span className="font-semibold">{listing.price}</span>
      </div>
    </div>
  );
};