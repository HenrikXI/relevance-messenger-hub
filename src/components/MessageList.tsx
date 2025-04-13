
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
      <div className="px-4 py-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              Willkommen! Bitte erstellen Sie ein Projekt und geben Sie Ihre Anfrage ein.
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
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.sender === 'user'
                          ? 'ml-12'
                          : 'mr-12'
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-primary/95 text-primary-foreground rounded-tr-none'
                            : 'bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                        </p>
                      </div>
                      <div 
                        className={`text-[11px] px-2 mt-1 text-muted-foreground flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
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
