import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  content: string;
  sender: "ai" | "user";
  type?: "title" | "description" | "price";
}

interface ChatWindowProps {
  messages: Message[];
  input: string;
  isProcessing: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export const ChatWindow = ({
  messages,
  input,
  isProcessing,
  onInputChange,
  onSend
}: ChatWindowProps) => (
  <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 relative">
    <ScrollArea className="h-[400px] pr-4 mb-4">
      <div className="space-y-4">
        {messages.map((message, i) => (
          <ChatMessage key={i} content={message.content} sender={message.sender} />
        ))}
      </div>
    </ScrollArea>

    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Type your answer..."
        onKeyPress={(e) => e.key === "Enter" && onSend()}
        className="flex-1"
      />
      <Button 
        onClick={onSend}
        disabled={isProcessing || !input.trim()}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Send"
        )}
      </Button>
    </div>
  </div>
);