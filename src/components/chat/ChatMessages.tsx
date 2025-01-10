import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  content: string;
  sender: "user" | "ai";
}

interface ChatMessagesProps {
  messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return (
    <ScrollArea className="flex-1 h-[calc(100vh-8rem)] mt-6">
      <div className="space-y-4 pr-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.sender === "user"
                  ? "bg-black/90 text-white"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};