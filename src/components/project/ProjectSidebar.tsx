import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Search, Users, FolderClosed } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "./ProjectList";
import ProjectDialogs from "./ProjectDialogs";
import UserChatList from "./UserChatList";

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
}

interface UserChat {
  id: string;
  username: string;
  avatar?: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
}

interface ProjectSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectInput, setProjectInput] = useState("");
  const [userChatInput, setUserChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Record<string, ChatItem[]>>({});
  const [userChats, setUserChats] = useState<UserChat[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{type: 'project' | 'chat' | 'userChat', id: string, name: string, projectId?: string}>({type: 'project', id: '', name: ''});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'project' | 'chat' | 'userChat', id: string, name: string, projectId?: string}>({type: 'project', id: '', name: ''});
  const [filteredChats, setFilteredChats] = useState<Record<string, ChatItem[]>>({});
  const [filteredUserChats, setFilteredUserChats] = useState<UserChat[]>([]);
  const [activeTab, setActiveTab] = useState("projects");

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem("projects");
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
      
      const savedChats = localStorage.getItem("projectChats");
      if (savedChats) {
        setChats(JSON.parse(savedChats));
        setFilteredChats(JSON.parse(savedChats));
      }
      
      const savedExpanded = localStorage.getItem("expandedProjects");
      if (savedExpanded) {
        setExpandedProjects(JSON.parse(savedExpanded));
      }

      const savedUserChats = localStorage.getItem("userChats");
      if (savedUserChats) {
        setUserChats(JSON.parse(savedUserChats));
        setFilteredUserChats(JSON.parse(savedUserChats));
      } else {
        const sampleUserChats = [
          {
            id: "1",
            username: "Max Mustermann",
            lastMessage: "Hallo! Wie geht es dir?",
            unread: 2,
            timestamp: "10:45"
          },
          {
            id: "2",
            username: "Anna Schmidt",
            lastMessage: "Wann ist das nächste Meeting?",
            unread: 0,
            timestamp: "Gestern"
          },
          {
            id: "3",
            username: "Thomas Weber",
            lastMessage: "Die Dokumente sind fertig",
            unread: 1,
            timestamp: "Mo"
          }
        ];
        setUserChats(sampleUserChats);
        setFilteredUserChats(sampleUserChats);
        localStorage.setItem("userChats", JSON.stringify(sampleUserChats));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

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

    if (userChats.length > 0) {
      localStorage.setItem("userChats", JSON.stringify(userChats));
    }
  }, [projects, chats, expandedProjects, userChats]);

  const handleCreateProject = () => {
    if (!projectInput.trim()) return;
    
    const newProject = projectInput.trim();
    if (!projects.includes(newProject)) {
      setProjects(prev => [...prev, newProject]);
      setChats(prev => ({...prev, [newProject]: []}));
      setFilteredChats(prev => ({...prev, [newProject]: []}));
      setExpandedProjects(prev => ({...prev, [newProject]: true}));
    }
    setSelectedProject(newProject);
    setProjectInput("");
  };

  const handleCreateUserChat = () => {
    if (!userChatInput.trim()) return;
    
    const newChat: UserChat = {
      id: Date.now().toString(),
      username: userChatInput.trim(),
      lastMessage: "Neue Konversation gestartet",
      unread: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setUserChats(prev => [...prev, newChat]);
    setFilteredUserChats(prev => [...prev, newChat]);
    setUserChatInput("");
    toast.success(`Chat mit ${newChat.username} erstellt`);
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
    
    setFilteredChats(prev => ({
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

  const handleRenameUserChat = (chatId: string) => {
    const chat = userChats.find(c => c.id === chatId);
    if (chat) {
      setItemToRename({
        type: 'userChat',
        id: chatId,
        name: chat.username
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

  const handleDeleteUserChat = (chatId: string) => {
    const chat = userChats.find(c => c.id === chatId);
    if (chat) {
      setItemToDelete({
        type: 'userChat',
        id: chatId,
        name: chat.username
      });
      setDeleteDialogOpen(true);
    }
  };

  const performRename = (newName: string) => {
    if (itemToRename.type === 'project') {
      const oldName = itemToRename.id;
      const projectIndex = projects.findIndex(p => p === oldName);
      if (projectIndex !== -1) {
        const updatedProjects = [...projects];
        updatedProjects[projectIndex] = newName;
        setProjects(updatedProjects);
        
        const projectChats = chats[oldName] || [];
        const updatedChats = {...chats};
        delete updatedChats[oldName];
        updatedChats[newName] = projectChats;
        setChats(updatedChats);
        
        const filteredProjectChats = filteredChats[oldName] || [];
        const updatedFilteredChats = {...filteredChats};
        delete updatedFilteredChats[oldName];
        updatedFilteredChats[newName] = filteredProjectChats;
        setFilteredChats(updatedFilteredChats);
        
        const isExpanded = expandedProjects[oldName];
        const updatedExpanded = {...expandedProjects};
        delete updatedExpanded[oldName];
        updatedExpanded[newName] = isExpanded;
        setExpandedProjects(updatedExpanded);
        
        if (selectedProject === oldName) {
          setSelectedProject(newName);
        }
        
        toast.success(`Projekt umbenannt: ${oldName} → ${newName}`);
      }
    } else if (itemToRename.type === 'chat' && itemToRename.projectId) {
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
        
        const filteredProjectChats = [...(filteredChats[projectId] || [])];
        const filteredChatIndex = filteredProjectChats.findIndex(c => c.id === chatId);
        
        if (filteredChatIndex !== -1) {
          filteredProjectChats[filteredChatIndex] = {
            ...filteredProjectChats[filteredChatIndex],
            title: newName
          };
          
          setFilteredChats(prev => ({
            ...prev,
            [projectId]: filteredProjectChats
          }));
        }
        
        toast.success(`Chat umbenannt: ${itemToRename.name} → ${newName}`);
      }
    } else if (itemToRename.type === 'userChat') {
      const chatId = itemToRename.id;
      const updatedChats = userChats.map(chat => 
        chat.id === chatId ? { ...chat, username: newName } : chat
      );
      
      setUserChats(updatedChats);
      setFilteredUserChats(updatedChats.filter(chat => 
        !searchQuery || 
        chat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      toast.success(`Chat umbenannt: ${itemToRename.name} → ${newName}`);
    }
  };

  const performDelete = () => {
    if (itemToDelete.type === 'project') {
      const projectId = itemToDelete.id;
      setProjects(prev => prev.filter(p => p !== projectId));
      
      const updatedChats = {...chats};
      delete updatedChats[projectId];
      setChats(updatedChats);
      
      const updatedFilteredChats = {...filteredChats};
      delete updatedFilteredChats[projectId];
      setFilteredChats(updatedFilteredChats);
      
      const updatedExpanded = {...expandedProjects};
      delete updatedExpanded[projectId];
      setExpandedProjects(updatedExpanded);
      
      if (selectedProject === projectId) {
        setSelectedProject(null);
      }
      
      toast.success(`Projekt "${projectId}" wurde gelöscht`);
    } else if (itemToDelete.type === 'chat' && itemToDelete.projectId) {
      const projectId = itemToDelete.projectId;
      const chatId = itemToDelete.id;
      const projectChats = chats[projectId] || [];
      const updatedProjectChats = projectChats.filter(c => c.id !== chatId);
      
      setChats(prev => ({
        ...prev,
        [projectId]: updatedProjectChats
      }));
      
      const filteredProjectChats = filteredChats[projectId] || [];
      const updatedFilteredChats = filteredProjectChats.filter(c => c.id !== chatId);
      
      setFilteredChats(prev => ({
        ...prev,
        [projectId]: updatedFilteredChats
      }));
      
      toast.success(`Chat "${itemToDelete.name}" wurde gelöscht`);
    } else if (itemToDelete.type === 'userChat') {
      const chatId = itemToDelete.id;
      const updatedChats = userChats.filter(chat => chat.id !== chatId);
      
      setUserChats(updatedChats);
      setFilteredUserChats(updatedChats.filter(chat => 
        !searchQuery || 
        chat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      toast.success(`Chat mit "${itemToDelete.name}" wurde gelöscht`);
    }
    
    setDeleteDialogOpen(false);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    if (!value.trim()) {
      setFilteredChats({...chats});
      setFilteredUserChats([...userChats]);
      return;
    }
    
    const query = value.toLowerCase();
    
    const newFilteredChats: Record<string, ChatItem[]> = {};
    
    Object.keys(chats).forEach(projectName => {
      const projectChats = chats[projectName] || [];
      
      if (projectName.toLowerCase().includes(query)) {
        newFilteredChats[projectName] = projectChats;
        setExpandedProjects(prev => ({...prev, [projectName]: true}));
        return;
      }
      
      const matchingChats = projectChats.filter(chat => 
        chat.title.toLowerCase().includes(query) || 
        chat.preview.toLowerCase().includes(query)
      );
      
      if (matchingChats.length > 0) {
        newFilteredChats[projectName] = matchingChats;
        setExpandedProjects(prev => ({...prev, [projectName]: true}));
      }
    });
    
    setFilteredChats(newFilteredChats);
    
    const newFilteredUserChats = userChats.filter(chat => 
      chat.username.toLowerCase().includes(query) || 
      chat.lastMessage.toLowerCase().includes(query)
    );
    
    setFilteredUserChats(newFilteredUserChats);
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery.trim()) return true;
    
    if (project.toLowerCase().includes(searchQuery.toLowerCase())) return true;
    
    return !!filteredChats[project]?.length;
  });

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
            <div className="mb-3 relative">
              <Input
                placeholder="Projekte und Chats durchsuchen..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="glass-input pr-8"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <FolderClosed className="h-4 w-4" />
                  <span>Projekte</span>
                </TabsTrigger>
                <TabsTrigger value="chats" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>User Chats</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="projects" className="space-y-4 mt-3">
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
              </TabsContent>
              
              <TabsContent value="chats" className="space-y-4 mt-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Neuer User Chat"
                    value={userChatInput}
                    onChange={(e) => setUserChatInput(e.target.value)}
                    className="glass-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateUserChat();
                    }}
                  />
                  <Button onClick={handleCreateUserChat} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className={activeTab === "projects" ? "block" : "hidden"}>
              <ProjectList 
                projects={filteredProjects}
                expandedProjects={expandedProjects}
                selectedProject={selectedProject}
                chats={filteredChats}
                onSelectProject={setSelectedProject}
                onToggleProject={toggleProjectExpansion}
                onRenameProject={handleRenameProject}
                onDeleteProject={handleDeleteProject}
                onCreateChat={handleCreateChat}
                onRenameChat={handleRenameChat}
                onDeleteChat={handleDeleteChat}
              />
            </div>
            
            <div className={activeTab === "chats" ? "block" : "hidden"}>
              <UserChatList 
                userChats={filteredUserChats}
                onRenameUserChat={handleRenameUserChat}
                onDeleteUserChat={handleDeleteUserChat}
              />
            </div>
          </ScrollArea>
          
          <ProjectDialogs
            renameDialogOpen={renameDialogOpen}
            deleteDialogOpen={deleteDialogOpen}
            itemToRename={itemToRename}
            itemToDelete={itemToDelete}
            onCloseRenameDialog={() => setRenameDialogOpen(false)}
            onCloseDeleteDialog={() => setDeleteDialogOpen(false)}
            onRename={performRename}
            onDelete={performDelete}
          />
        </>
      )}
    </div>
  );
};

export default ProjectSidebar;
