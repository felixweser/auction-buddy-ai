import React from 'react';
import { ListingCard } from "@/components/ListingCard";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_negotiable: boolean;
  created_by: string;
}

interface SearchResultsProps {
  listings: Listing[];
  onChat: (listing: Listing) => void;
}

export const SearchResults = ({ listings, onChat }: SearchResultsProps) => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            description={listing.description}
            price={listing.price}
            imageUrl={listing.image_url}
            isNegotiable={listing.is_negotiable}
            onChat={() => onChat(listing)}
          />
        ))}
      </div>
      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No items found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};