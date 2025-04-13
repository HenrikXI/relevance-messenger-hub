
import React from "react";
import ChatInterface from "./ChatInterface";
import WhatsAppChat from "./chat/WhatsAppChat";

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
        <WhatsAppChat 
          selectedChatId={selectedChatId} 
        />
      )}
    </div>
  );
};

export default ChatArea;
