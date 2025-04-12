
import React, { useState } from "react";
import ChatInterface from "./ChatInterface";
import WhatsAppChat from "./chat/WhatsAppChat";

interface ChatAreaProps {
  activeTab: 'projects' | 'chats';
  selectedChatId?: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({ activeTab, selectedChatId }) => {
  return (
    <div className="h-full overflow-auto">
      {activeTab === 'projects' ? (
        <ChatInterface />
      ) : (
        <WhatsAppChat selectedChatId={selectedChatId} />
      )}
    </div>
  );
};

export default ChatArea;
