import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { EditPanel } from "@/components/MyItems/EditPanel";
import { PropertyItem } from "@/components/MyItems/PropertyItem";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/types/property";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateListingDialog } from "@/components/CreateListingDialog";

const MyItems = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchMyProperties = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to view your properties",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*, property_details(*)")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your properties",
        variant: "destructive",
      });
      return;
    }

    setProperties(data as Property[]);
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setEditedProperty(property);
  };

  const handleCloseEdit = () => {
    setSelectedProperty(null);
    setEditedProperty(null);
  };

  const handlePropertyUpdate = (updatedProperty: Property) => {
    setProperties(properties.map(property => 
      property.id === updatedProperty.id ? updatedProperty : property
    ));
    handleCloseEdit();
    fetchMyProperties();
  };

  const handlePropertyDelete = (deletedId: string) => {
    setProperties(properties.filter(property => property.id !== deletedId));
  };

  const handlePropertyCreated = () => {
    fetchMyProperties();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <header className="border-b">
            <div className="container mx-auto flex items-center justify-between px-4 py-4 md:py-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black">My Properties</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
                  Manage your listed properties
                </p>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-4 md:py-8">
            <div className="space-y-3 md:space-y-4">
              {properties.map((property) => (
                <PropertyItem
                  key={property.id}
                  property={property}
                  onClick={() => handlePropertyClick(property)}
                  onDelete={handlePropertyDelete}
                />
              ))}

              {properties.length === 0 && (
                <div className="text-center py-8 md:py-12">
                  <p className="text-muted-foreground text-sm md:text-base">
                    You haven't listed any properties yet. Create your first property listing!
                  </p>
                </div>
              )}
            </div>
          </main>

          <EditPanel
            listing={selectedProperty}
            editedListing={editedProperty}
            setEditedListing={setEditedProperty as any}
            onClose={handleCloseEdit}
            onUpdate={handlePropertyUpdate as any}
            isMobile={isMobile}
          />

          <CreateListingDialog onListingCreated={handlePropertyCreated} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MyItems;