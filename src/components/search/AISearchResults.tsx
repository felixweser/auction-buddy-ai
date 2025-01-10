import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface AISearchResultsProps {
  properties: Property[];
  searchQuery: string;
  onPropertyClick: (property: {
    listingId: string;
    sellerId: string;
    productTitle: string;
    price: number;
    isNegotiable: boolean;
    description: string;
  }) => void;
}

export const AISearchResults = ({ properties, searchQuery, onPropertyClick }: AISearchResultsProps) => {
  const [streamingText, setStreamingText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let summary = `Based on your search for "${searchQuery}", I found ${properties.length} properties that might interest you. Here's a summary of what's available:\n\n`;
    
    if (properties.length > 0) {
      const priceRange = {
        min: Math.min(...properties.map(p => p.price)),
        max: Math.max(...properties.map(p => p.price))
      };
      
      summary += `Price Range: $${priceRange.min.toLocaleString()} - $${priceRange.max.toLocaleString()}\n`;
      summary += `Available Properties: ${properties.length}\n\n`;
      summary += `Let me break down these properties for you:\n\n`;
    } else {
      summary += "I couldn't find any properties matching your search criteria. Try adjusting your search terms or filters.\n";
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < summary.length) {
        setStreamingText(prev => prev + summary[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [properties, searchQuery]);

  const handlePropertyClick = (property: Property) => {
    onPropertyClick({
      listingId: property.id,
      sellerId: property.created_by,
      productTitle: property.title,
      price: property.price,
      isNegotiable: property.is_negotiable,
      description: property.description
    });
  };

  return (
    <div className="space-y-6">
      {/* Streaming text section */}
      <div className="bg-card rounded-lg p-6 text-sm whitespace-pre-wrap">
        {streamingText}
        {!isComplete && (
          <span className="inline-flex ml-2">
            <span className="animate-pulse">▊</span>
          </span>
        )}
      </div>

      {/* Property cards */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {properties.map((property) => (
          <Card 
            key={property.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handlePropertyClick(property)}
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48">
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Skeleton className="w-full h-full rounded-lg" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                <p className="text-2xl font-bold mb-4">
                  ${property.price.toLocaleString()}
                </p>
                <p className="text-muted-foreground line-clamp-3">
                  {property.description}
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  {property.address_line1}, {property.city}, {property.state} {property.zip_code}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};