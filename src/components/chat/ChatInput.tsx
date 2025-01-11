import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export const ChatInput = ({ value, onChange, onSend }: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="relative">
      <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask me anything about these properties..."
            onKeyDown={handleKeyDown}
            className="bg-card border-none text-foreground text-lg placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0 rounded-xl h-14 pr-12"
          />
          <Button
            variant="agora"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={onSend}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};