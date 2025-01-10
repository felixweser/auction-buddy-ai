import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface Message {
  content: string;
  sender: "user" | "ai";
}

interface ChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  productTitle: string;
  onBack: () => void;
}

export const ChatSheet = ({
  isOpen,
  onOpenChange,
  messages,
  input,
  onInputChange,
  onSend,
  productTitle,
  onBack,
}: ChatSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Button 
              variant="agora" 
              size="icon"
              onClick={onBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            Chat about {productTitle}
          </SheetTitle>
        </SheetHeader>
        
        <ChatMessages messages={messages} />
        
        <div className="absolute bottom-4 left-4 right-4">
          <ChatInput
            value={input}
            onChange={onInputChange}
            onSend={onSend}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};