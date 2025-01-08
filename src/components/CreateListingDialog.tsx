import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CreateListingDialog = () => {
  const navigate = useNavigate();

  return (
    <Button 
      className="fixed bottom-6 right-6"
      onClick={() => navigate('/create-listing')}
    >
      <Plus className="mr-2 h-4 w-4" /> Erstellen Sie eine Anzeige
    </Button>
  );
};