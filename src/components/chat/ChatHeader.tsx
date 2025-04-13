
import React from "react";

interface ChatHeaderProps {
  currentChat: {
    id: string;
    name: string;
  } | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ currentChat }) => {
  if (!currentChat) {
    return (
      <div className="p-4 border-b">
        <h3 className="font-medium">Chat</h3>
      </div>
    );
  }

  return (
    <div className="p-4 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="font-medium text-primary">
            {currentChat.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </span>
        </div>
        <div>
          <h3 className="font-medium">{currentChat.name}</h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
