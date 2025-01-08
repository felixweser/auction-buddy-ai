interface ChatHeaderProps {
  title: string;
}

export function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <div className="border-b px-6 py-4">
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}