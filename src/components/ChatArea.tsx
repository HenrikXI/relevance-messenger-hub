
import React from "react";
import ChatInterface from "./ChatInterface";
import SimpleChatInterface from "./SimpleChatInterface";

interface ChatAreaProps {
  activeTab: 'projects' | 'chats';
  selectedChatId?: string | null;
  onSelectChat?: (id: string | null) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  activeTab, 
  selectedChatId,
  onSelectChat 
}) => {
  return (
    <div className="h-full overflow-auto">
      {activeTab === 'projects' ? (
        <ChatInterface />
      ) : (
        <SimpleChatInterface 
          selectedChatId={selectedChatId} 
          onSelectChat={onSelectChat}
        />
      )}
    </div>
  );
};

export default ChatArea;
