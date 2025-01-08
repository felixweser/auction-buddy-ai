import { MessageCircle } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
      <p className="text-muted-foreground text-sm">
        When you start a conversation, it will appear here
      </p>
    </div>
  );
}