import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

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
    <div className="border rounded-lg bg-card h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Conversations</h2>
      </div>
      <ScrollArea className="h-[calc(100%-65px)]">
        <div className="p-2 space-y-1">
          {chats.map((chat) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            return (
              <Button
                key={chat.listing_id}
                variant={selectedChat === chat.listing_id ? "secondary" : "ghost"}
                className="w-full justify-start p-4 h-auto"
                onClick={() => onSelectChat(chat.listing_id)}
              >
                <div className="flex flex-col items-start text-left space-y-1">
                  <p className="font-medium line-clamp-1">{chat.listing_title}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <p className="line-clamp-1">{lastMessage?.content}</p>
                    <span>•</span>
                    <p>{formatDistanceToNow(new Date(lastMessage?.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}