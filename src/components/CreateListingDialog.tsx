import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreateListingDialogProps {
  onListingCreated?: () => void;
}

export const CreateListingDialog = ({ onListingCreated }: CreateListingDialogProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/create-listing');
    onListingCreated?.();
  };

  return (
    <Button 
      variant="agora"
      size="default"
      className="fixed bottom-6 right-6 shadow-md"
      onClick={handleClick}
    >
      <Plus className="h-4 w-4" /> Anzeige erstellen
    </Button>
  );
};