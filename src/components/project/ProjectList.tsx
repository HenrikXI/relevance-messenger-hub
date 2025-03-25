
import React from "react";
import { Collapsible } from "@/components/ui/collapsible";
import ProjectItem from "./ProjectItem";
import ChatList from "./ChatList";

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
}

interface ProjectListProps {
  projects: string[];
  expandedProjects: Record<string, boolean>;
  selectedProject: string | null;
  chats: Record<string, ChatItem[]>;
  onSelectProject: (project: string) => void;
  onToggleProject: (project: string) => void;
  onRenameProject: (project: string) => void;
  onDeleteProject: (project: string) => void;
  onCreateChat: (project: string) => void;
  onRenameChat: (chatId: string, projectId: string) => void;
  onDeleteChat: (chatId: string, projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  expandedProjects,
  selectedProject,
  chats,
  onSelectProject,
  onToggleProject,
  onRenameProject,
  onDeleteProject,
  onCreateChat,
  onRenameChat,
  onDeleteChat
}) => {
  return (
    <div className="p-3 space-y-4">
      {projects.map((project) => (
        <Collapsible 
          key={project} 
          open={expandedProjects[project]} 
          onOpenChange={() => onToggleProject(project)}
        >
          <ProjectItem
            project={project}
            expanded={expandedProjects[project]}
            isSelected={selectedProject === project}
            onSelect={onSelectProject}
            onToggleExpand={onToggleProject}
            onRename={onRenameProject}
            onDelete={onDeleteProject}
            onCreateChat={onCreateChat}
          />
          <ChatList 
            projectName={project}
            chats={chats[project] || []}
            onCreateChat={onCreateChat}
            onRenameChat={onRenameChat}
            onDeleteChat={onDeleteChat}
          />
        </Collapsible>
      ))}
    </div>
  );
};

export default ProjectList;
