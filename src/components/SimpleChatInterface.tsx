
import React from "react";
import ProjectManagement from "./chat/ProjectManagement";
import SearchHistory from "./chat/SearchHistory";
import ChatMessages from "./chat/ChatMessages";
import DeleteMessageDialog from "./chat/DeleteMessageDialog";
import { useSimpleChatState } from "../hooks/useSimpleChatState";

interface SimpleChatInterfaceProps {
  selectedChatId?: string | null;
  onSelectChat?: (id: string) => void;
}

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({ 
  selectedChatId, 
  onSelectChat 
}) => {
  const [state, actions] = useSimpleChatState(selectedChatId);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 gap-6">
      <ProjectManagement 
        projects={state.projects}
        selectedProject={state.selectedProject}
        setSelectedProject={actions.setSelectedProject}
        projectMetrics={state.projectMetrics}
        setProjectMetrics={actions.setProjectMetrics}
        messages={state.messages}
        setMessages={actions.setMessages}
        history={state.history}
        setHistory={actions.setHistory}
      />

      <SearchHistory 
        projects={state.projects}
        history={state.history}
        onDeleteMessage={actions.confirmDeleteMessage}
      />

      <ChatMessages 
        messages={state.messages}
        selectedProject={state.selectedProject}
        input={state.input}
        setInput={actions.setInput}
        handleSend={actions.handleSend}
        onCopyMessage={actions.handleCopyMessage}
        onDeleteMessage={actions.confirmDeleteMessage}
      />

      <DeleteMessageDialog 
        open={!!state.showDeleteMessageDialog} 
        onOpenChange={(open) => !open && actions.setShowDeleteMessageDialog(null)}
        onConfirm={actions.handleDeleteMessage}
      />
    </div>
  );
};

export default SimpleChatInterface;
