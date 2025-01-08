import { useEffect, useRef } from "react";
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

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

  return (
    <ScrollArea 
      className="flex-1 p-4 h-[calc(100vh-300px)]" 
      ref={scrollAreaRef}
    >
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === currentUserId
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted'
              }`}
            >
              <p className="text-xs font-medium mb-1">
                {message.sender_id === currentUserId 
                  ? 'You'
                  : userProfiles[message.sender_id]?.username || 'Unknown User'}
              </p>
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}