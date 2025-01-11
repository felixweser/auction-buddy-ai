import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatInput } from '@/components/chat/ChatInput';
import { SearchBar } from '@/components/SearchBar';

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
    console.log('Follow-up question:', followUpQuestion);
    setFollowUpQuestion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={() => {}}
            onSearch={() => {}}
            priceRange={[0, 1000]}
            onPriceRangeChange={() => {}}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* AI Chat Section */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="prose prose-sm max-w-none">
                <div className="text-foreground">
                  {streamingText}
                  {!isComplete && (
                    <span className="inline-flex ml-1">
                      <span className="animate-pulse">▊</span>
                    </span>
                  )}
                </div>
              </div>
            </Card>
            
            <div className="sticky bottom-4">
              <ChatInput
                value={followUpQuestion}
                onChange={setFollowUpQuestion}
                onSend={handleFollowUpQuestion}
              />
            </div>
          </div>

          {/* Property Results */}
          <div className="lg:col-span-8">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-4 pr-4">
                {properties.map((property) => (
                  <Card 
                    key={property.id}
                    className="p-4 hover:shadow-lg transition-all duration-300 hover:bg-card/80 cursor-pointer"
                    onClick={() => onPropertyClick({
                      listingId: property.id,
                      sellerId: property.created_by,
                      productTitle: property.title,
                      price: Number(property.price),
                      isNegotiable: property.is_negotiable,
                      description: property.description
                    })}
                  >
                    <div className="flex gap-6">
                      <div className="w-40 h-32 shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-2 truncate">{property.title}</h3>
                        <p className="text-xl font-bold mb-2 text-primary">
                          €{Number(property.price).toLocaleString()}
                          {property.is_negotiable && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              (Negotiable)
                            </span>
                          )}
                        </p>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                          {property.description}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          {property.address_line1}, {property.city}, {property.state} {property.zip_code}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};