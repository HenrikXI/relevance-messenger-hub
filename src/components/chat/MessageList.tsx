
import React, { useRef, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import MessageItem from "./MessageItem";

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  read: boolean;
}

interface MessageListProps {
  messages: ChatMessage[];
  formatTime: (date: Date) => string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, formatTime }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center">
          Keine Nachrichten vorhanden. Starten Sie die Unterhaltung!
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6">
      {messages.map((message, index) => {
        // Display date if it's the first message or if the date has changed
        const showDate =
          index === 0 ||
          message.timestamp.toDateString() !==
            messages[index - 1].timestamp.toDateString();

        return (
          <div key={message.id} className="space-y-2">
            {showDate && (
              <div className="relative py-2">
                <Separator className="absolute inset-0 my-auto" />
                <span className="relative bg-background px-2 text-xs text-muted-foreground mx-auto w-auto flex justify-center">
                  {message.timestamp.toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            <MessageItem
              id={message.id}
              text={message.text}
              sender={message.sender}
              timestamp={message.timestamp}
              read={message.read}
              formatTime={formatTime}
            />
          </div>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
