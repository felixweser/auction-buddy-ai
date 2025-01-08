import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  // Fetch user profiles
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

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          // Use requestAnimationFrame to ensure the scroll happens after render
          requestAnimationFrame(() => {
            viewport.scrollTop = viewport.scrollHeight;
          });
        }
      }
    };

    // Initial scroll
    scrollToBottom();

    // Set up a small delay to handle any potential layout shifts
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]); // Re-run when messages change

  return (
    <ScrollArea 
      ref={scrollRef}
      className="flex-1 p-4"
      style={{ height: 'calc(100vh - 220px)' }}
    >
      <div className="space-y-2">
        {messages.map((message, index) => {
          const isCurrentUser = message.sender_id === currentUserId;
          const showUsername = index === 0 || 
            messages[index - 1]?.sender_id !== message.sender_id;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[70%] rounded-2xl px-4 py-2
                  ${isCurrentUser 
                    ? 'bg-primary text-primary-foreground ml-auto rounded-br-none' 
                    : 'bg-muted rounded-bl-none'
                  }
                `}
              >
                {showUsername && (
                  <p className="text-xs font-medium mb-1">
                    {isCurrentUser 
                      ? 'You'
                      : userProfiles[message.sender_id]?.username || 'Unknown User'}
                  </p>
                )}
                <p className="break-words">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}