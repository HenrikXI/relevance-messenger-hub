
import React, { useState } from "react";
import ChatInterface from "./ChatInterface";
import SimpleChatInterface from "./SimpleChatInterface";

interface ChatAreaProps {
  activeTab: 'projects' | 'chats';
}

const ChatArea: React.FC<ChatAreaProps> = ({ activeTab }) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-auto">
      {activeTab === 'projects' ? (
        <ChatInterface />
      ) : (
        <SimpleChatInterface 
          selectedChatId={selectedChatId}
          onSelectChat={(id) => setSelectedChatId(id)}
        />
      )}
    </div>
  );
};

export default ChatArea;
