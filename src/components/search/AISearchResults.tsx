import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatInput } from '@/components/chat/ChatInput';
import { House, User, List, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  content: string;
  sender: 'ai' | 'user';
  type?: 'initial' | 'summary' | 'followup';
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAllProperties, setShowAllProperties] = useState(false);

  useEffect(() => {
    let summary = `Based on your search, I found ${properties.length} properties that might interest you. Here's what I found:\n\n`;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < summary.length) {
        setStreamingText(prev => prev + summary[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        
        const initialMessage = { content: summary, sender: 'ai' as const, type: 'initial' as const };
        const summaryMessage = {
          content: generateSummary(properties),
          sender: 'ai' as const,
          type: 'summary' as const
        };
        setMessages([initialMessage, summaryMessage]);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [properties, searchQuery]);

  const generateSummary = (properties: Property[]) => {
    if (properties.length === 0) {
      return "I couldn't find any properties matching your search criteria. Try adjusting your search terms or filters.\n";
    }

    const priceRange = {
      min: Math.min(...properties.map(p => p.price)),
      max: Math.max(...properties.map(p => p.price))
    };

    return `To summarize what I found:\n` +
           `• Price Range: €${priceRange.min.toLocaleString()} - €${priceRange.max.toLocaleString()}\n` +
           `• ${properties.length} properties available\n\n` +
           `Feel free to ask me any specific questions about these properties!`;
  };

  const handleFollowUpQuestion = () => {
    if (!followUpQuestion.trim()) return;
    
    const userMessage = { 
      content: followUpQuestion, 
      sender: 'user' as const,
      type: 'followup' as const 
    };
    
    const aiResponse = {
      content: `Let me help you with that question about ${followUpQuestion}...\n\nBased on the available properties, here's what I can tell you...`,
      sender: 'ai' as const,
      type: 'followup' as const
    };
    
    setMessages(prev => [...prev, userMessage, aiResponse]);
    setFollowUpQuestion('');
  };

  if (showAllProperties) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowAllProperties(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to AI Search
            </Button>
            <div className="text-lg font-medium">
              {properties.length} Properties Found
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card 
                key={property.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50"
                onClick={() => onPropertyClick({
                  listingId: property.id,
                  sellerId: property.created_by,
                  productTitle: property.title,
                  price: Number(property.price),
                  isNegotiable: property.is_negotiable,
                  description: property.description
                })}
              >
                <div className="p-4">
                  <div className="w-full aspect-video mb-4">
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
                  <h3 className="font-semibold text-base mb-2 truncate">{property.title}</h3>
                  <p className="text-lg font-bold text-primary mb-2">
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
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollArea className="flex-1 px-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-8 py-6">
          {/* Header with search query and view all button */}
          <div className="flex justify-between items-center border-b pb-4">
            <div className="text-2xl font-semibold">
              "{searchQuery}"
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setShowAllProperties(true)}
              title="View all properties"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>

          {/* Initial AI Response */}
          {!isComplete ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <House className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="text-foreground">
                    {streamingText}
                    <span className="inline-flex ml-1">
                      <span className="animate-pulse">▊</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <House className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="text-foreground">
                    {messages[0]?.content}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Property Listings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Best Matches</h3>
            {properties.slice(0, 3).map((property) => (
              <Card 
                key={property.id}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50"
                onClick={() => onPropertyClick({
                  listingId: property.id,
                  sellerId: property.created_by,
                  productTitle: property.title,
                  price: Number(property.price),
                  isNegotiable: property.is_negotiable,
                  description: property.description
                })}
              >
                <div className="flex gap-4 p-4">
                  <div className="w-32 h-24 shrink-0">
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
                    <h3 className="font-semibold text-base mb-1 truncate">{property.title}</h3>
                    <p className="text-lg font-bold text-primary mb-1">
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
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Messages Section */}
          <div className="space-y-6">
            {messages.slice(1).map((message, index) => (
              <div key={index}>
                {message.type === 'followup' && message.sender === 'user' && (
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-xl font-semibold">
                      "{message.content}"
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setShowAllProperties(true)}
                      title="View all properties"
                    >
                      <List className="h-5 w-5" />
                    </Button>
                  </div>
                )}
                {(message.type !== 'followup' || message.sender === 'ai') && (
                  <div className="flex items-start gap-3">
                    {message.sender === 'ai' ? (
                      <House className="w-6 h-6 text-primary shrink-0 mt-1" />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="text-foreground">
                        {message.content}
                      </div>
                    </div>
                  </div>
                )}
                {message.type === 'followup' && message.sender === 'user' && (
                  <div className="mt-4 space-y-4">
                    <h3 className="text-lg font-medium">Related Properties</h3>
                    {properties.slice(0, 3).map((property) => (
                      <Card 
                        key={property.id}
                        className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50"
                        onClick={() => onPropertyClick({
                          listingId: property.id,
                          sellerId: property.created_by,
                          productTitle: property.title,
                          price: Number(property.price),
                          isNegotiable: property.is_negotiable,
                          description: property.description
                        })}
                      >
                        <div className="flex gap-4 p-4">
                          <div className="w-32 h-24 shrink-0">
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
                            <h3 className="font-semibold text-base mb-1 truncate">{property.title}</h3>
                            <p className="text-lg font-bold text-primary mb-1">
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
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto p-4">
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