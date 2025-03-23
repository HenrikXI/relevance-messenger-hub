
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Folder, MessageSquare, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
}

interface ProjectSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectInput, setProjectInput] = useState("");
  // Sample chat data - in a real app this would be dynamic per project
  const [chats, setChats] = useState<Record<string, ChatItem[]>>({});
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const handleCreateProject = () => {
    if (!projectInput.trim()) return;
    
    const newProject = projectInput.trim();
    if (!projects.includes(newProject)) {
      setProjects(prev => [...prev, newProject]);
      // Initialize empty chats array for this project
      setChats(prev => ({...prev, [newProject]: []}));
      // Auto-expand the newly created project
      setExpandedProjects(prev => ({...prev, [newProject]: true}));
    }
    setSelectedProject(newProject);
    setProjectInput("");
  };

  // In a real app, this would be called when a new chat is started
  const handleCreateChat = (projectName: string) => {
    const newChat: ChatItem = {
      id: Date.now().toString(),
      title: `Chat ${(chats[projectName]?.length || 0) + 1}`,
      preview: "Neue Konversation",
      date: new Date().toLocaleDateString()
    };
    
    setChats(prev => ({
      ...prev,
      [projectName]: [...(prev[projectName] || []), newChat]
    }));
  };

  const toggleProjectExpansion = (project: string) => {
    setExpandedProjects(prev => ({
      ...prev, 
      [project]: !prev[project]
    }));
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-background border shadow-sm"
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {!collapsed && (
        <>
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium mb-2">Projekte</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Neues Projekt"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                className="glass-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateProject();
                }}
              />
              <Button onClick={handleCreateProject} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {projects.map((project) => (
                <Collapsible 
                  key={project} 
                  open={expandedProjects[project]} 
                  onOpenChange={() => toggleProjectExpansion(project)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div 
                        className={`flex-1 flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                          selectedProject === project ? "bg-accent" : ""
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <Folder className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{project}</span>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-7 w-7">
                          {expandedProjects[project] ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="ml-4 space-y-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs"
                          onClick={() => handleCreateChat(project)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Neuer Chat
                        </Button>
                        
                        {chats[project]?.map((chat) => (
                          <div 
                            key={chat.id}
                            className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent/50 text-xs"
                          >
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <div className="flex-1 truncate">
                              <div className="font-medium">{chat.title}</div>
                              <div className="text-muted-foreground truncate">{chat.preview}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default ProjectSidebar;
