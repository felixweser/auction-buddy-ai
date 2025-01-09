import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatList } from "@/components/Messages/ChatList";
import { ChatMessages } from "@/components/Messages/ChatMessages";
import { EmptyState } from "@/components/Messages/EmptyState";
import { Message, ChatGroup } from "@/types/property";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
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

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          property:listing_id (
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

  const groupMessages = (messages: Message[]): ChatGroup[] => {
    return messages.reduce((acc: ChatGroup[], message: Message) => {
      const property = message.property;
      if (!property) return acc;

      const existingGroup = acc.find(g => g.property.id === property.id);
      if (existingGroup) {
        existingGroup.messages.push(message);
        return acc;
      }

      const otherUserId = message.sender_id;
      const newGroup: ChatGroup = {
        property,
        messages: [message],
        otherUser: {
          id: otherUserId,
          username: null // We'll fetch this separately
        }
      };
      
      return [...acc, newGroup];
    }, []);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r">
        <ChatList
          groups={groupMessages(messages)}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />
      </div>
      <div className="flex-1">
        {selectedGroup ? (
          <ChatMessages group={selectedGroup} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default Messages;