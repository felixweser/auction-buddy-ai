import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatList } from "@/components/Messages/ChatList";
import { ChatMessages } from "@/components/Messages/ChatMessages";
import { EmptyState } from "@/components/Messages/EmptyState";
import { Message } from "@/types/property";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view messages",
          variant: "destructive",
        });
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          properties!inner (
            *,
            property_details (*)
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch messages",
          variant: "destructive",
        });
        return;
      }

      setMessages(data as Message[]);
    };

    fetchMessages();
  }, [toast]);

  const groupedChats = messages.reduce((acc: any[], message: Message) => {
    const existingChat = acc.find(chat => chat.listing_id === message.listing_id);
    if (existingChat) {
      existingChat.messages.push(message);
      return acc;
    }

    return [...acc, {
      listing_id: message.listing_id,
      listing_title: message.property?.title || "Unknown Property",
      messages: [message]
    }];
  }, []);

  const selectedChat = groupedChats.find(chat => chat.listing_id === selectedChatId);

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r">
        <ChatList
          chats={groupedChats}
          selectedChat={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </div>
      <div className="flex-1">
        {selectedChat ? (
          <ChatMessages
            messages={selectedChat.messages}
            currentUserId={currentUserId}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Messages;