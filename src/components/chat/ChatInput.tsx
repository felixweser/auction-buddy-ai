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
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask a question..."
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        className="bg-card border-none text-foreground text-lg placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0 rounded-xl h-14"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button 
          variant="agora" 
          size="icon"
          className="rounded-full"
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button 
          variant="agora"
          size="icon"
          className="rounded-full"
          onClick={onSend}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};