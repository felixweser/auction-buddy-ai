import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatGroup {
  listing_id: string;
  listing_title: string;
  messages: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    listing_id: string;
    listings: {
      title: string;
    };
  }[];
}

interface ChatListProps {
  chats: ChatGroup[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  return (
    <div className="border rounded-lg bg-card">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          {chats.map((chat) => (
            <Button
              key={chat.listing_id}
              variant={selectedChat === chat.listing_id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectChat(chat.listing_id)}
            >
              <div className="truncate">
                <p className="font-medium">{chat.listing_title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.messages[0]?.content}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}