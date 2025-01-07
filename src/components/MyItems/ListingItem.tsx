import { Listing } from "@/types/listing";

interface ListingItemProps {
  listing: Listing;
  onClick: () => void;
}

export const ListingItem = ({ listing, onClick }: ListingItemProps) => {
  return (
    <div
      className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="h-12 w-12 md:h-16 md:w-16 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={listing.image_url}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
          {listing.title}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
          {listing.description}
        </p>
      </div>
      <div className="text-primary">
        <span className="font-semibold text-sm md:text-base">${listing.price}</span>
      </div>
    </div>
  );
};