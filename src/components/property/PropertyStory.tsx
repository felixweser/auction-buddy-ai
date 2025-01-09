import { Property } from "@/types/property";
import { Card } from "@/components/ui/card";
import { MapPin, Home, Layout } from "lucide-react";
import Image from "@/components/ui/image";

interface PropertyStoryProps {
  property: Property;
}

export const PropertyStory = ({ property }: PropertyStoryProps) => {
  // These would be AI-generated in the future
  const sections = [
    {
      title: "Location Story",
      icon: MapPin,
      content: "Nestled in the heart of a vibrant neighborhood, this property offers the perfect blend of urban convenience and residential tranquility. Within walking distance to local cafes, parks, and essential amenities, the location provides an ideal setting for modern living. The tree-lined streets and well-maintained surroundings create an inviting atmosphere that welcomes you home.",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027"
    },
    {
      title: "Living Spaces",
      icon: Home,
      content: "This thoughtfully designed home showcases an open-concept living area that seamlessly connects indoor and outdoor spaces. The abundant natural light streaming through large windows creates a bright and welcoming atmosphere throughout the day. High ceilings and premium finishes add a touch of luxury to every room.",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04"
    },
    {
      title: "Floor Plan Story",
      icon: Layout,
      content: "The intelligent floor plan maximizes space and functionality, featuring well-proportioned rooms that flow naturally from one to another. The kitchen serves as the heart of the home, with a layout that's perfect for both everyday meals and entertaining. The bedrooms are positioned to ensure privacy while maintaining easy access to common areas.",
      image: "https://images.unsplash.com/photo-1498936178812-4b2e558d2937"
    }
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-semibold mb-8">Property Story</h2>
      <div className="space-y-12">
        {sections.map((section, index) => (
          <Card key={index} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className={`space-y-4 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="flex items-center gap-2 text-primary">
                  <section.icon className="h-6 w-6" />
                  <h3 className="text-2xl font-semibold">{section.title}</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};