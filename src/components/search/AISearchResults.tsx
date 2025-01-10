import { useState, useEffect } from "react";
import { Property } from "@/types/property";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AISearchResultsProps {
  properties: Property[];
  searchQuery: string;
}

export const AISearchResults = ({ properties, searchQuery }: AISearchResultsProps) => {
  const [streamingText, setStreamingText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!properties.length) return;

    // Generate the summary text
    const summary = `I found ${properties.length} properties matching your search for "${searchQuery}". Here's a detailed breakdown:\n\n`;
    
    const propertyDescriptions = properties.map(property => (
      `🏠 ${property.title}\n` +
      `Located in ${property.city}, this property is priced at €${property.price.toLocaleString()}. ` +
      `${property.description}\n\n`
    )).join("");

    const fullText = summary + propertyDescriptions;
    let currentIndex = 0;

    // Simulate streaming effect
    const streamInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setStreamingText(prev => prev + fullText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        setIsComplete(true);
      }
    }, 20);

    return () => clearInterval(streamInterval);
  }, [properties, searchQuery]);

  if (!properties.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No properties found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streaming text section */}
      <div className="bg-card rounded-lg p-6 text-sm whitespace-pre-wrap">
        {streamingText}
        {!isComplete && (
          <span className="inline-flex ml-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        )}
      </div>

      {/* Clickable property cards */}
      {isComplete && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/property/${property.id}`)}
            >
              <div className="aspect-video relative overflow-hidden rounded-md mb-4">
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold mb-2">{property.title}</h3>
              <p className="text-lg font-bold text-[#D3E4FD] mb-2">
                €{property.price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {property.description}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};