import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatList } from "@/components/Messages/ChatList";
import { ChatMessages } from "@/components/Messages/ChatMessages";
import { MessageInput } from "@/components/Messages/MessageInput";

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
  const [currentUserId, setCurrentUserId] = useState<string>();
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          listing_id,
          listings (
            title
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group messages by listing
      const groupedChats = data.reduce((acc: ChatGroup[], message: Message) => {
        const existingGroup = acc.find(group => group.listing_id === message.listing_id);
        if (existingGroup) {
          existingGroup.messages.push(message);
        } else {
          acc.push({
            listing_id: message.listing_id,
            listing_title: message.listings.title,
            messages: [message]
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

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchMessages(); // Refresh messages when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !currentUserId) return;

    try {
      const selectedChatGroup = chats.find(chat => chat.listing_id === selectedChat);
      if (!selectedChatGroup) return;

      // Find the other user in the conversation (not the current user)
      const mostRecentMessage = selectedChatGroup.messages[selectedChatGroup.messages.length - 1];
      const receiver_id = mostRecentMessage.sender_id === currentUserId
        ? mostRecentMessage.receiver_id
        : mostRecentMessage.sender_id;

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: currentUserId,
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
              <ChatList
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />

              <div className="border rounded-lg bg-card flex flex-col">
                {selectedChat ? (
                  <>
                    <ChatMessages
                      messages={chats.find(chat => chat.listing_id === selectedChat)?.messages || []}
                      currentUserId={currentUserId}
                    />
                    <MessageInput
                      value={newMessage}
                      onChange={setNewMessage}
                      onSend={handleSendMessage}
                    />
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a conversation to view messages
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