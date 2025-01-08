import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  listings: {
    title: string;
  };
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId?: string;
}

interface UserProfile {
  username: string | null;
}

export function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      const userIds = [...new Set(messages.map(message => message.sender_id))];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (!error && data) {
        const profiles = data.reduce((acc, profile) => ({
          ...acc,
          [profile.id]: { username: profile.username }
        }), {});
        setUserProfiles(profiles);
      }
    };

    if (messages.length > 0) {
      fetchUserProfiles();
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="flex flex-col space-y-4 p-4 max-w-3xl mx-auto">
        {messages.map((message, index) => {
          const isCurrentUser = message.sender_id === currentUserId;
          const showUsername = index === 0 || 
            messages[index - 1]?.sender_id !== message.sender_id;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-2 space-y-1
                  ${isCurrentUser 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted"
                  }
                `}
              >
                {showUsername && (
                  <p className={`text-xs font-medium ${isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {isCurrentUser 
                      ? "You"
                      : userProfiles[message.sender_id]?.username || "Unknown User"}
                  </p>
                )}
                <p className="break-words text-sm">{message.content}</p>
                <p className={`text-xs ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"} text-right`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
