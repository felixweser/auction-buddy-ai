import { useState, useEffect, useRef } from 'react';
import { Property } from '@/types/property';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import * as THREE from 'three';

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
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const houseRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(64, 64); // Same size as the avatar container
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create house
    const house = new THREE.Group();
    
    // Main cube (house body)
    const bodyGeometry = new THREE.BoxGeometry(2, 2, 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4a90e2 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    house.add(body);

    // Roof (pyramid)
    const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.5;
    house.add(roof);

    // Add house to scene
    scene.add(house);
    houseRef.current = house;

    // Animation loop
    const animate = () => {
      if (!isComplete && houseRef.current) {
        houseRef.current.rotation.y += 0.03;
      }
      rendererRef.current?.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Stop animation when streaming is complete
  useEffect(() => {
    if (isComplete && houseRef.current) {
      houseRef.current.rotation.y = 0;
    }
  }, [isComplete]);

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

  return (
    <div className="max-w-4xl mx-auto">
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-6 p-6">
          {/* AI Response */}
          <div className="flex gap-4">
            <div ref={mountRef} className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              {isComplete && <div className="text-white">AI</div>}
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
    </div>
  );
};