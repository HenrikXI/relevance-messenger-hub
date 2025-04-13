
import React from "react";
import ProjectManagement from "./chat/ProjectManagement";
import SearchHistory from "./chat/SearchHistory";
import ChatMessages from "./chat/ChatMessages";
import DeleteMessageDialog from "./chat/DeleteMessageDialog";
import { useChatState } from "../hooks/useChatState";

interface SimpleChatInterfaceProps {
  selectedChatId?: string | null;
  onSelectChat?: (id: string) => void;
}

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({ selectedChatId, onSelectChat }) => {
  const [
    { 
      messages, 
      history, 
      input, 
      projects, 
      selectedProject, 
      projectMetrics, 
      showDeleteMessageDialog 
    },
    { 
      setInput, 
      setSelectedProject, 
      handleSend, 
      confirmDeleteMessage, 
      handleDeleteMessage, 
      handleCopyMessage,
      setMessages,
      setHistory,
      setProjects,
      setProjectMetrics
    }
  ] = useChatState(selectedChatId, onSelectChat);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 gap-6">
      <ProjectManagement 
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        messages={messages}
        setMessages={setMessages}
        history={history}
        setHistory={setHistory}
        projectMetrics={projectMetrics}
        setProjectMetrics={setProjectMetrics}
      />

      <SearchHistory 
        projects={projects}
        history={history}
        onDeleteMessage={confirmDeleteMessage}
      />

      <ChatMessages 
        messages={messages}
        selectedProject={selectedProject}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        onCopyMessage={handleCopyMessage}
        onDeleteMessage={confirmDeleteMessage}
      />

      <DeleteMessageDialog 
        open={!!showDeleteMessageDialog} 
        onOpenChange={(open) => !open && setShowDeleteMessageDialog(null)}
        onConfirm={handleDeleteMessage}
      />
    </div>
  );
};

export default SimpleChatInterface;
