import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatList } from "@/components/Messages/ChatList";
import { ChatMessages } from "@/components/Messages/ChatMessages";
import { MessageInput } from "@/components/Messages/MessageInput";
import { EmptyState } from "@/components/Messages/EmptyState";
import { ChatHeader } from "@/components/Messages/ChatHeader";

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
      console.log("Fetching messages...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }
      
      setCurrentUserId(user.id);
      console.log("Current user ID:", user.id);

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

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      console.log("Fetched messages:", data);

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

      console.log("Grouped chats:", groupedChats);
      setChats(groupedChats);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !currentUserId) {
      console.log("Cannot send message:", { selectedChat, newMessage, currentUserId });
      return;
    }

    try {
      console.log("Sending message...");
      const selectedChatGroup = chats.find(chat => chat.listing_id === selectedChat);
      if (!selectedChatGroup) {
        console.log("No chat group found for:", selectedChat);
        return;
      }

      // Find the other user in the conversation (not the current user)
      const mostRecentMessage = selectedChatGroup.messages[selectedChatGroup.messages.length - 1];
      const receiver_id = mostRecentMessage.sender_id === currentUserId
        ? mostRecentMessage.receiver_id
        : mostRecentMessage.sender_id;

      console.log("Sending message to receiver:", receiver_id);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: currentUserId,
          receiver_id,
          listing_id: selectedChat
        })
        .select();

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }

      console.log("Message sent successfully:", data);
      setNewMessage("");
      // Fetch messages immediately after sending
      await fetchMessages();

      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("Initial fetch of messages");
    fetchMessages();

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground animate-pulse">Loading messages...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const selectedChatGroup = chats.find(chat => chat.listing_id === selectedChat);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Messages</h1>
            
            {chats.length === 0 ? (
              <div className="border rounded-lg bg-card h-[calc(100vh-200px)]">
                <EmptyState />
              </div>
            ) : (
              <div className="grid md:grid-cols-[350px,1fr] gap-6 h-[calc(100vh-200px)]">
                <ChatList
                  chats={chats}
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />

                <div className="border rounded-lg bg-card flex flex-col">
                  {selectedChat ? (
                    <>
                      <ChatHeader title={selectedChatGroup?.listing_title || ""} />
                      <div className="flex-1 overflow-hidden">
                        <ChatMessages
                          messages={selectedChatGroup?.messages || []}
                          currentUserId={currentUserId}
                        />
                      </div>
                      <MessageInput
                        value={newMessage}
                        onChange={setNewMessage}
                        onSend={handleSendMessage}
                      />
                    </>
                  ) : (
                    <EmptyState />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Messages;
