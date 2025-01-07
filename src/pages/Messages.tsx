import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  listing_id: string;
  listing_title: string;
}

interface ChatGroup {
  listing_id: string;
  listing_title: string;
  messages: Message[];
}

const Messages = () => {
  const [chats, setChats] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            listing_id,
            listings (
              title
            )
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group messages by listing
        const groupedChats = data.reduce((acc: ChatGroup[], message: any) => {
          const existingGroup = acc.find(group => group.listing_id === message.listing_id);
          if (existingGroup) {
            existingGroup.messages.push({
              id: message.id,
              content: message.content,
              created_at: message.created_at,
              sender_id: message.sender_id,
              listing_id: message.listing_id,
              listing_title: message.listings.title
            });
          } else {
            acc.push({
              listing_id: message.listing_id,
              listing_title: message.listings.title,
              messages: [{
                id: message.id,
                content: message.content,
                created_at: message.created_at,
                sender_id: message.sender_id,
                listing_id: message.listing_id,
                listing_title: message.listings.title
              }]
            });
          }
          return acc;
        }, []);

        setChats(groupedChats);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen bg-background">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      {chats.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[300px,1fr] gap-6">
          {/* Chat List */}
          <div className="border rounded-lg bg-card">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4 space-y-2">
                {chats.map((chat) => (
                  <Button
                    key={chat.listing_id}
                    variant={selectedChat === chat.listing_id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedChat(chat.listing_id)}
                  >
                    <div className="truncate">
                      <p className="font-medium">{chat.listing_title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.messages[0].content}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Messages */}
          <div className="border rounded-lg bg-card p-4">
            {selectedChat ? (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                  {chats
                    .find(chat => chat.listing_id === selectedChat)
                    ?.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === (supabase.auth.getUser() as any).data?.user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === (supabase.auth.getUser() as any).data?.user?.id
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;