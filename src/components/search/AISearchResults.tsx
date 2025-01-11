import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatInput } from '@/components/chat/ChatInput';
import { Robot, User } from 'lucide-react';

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

  useEffect(() => {
    let summary = `Based on your search for "${searchQuery}", I found ${properties.length} properties that might interest you. Here's what I found:\n\n`;
    
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollArea className="flex-1 px-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-6 py-6">
          {/* Initial AI Response */}
          {!isComplete ? (
            <div className="flex items-start gap-3">
              <Robot className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div className="flex-1 bg-muted rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
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
            <div className="flex items-start gap-3">
              <Robot className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div className="flex-1 bg-muted rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="text-foreground">
                    {messages[0]?.content}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Property Listings */}
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

          {/* Messages Section */}
          <div className="space-y-6 mt-8">
            {messages.slice(1).map((message, index) => (
              <div key={index} className="flex items-start gap-3">
                {message.sender === 'ai' ? (
                  <Robot className="w-6 h-6 text-primary shrink-0 mt-1" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />
                )}
                <div
                  className={`flex-1 rounded-lg p-4 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
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