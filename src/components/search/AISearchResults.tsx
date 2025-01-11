import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatInput } from '@/components/chat/ChatInput';

interface Message {
  content: string;
  sender: 'ai' | 'user';
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
        // Add initial AI message to chat
        setMessages([{ content: summary, sender: 'ai' }]);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [properties, searchQuery]);

  const handleFollowUpQuestion = () => {
    if (!followUpQuestion.trim()) return;
    
    // Add user's question to messages
    setMessages(prev => [...prev, { content: followUpQuestion, sender: 'user' }]);
    
    // Clear input after sending
    setFollowUpQuestion('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollArea className="flex-1 px-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-6 py-6">
          {/* Chat Messages */}
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg p-4 max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {!isComplete && (
              <div className="bg-muted rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="text-foreground">
                    {streamingText}
                    <span className="inline-flex ml-1">
                      <span className="animate-pulse">▊</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Property Results */}
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
      </ScrollArea>

      {/* Sticky Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/30">
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