interface ChatMessageProps {
  content: string;
  sender: "ai" | "user";
}

export const ChatMessage = ({ content, sender }: ChatMessageProps) => (
  <div
    className={`flex ${
      sender === "user" ? "justify-end" : "justify-start"
    }`}
  >
    <div
      className={`rounded-lg px-4 py-2 max-w-[80%] ${
        sender === "user"
          ? "bg-primary text-primary-foreground"
          : "bg-muted"
      }`}
    >
      {content}
    </div>
  </div>
);