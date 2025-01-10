import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export const ChatInput = ({ value, onChange, onSend }: ChatInputProps) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask a question..."
        onKeyPress={(e) => e.key === "Enter" && onSend()}
        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500"
      />
      <div className="flex items-center gap-2 pr-2">
        <Button 
          size="icon" 
          variant="agora"
          className="rounded-full"
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button 
          size="icon"
          variant="agora"
          className="rounded-full"
          onClick={onSend}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};