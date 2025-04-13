
import React from "react";
import { Check } from "lucide-react";

interface MessageProps {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  read: boolean;
  formatTime: (date: Date) => string;
}

const MessageItem: React.FC<MessageProps> = ({
  id,
  text,
  sender,
  timestamp,
  read,
  formatTime
}) => {
  return (
    <div
      className={`flex ${
        sender === 'user' ? 'justify-end' : 'justify-start'
      } animate-fade-in`}
    >
      <div
        className={`max-w-[80%] ${
          sender === 'user'
            ? 'ml-12'
            : 'mr-12'
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            sender === 'user'
              ? 'bg-primary/95 text-primary-foreground rounded-tr-none'
              : sender === 'system'
                ? 'bg-secondary/40 text-secondary-foreground text-center rounded-lg'
                : 'bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 rounded-tl-none'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {text}
          </p>
        </div>
        <div 
          className={`text-[11px] px-2 mt-1 text-muted-foreground flex ${
            sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {formatTime(timestamp)}
          {sender === 'user' && (
            <span className="ml-1 flex items-center">
              <Check className="h-3 w-3 ml-0.5" />
              {read && <Check className="h-3 w-3 -ml-1.5" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
