import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Folder, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ContextMenuActions } from "./ContextMenuActions";
import RenameDialog from "./RenameDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Record<string, ChatItem[]>>({});
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{type: 'project' | 'chat', id: string, name: string, projectId?: string}>({type: 'project', id: '', name: ''});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'project' | 'chat', id: string, name: string, projectId?: string}>({type: 'project', id: '', name: ''});

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem("projects");
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
      
      const savedChats = localStorage.getItem("projectChats");
      if (savedChats) {
        setChats(JSON.parse(savedChats));
      }
      
      const savedExpanded = localStorage.getItem("expandedProjects");
      if (savedExpanded) {
        setExpandedProjects(JSON.parse(savedExpanded));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("projects", JSON.stringify(projects));
    }
    
    if (Object.keys(chats).length > 0) {
      localStorage.setItem("projectChats", JSON.stringify(chats));
    }
    
    if (Object.keys(expandedProjects).length > 0) {
      localStorage.setItem("expandedProjects", JSON.stringify(expandedProjects));
    }
  }, [projects, chats, expandedProjects]);

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

  const handleRenameProject = (projectId: string) => {
    setItemToRename({
      type: 'project',
      id: projectId,
      name: projectId
    });
    setRenameDialogOpen(true);
  };

  const handleRenameChat = (chatId: string, projectId: string) => {
    const chat = chats[projectId]?.find(c => c.id === chatId);
    if (chat) {
      setItemToRename({
        type: 'chat',
        id: chatId,
        name: chat.title,
        projectId
      });
      setRenameDialogOpen(true);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setItemToDelete({
      type: 'project',
      id: projectId,
      name: projectId
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteChat = (chatId: string, projectId: string) => {
    const chat = chats[projectId]?.find(c => c.id === chatId);
    if (chat) {
      setItemToDelete({
        type: 'chat',
        id: chatId,
        name: chat.title,
        projectId
      });
      setDeleteDialogOpen(true);
    }
  };

  const performRename = (newName: string) => {
    if (itemToRename.type === 'project') {
      // Rename project
      const oldName = itemToRename.id;
      const projectIndex = projects.findIndex(p => p === oldName);
      if (projectIndex !== -1) {
        const updatedProjects = [...projects];
        updatedProjects[projectIndex] = newName;
        setProjects(updatedProjects);
        
        // Update chats for this project
        const projectChats = chats[oldName] || [];
        const updatedChats = {...chats};
        delete updatedChats[oldName];
        updatedChats[newName] = projectChats;
        setChats(updatedChats);
        
        // Update expanded state
        const isExpanded = expandedProjects[oldName];
        const updatedExpanded = {...expandedProjects};
        delete updatedExpanded[oldName];
        updatedExpanded[newName] = isExpanded;
        setExpandedProjects(updatedExpanded);
        
        // Update selected project if needed
        if (selectedProject === oldName) {
          setSelectedProject(newName);
        }
        
        toast.success(`Projekt umbenannt: ${oldName} → ${newName}`);
      }
    } else if (itemToRename.type === 'chat' && itemToRename.projectId) {
      // Rename chat
      const projectId = itemToRename.projectId;
      const chatId = itemToRename.id;
      const projectChats = [...(chats[projectId] || [])];
      const chatIndex = projectChats.findIndex(c => c.id === chatId);
      
      if (chatIndex !== -1) {
        projectChats[chatIndex] = {
          ...projectChats[chatIndex],
          title: newName
        };
        
        setChats(prev => ({
          ...prev,
          [projectId]: projectChats
        }));
        
        toast.success(`Chat umbenannt: ${itemToRename.name} → ${newName}`);
      }
    }
  };

  const performDelete = () => {
    if (itemToDelete.type === 'project') {
      // Delete project
      const projectId = itemToDelete.id;
      setProjects(prev => prev.filter(p => p !== projectId));
      
      // Remove chats for this project
      const updatedChats = {...chats};
      delete updatedChats[projectId];
      setChats(updatedChats);
      
      // Remove from expanded state
      const updatedExpanded = {...expandedProjects};
      delete updatedExpanded[projectId];
      setExpandedProjects(updatedExpanded);
      
      // Update selected project if needed
      if (selectedProject === projectId) {
        setSelectedProject(null);
      }
      
      toast.success(`Projekt "${projectId}" wurde gelöscht`);
    } else if (itemToDelete.type === 'chat' && itemToDelete.projectId) {
      // Delete chat
      const projectId = itemToDelete.projectId;
      const chatId = itemToDelete.id;
      const projectChats = chats[projectId] || [];
      const updatedProjectChats = projectChats.filter(c => c.id !== chatId);
      
      setChats(prev => ({
        ...prev,
        [projectId]: updatedProjectChats
      }));
      
      toast.success(`Chat "${itemToDelete.name}" wurde gelöscht`);
    }
    
    setDeleteDialogOpen(false);
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    searchQuery ? project.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

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
            
            {/* Search bar for projects */}
            <div className="mb-3 relative">
              <Input
                placeholder="Projekte durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pr-8"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
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
              {filteredProjects.map((project) => (
                <Collapsible 
                  key={project} 
                  open={expandedProjects[project]} 
                  onOpenChange={() => toggleProjectExpansion(project)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <ContextMenuActions
                        className={`flex-1 flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent relative group ${
                          selectedProject === project ? "bg-accent" : ""
                        }`}
                        isProject={true}
                        onRename={() => handleRenameProject(project)}
                        onDelete={() => handleDeleteProject(project)}
                        onShare={() => toast.info("Teilen-Funktion wird bald verfügbar sein")}
                        onArchive={() => toast.info("Archivieren-Funktion wird bald verfügbar sein")}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div 
                          className="flex-1 flex items-center gap-2"
                        >
                          <Folder className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{project}</span>
                        </div>
                      </ContextMenuActions>
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
                          <ContextMenuActions
                            key={chat.id}
                            className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent/50 text-xs relative group"
                            isChat={true}
                            onRename={() => handleRenameChat(chat.id, project)}
                            onDelete={() => handleDeleteChat(chat.id, project)}
                            onAddToProject={() => toast.info("Diese Funktion wird bald verfügbar sein")}
                          >
                            <div className="flex-1 flex items-center gap-2">
                              <MessageSquare className="h-3 w-3 text-muted-foreground" />
                              <div className="flex-1 truncate">
                                <div className="font-medium">{chat.title}</div>
                                <div className="text-muted-foreground truncate">{chat.preview}</div>
                              </div>
                            </div>
                          </ContextMenuActions>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
          
          {/* Rename Dialog */}
          <RenameDialog
            isOpen={renameDialogOpen}
            onClose={() => setRenameDialogOpen(false)}
            onRename={performRename}
            title={itemToRename.type === 'project' ? "Projekt umbenennen" : "Chat umbenennen"}
            currentName={itemToRename.name}
            entityType={itemToRename.type}
          />
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="glass-panel">
              <DialogHeader>
                <DialogTitle>
                  {itemToDelete.type === 'project' ? "Projekt löschen" : "Chat löschen"}
                </DialogTitle>
              </DialogHeader>
              <p>
                {itemToDelete.type === 'project'
                  ? `Möchten Sie das Projekt "${itemToDelete.name}" wirklich löschen? Alle zugehörigen Chats werden ebenfalls gelöscht.`
                  : `Möchten Sie den Chat "${itemToDelete.name}" wirklich löschen?`
                }
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button variant="destructive" onClick={performDelete}>
                  Löschen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default ProjectSidebar;
