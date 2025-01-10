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
      className="fixed bottom-6 right-6"
      onClick={handleClick}
    >
      <Plus className="mr-2 h-4 w-4" /> Erstellen Sie eine Anzeige
    </Button>
  );
};