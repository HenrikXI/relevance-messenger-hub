
import React, { useEffect, useRef } from "react";
import { Message } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface MessageListProps {
  messages: Message[];
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, className }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollArea className={`h-full w-full ${className || ''}`}>
      <div className="px-1 pt-1 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              Keine Nachrichten. Wählen Sie ein Projekt und beginnen Sie die Konversation.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // Display date if it's the first message or if the date has changed
              const showDate =
                index === 0 ||
                new Date(message.timestamp).toDateString() !==
                  new Date(messages[index - 1].timestamp).toDateString();

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

                  <div
                    className={`group flex flex-col animate-slide-up animation-delay-${
                      index % 3
                    }00`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          message.sender === 'user'
                            ? 'bg-secondary-foreground'
                            : 'bg-primary'
                        }`}
                      ></div>
                      <span className="text-xs font-medium">
                        {message.sender === 'user' ? 'Sie' : 'Agent'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-secondary text-secondary-foreground mr-8'
                          : 'bg-primary/10 text-foreground ml-8'
                      }`}
                    >
                      <p className="leading-relaxed text-balance">{message.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endOfMessagesRef} />
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
