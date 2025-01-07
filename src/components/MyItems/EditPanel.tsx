import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@/types/listing";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";

interface EditPanelProps {
  listing: Listing | null;
  editedListing: Listing | null;
  setEditedListing: (listing: Listing | null) => void;
  onClose: () => void;
  onUpdate: (listing: Listing) => void;
}

export const EditPanel = ({
  listing,
  editedListing,
  setEditedListing,
  onClose,
  onUpdate,
}: EditPanelProps) => {
  const { toast } = useToast();

  const handleSave = async () => {
    if (!editedListing) return;

    const { data, error } = await supabase
      .from("listings")
      .update({
        title: editedListing.title,
        description: editedListing.description,
        price: editedListing.price,
        is_negotiable: editedListing.is_negotiable,
      })
      .eq("id", editedListing.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your listing has been updated successfully!",
    });
    
    onUpdate(data as Listing);
  };

  return (
    <Sheet open={!!listing} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit Listing</SheetTitle>
        </SheetHeader>
        
        {editedListing && (
          <div className="space-y-6 mt-6">
            <div className="aspect-video rounded-lg overflow-hidden bg-accent">
              <img
                src={editedListing.image_url}
                alt={editedListing.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Title
                </label>
                <Input
                  id="title"
                  value={editedListing.title}
                  onChange={(e) => setEditedListing({
                    ...editedListing,
                    title: e.target.value
                  })}
                />
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={editedListing.description}
                  onChange={(e) => setEditedListing({
                    ...editedListing,
                    description: e.target.value
                  })}
                  className="h-32"
                />
              </div>

              <div>
                <label htmlFor="price" className="text-sm font-medium text-foreground">
                  Price
                </label>
                <Input
                  id="price"
                  type="number"
                  value={editedListing.price}
                  onChange={(e) => setEditedListing({
                    ...editedListing,
                    price: Number(e.target.value)
                  })}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};