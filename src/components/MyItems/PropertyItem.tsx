import { Property } from "@/types/property";
import { Edit, MessageSquare, Trash2, ChartBar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PropertyItemProps {
  property: Property;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const PropertyItem = ({ property, onClick, onDelete }: PropertyItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", property.id);

    if (error) {
      toast.error("Failed to delete property");
      return;
    }

    toast.success("Property deleted successfully");
    onDelete(property.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="group relative flex flex-col md:flex-row gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all">
      <div 
        className="w-full md:w-32 h-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={property.image_url}
          alt={property.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div 
          className="cursor-pointer"
          onClick={onClick}
        >
          <h3 className="font-semibold text-base md:text-lg text-foreground">
            {property.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {property.description}
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>{property.address_line1}</p>
            {property.address_line2 && <p>{property.address_line2}</p>}
            <p>{`${property.city}, ${property.state} ${property.zip_code}`}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-semibold text-primary">
            ${property.price.toLocaleString()}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/property/${property.id}/insights`)}
              className="flex items-center gap-2"
            >
              <ChartBar className="h-4 w-4" />
              <span className="hidden md:inline">View Insights</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClick}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden md:inline">Edit Property</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your property listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};