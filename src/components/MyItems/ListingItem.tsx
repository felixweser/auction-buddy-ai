import { Listing } from "@/types/listing";
import { Edit, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/ChatDialog";
import { useState } from "react";

interface ListingItemProps {
  listing: Listing;
  onClick: () => void;
}

export const ListingItem = ({ listing, onClick }: ListingItemProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="group relative flex flex-col md:flex-row gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all">
      <div 
        className="w-full md:w-32 h-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={listing.image_url}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div 
          className="cursor-pointer"
          onClick={onClick}
        >
          <h3 className="font-semibold text-base md:text-lg text-foreground">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-semibold text-primary">
            ${listing.price}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClick}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden md:inline">Edit Listing</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Messages</span>
            </Button>
          </div>
        </div>
      </div>

      <ChatDialog 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen}
        productTitle={listing.title}
        listingId={listing.id}
        sellerId={listing.created_by}
      />
    </div>
  );
};