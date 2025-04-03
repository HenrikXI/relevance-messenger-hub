
import React from "react";
import ChatInterface from "./ChatInterface";
import SimpleChatInterface from "./SimpleChatInterface";

interface ChatAreaProps {
  activeTab: 'projects' | 'chats';
}

const ChatArea: React.FC<ChatAreaProps> = ({ activeTab }) => {
  return (
    <div className="h-full overflow-auto">
      {activeTab === 'projects' ? (
        <ChatInterface />
      ) : (
        <SimpleChatInterface />
      )}
    </div>
  );
};

export default ChatArea;
