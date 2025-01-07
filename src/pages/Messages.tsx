import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  listing_id: string;
  listings: {
    title: string;
  };
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
  const [newMessage, setNewMessage] = useState("");
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
              listings: message.listings
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
                listings: message.listings
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

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, fetchMessages)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the receiver_id from the most recent message in the chat
      const selectedChatGroup = chats.find(chat => chat.listing_id === selectedChat);
      if (!selectedChatGroup) return;

      const mostRecentMessage = selectedChatGroup.messages[0];
      const receiver_id = mostRecentMessage.sender_id === user.id 
        ? mostRecentMessage.sender_id 
        : user.id;

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: user.id,
          receiver_id,
          listing_id: selectedChat
        });

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          
          {chats.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[300px,1fr] gap-6 h-[calc(100vh-200px)]">
              {/* Chat List */}
              <div className="border rounded-lg bg-card">
                <ScrollArea className="h-full">
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
              <div className="border rounded-lg bg-card flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  {selectedChat ? (
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
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Select a conversation to view messages
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                {selectedChat && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Messages;