import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatInput } from '@/components/chat/ChatInput';

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
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  useEffect(() => {
    let summary = `Based on your search for "${searchQuery}", I found ${properties.length} properties that might interest you. Here's a summary of what's available:\n\n`;
    
    if (properties.length > 0) {
      const priceRange = {
        min: Math.min(...properties.map(p => p.price)),
        max: Math.max(...properties.map(p => p.price))
      };
      
      summary += `Price Range: €${priceRange.min.toLocaleString()} - €${priceRange.max.toLocaleString()}\n`;
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

  const handleFollowUpQuestion = () => {
    if (!followUpQuestion.trim()) return;
    // Handle the follow-up question here
    console.log('Follow-up question:', followUpQuestion);
    setFollowUpQuestion('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ScrollArea className="min-h-0">
        <div className="space-y-6 p-6">
          {/* AI Response */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              AI
            </div>
            <div className="flex-1">
              <div className="prose prose-sm max-w-none">
                <div className="bg-card/50 rounded-lg p-6">
                  {streamingText}
                  {!isComplete && (
                    <span className="inline-flex ml-1">
                      <span className="animate-pulse">▊</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Property Results */}
              {isComplete && properties.length > 0 && (
                <div className="mt-6 space-y-4">
                  {properties.map((property) => (
                    <Card 
                      key={property.id}
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => onPropertyClick({
                        listingId: property.id,
                        sellerId: property.created_by,
                        productTitle: property.title,
                        price: Number(property.price),
                        isNegotiable: property.is_negotiable,
                        description: property.description
                      })}
                    >
                      <div className="flex gap-4">
                        <div className="w-32 h-32">
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
                          <p className="text-xl font-bold mb-2">
                            €{Number(property.price).toLocaleString()}
                            {property.is_negotiable && (
                              <span className="text-sm font-normal text-muted-foreground ml-2">
                                (Negotiable)
                              </span>
                            )}
                          </p>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {property.description}
                          </p>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {property.address_line1}, {property.city}, {property.state} {property.zip_code}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Chat Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            value={followUpQuestion}
            onChange={setFollowUpQuestion}
            onSend={handleFollowUpQuestion}
          />
        </div>
      </div>
    </div>
  );
};