
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

export interface SidebarDataState {
  projects: string[];
  selectedProject: string | null;
  projectInput: string;
  userChatInput: string;
  searchQuery: string;
  chats: Record<string, ChatItem[]>;
  userChats: UserChat[];
  expandedProjects: Record<string, boolean>;
  renameDialogOpen: boolean;
  itemToRename: {type: 'project' | 'chat' | 'userChat', id: string, name: string, projectId?: string};
  deleteDialogOpen: boolean;
  itemToDelete: {type: 'project' | 'chat' | 'userChat', id: string, name: string, projectId?: string};
  filteredChats: Record<string, ChatItem[]>;
  filteredUserChats: UserChat[];
  activeTab: string;
}

export function useSidebarData() {
  const [state, setState] = useState<SidebarDataState>({
    projects: [],
    selectedProject: null,
    projectInput: "",
    userChatInput: "",
    searchQuery: "",
    chats: {},
    userChats: [],
    expandedProjects: {},
    renameDialogOpen: false,
    itemToRename: {type: 'project', id: '', name: ''},
    deleteDialogOpen: false,
    itemToDelete: {type: 'project', id: '', name: ''},
    filteredChats: {},
    filteredUserChats: [],
    activeTab: "projects",
  });

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem("projects");
      if (savedProjects) {
        setState(prev => ({ ...prev, projects: JSON.parse(savedProjects) }));
      }
      
      const savedChats = localStorage.getItem("projectChats");
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        setState(prev => ({ 
          ...prev, 
          chats: parsedChats,
          filteredChats: parsedChats 
        }));
      }
      
      const savedExpanded = localStorage.getItem("expandedProjects");
      if (savedExpanded) {
        setState(prev => ({ ...prev, expandedProjects: JSON.parse(savedExpanded) }));
      }

      const savedUserChats = localStorage.getItem("userChats");
      if (savedUserChats) {
        const parsedUserChats = JSON.parse(savedUserChats);
        setState(prev => ({ 
          ...prev, 
          userChats: parsedUserChats,
          filteredUserChats: parsedUserChats 
        }));
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
        setState(prev => ({ 
          ...prev, 
          userChats: sampleUserChats,
          filteredUserChats: sampleUserChats 
        }));
        localStorage.setItem("userChats", JSON.stringify(sampleUserChats));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (state.projects.length > 0) {
      localStorage.setItem("projects", JSON.stringify(state.projects));
    }
    
    if (Object.keys(state.chats).length > 0) {
      localStorage.setItem("projectChats", JSON.stringify(state.chats));
    }
    
    if (Object.keys(state.expandedProjects).length > 0) {
      localStorage.setItem("expandedProjects", JSON.stringify(state.expandedProjects));
    }

    if (state.userChats.length > 0) {
      localStorage.setItem("userChats", JSON.stringify(state.userChats));
    }
  }, [state.projects, state.chats, state.expandedProjects, state.userChats]);

  const setProjectInput = (value: string) => {
    setState(prev => ({ ...prev, projectInput: value }));
  };

  const setUserChatInput = (value: string) => {
    setState(prev => ({ ...prev, userChatInput: value }));
  };

  const setSearchQuery = (value: string) => {
    setState(prev => ({ ...prev, searchQuery: value }));
  };

  const setActiveTab = (value: string) => {
    setState(prev => ({ ...prev, activeTab: value }));
  };

  const setSelectedProject = (project: string | null) => {
    setState(prev => ({ ...prev, selectedProject: project }));
  };

  const handleCreateProject = () => {
    if (!state.projectInput.trim()) return;
    
    const newProject = state.projectInput.trim();
    if (!state.projects.includes(newProject)) {
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
        chats: { ...prev.chats, [newProject]: [] },
        filteredChats: { ...prev.filteredChats, [newProject]: [] },
        expandedProjects: { ...prev.expandedProjects, [newProject]: true },
        selectedProject: newProject,
        projectInput: ""
      }));
    } else {
      setState(prev => ({
        ...prev,
        selectedProject: newProject,
        projectInput: ""
      }));
    }
  };

  const handleCreateUserChat = () => {
    if (!state.userChatInput.trim()) return;
    
    const newChat: UserChat = {
      id: Date.now().toString(),
      username: state.userChatInput.trim(),
      lastMessage: "Neue Konversation gestartet",
      unread: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setState(prev => ({
      ...prev,
      userChats: [...prev.userChats, newChat],
      filteredUserChats: [...prev.filteredUserChats, newChat],
      userChatInput: ""
    }));
    
    toast.success(`Chat mit ${newChat.username} erstellt`);
  };

  const handleCreateChat = (projectName: string) => {
    const newChat: ChatItem = {
      id: Date.now().toString(),
      title: `Chat ${(state.chats[projectName]?.length || 0) + 1}`,
      preview: "Neue Konversation",
      date: new Date().toLocaleDateString()
    };
    
    setState(prev => ({
      ...prev,
      chats: {
        ...prev.chats,
        [projectName]: [...(prev.chats[projectName] || []), newChat]
      },
      filteredChats: {
        ...prev.filteredChats,
        [projectName]: [...(prev.filteredChats[projectName] || []), newChat]
      }
    }));
  };

  const toggleProjectExpansion = (project: string) => {
    setState(prev => ({
      ...prev,
      expandedProjects: {
        ...prev.expandedProjects,
        [project]: !prev.expandedProjects[project]
      }
    }));
  };

  const handleRenameProject = (projectId: string) => {
    setState(prev => ({
      ...prev,
      itemToRename: {
        type: 'project',
        id: projectId,
        name: projectId
      },
      renameDialogOpen: true
    }));
  };

  const handleRenameChat = (chatId: string, projectId: string) => {
    const chat = state.chats[projectId]?.find(c => c.id === chatId);
    if (chat) {
      setState(prev => ({
        ...prev,
        itemToRename: {
          type: 'chat',
          id: chatId,
          name: chat.title,
          projectId
        },
        renameDialogOpen: true
      }));
    }
  };

  const handleRenameUserChat = (chatId: string) => {
    const chat = state.userChats.find(c => c.id === chatId);
    if (chat) {
      setState(prev => ({
        ...prev,
        itemToRename: {
          type: 'userChat',
          id: chatId,
          name: chat.username
        },
        renameDialogOpen: true
      }));
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setState(prev => ({
      ...prev,
      itemToDelete: {
        type: 'project',
        id: projectId,
        name: projectId
      },
      deleteDialogOpen: true
    }));
  };

  const handleDeleteChat = (chatId: string, projectId: string) => {
    const chat = state.chats[projectId]?.find(c => c.id === chatId);
    if (chat) {
      setState(prev => ({
        ...prev,
        itemToDelete: {
          type: 'chat',
          id: chatId,
          name: chat.title,
          projectId
        },
        deleteDialogOpen: true
      }));
    }
  };

  const handleDeleteUserChat = (chatId: string) => {
    const chat = state.userChats.find(c => c.id === chatId);
    if (chat) {
      setState(prev => ({
        ...prev,
        itemToDelete: {
          type: 'userChat',
          id: chatId,
          name: chat.username
        },
        deleteDialogOpen: true
      }));
    }
  };

  const closeRenameDialog = () => {
    setState(prev => ({ ...prev, renameDialogOpen: false }));
  };

  const closeDeleteDialog = () => {
    setState(prev => ({ ...prev, deleteDialogOpen: false }));
  };

  const performRename = (newName: string) => {
    if (state.itemToRename.type === 'project') {
      const oldName = state.itemToRename.id;
      const projectIndex = state.projects.findIndex(p => p === oldName);
      
      if (projectIndex !== -1) {
        const updatedProjects = [...state.projects];
        updatedProjects[projectIndex] = newName;
        
        const projectChats = state.chats[oldName] || [];
        const updatedChats = {...state.chats};
        delete updatedChats[oldName];
        updatedChats[newName] = projectChats;
        
        const filteredProjectChats = state.filteredChats[oldName] || [];
        const updatedFilteredChats = {...state.filteredChats};
        delete updatedFilteredChats[oldName];
        updatedFilteredChats[newName] = filteredProjectChats;
        
        const isExpanded = state.expandedProjects[oldName];
        const updatedExpanded = {...state.expandedProjects};
        delete updatedExpanded[oldName];
        updatedExpanded[newName] = isExpanded;
        
        setState(prev => ({
          ...prev,
          projects: updatedProjects,
          chats: updatedChats,
          filteredChats: updatedFilteredChats,
          expandedProjects: updatedExpanded,
          selectedProject: prev.selectedProject === oldName ? newName : prev.selectedProject
        }));
        
        toast.success(`Projekt umbenannt: ${oldName} → ${newName}`);
      }
    } else if (state.itemToRename.type === 'chat' && state.itemToRename.projectId) {
      const projectId = state.itemToRename.projectId;
      const chatId = state.itemToRename.id;
      const projectChats = [...(state.chats[projectId] || [])];
      const chatIndex = projectChats.findIndex(c => c.id === chatId);
      
      if (chatIndex !== -1) {
        projectChats[chatIndex] = {
          ...projectChats[chatIndex],
          title: newName
        };
        
        const updatedChats = {
          ...state.chats,
          [projectId]: projectChats
        };
        
        const filteredProjectChats = [...(state.filteredChats[projectId] || [])];
        const filteredChatIndex = filteredProjectChats.findIndex(c => c.id === chatId);
        
        let updatedFilteredChats = {...state.filteredChats};
        
        if (filteredChatIndex !== -1) {
          filteredProjectChats[filteredChatIndex] = {
            ...filteredProjectChats[filteredChatIndex],
            title: newName
          };
          
          updatedFilteredChats = {
            ...updatedFilteredChats,
            [projectId]: filteredProjectChats
          };
        }
        
        setState(prev => ({
          ...prev,
          chats: updatedChats,
          filteredChats: updatedFilteredChats
        }));
        
        toast.success(`Chat umbenannt: ${state.itemToRename.name} → ${newName}`);
      }
    } else if (state.itemToRename.type === 'userChat') {
      const chatId = state.itemToRename.id;
      const updatedChats = state.userChats.map(chat => 
        chat.id === chatId ? { ...chat, username: newName } : chat
      );
      
      setState(prev => ({
        ...prev,
        userChats: updatedChats,
        filteredUserChats: updatedChats.filter(chat => 
          !prev.searchQuery || 
          chat.username.toLowerCase().includes(prev.searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(prev.searchQuery.toLowerCase())
        )
      }));
      
      toast.success(`Chat umbenannt: ${state.itemToRename.name} → ${newName}`);
    }
  };

  const performDelete = () => {
    if (state.itemToDelete.type === 'project') {
      const projectId = state.itemToDelete.id;
      
      const updatedProjects = state.projects.filter(p => p !== projectId);
      
      const updatedChats = {...state.chats};
      delete updatedChats[projectId];
      
      const updatedFilteredChats = {...state.filteredChats};
      delete updatedFilteredChats[projectId];
      
      const updatedExpanded = {...state.expandedProjects};
      delete updatedExpanded[projectId];
      
      setState(prev => ({
        ...prev,
        projects: updatedProjects,
        chats: updatedChats,
        filteredChats: updatedFilteredChats,
        expandedProjects: updatedExpanded,
        selectedProject: prev.selectedProject === projectId ? null : prev.selectedProject,
        deleteDialogOpen: false
      }));
      
      toast.success(`Projekt "${projectId}" wurde gelöscht`);
    } else if (state.itemToDelete.type === 'chat' && state.itemToDelete.projectId) {
      const projectId = state.itemToDelete.projectId;
      const chatId = state.itemToDelete.id;
      
      const projectChats = state.chats[projectId] || [];
      const updatedProjectChats = projectChats.filter(c => c.id !== chatId);
      
      const updatedChats = {
        ...state.chats,
        [projectId]: updatedProjectChats
      };
      
      const filteredProjectChats = state.filteredChats[projectId] || [];
      const updatedFilteredChats = {
        ...state.filteredChats,
        [projectId]: filteredProjectChats.filter(c => c.id !== chatId)
      };
      
      setState(prev => ({
        ...prev,
        chats: updatedChats,
        filteredChats: updatedFilteredChats,
        deleteDialogOpen: false
      }));
      
      toast.success(`Chat "${state.itemToDelete.name}" wurde gelöscht`);
    } else if (state.itemToDelete.type === 'userChat') {
      const chatId = state.itemToDelete.id;
      const updatedChats = state.userChats.filter(chat => chat.id !== chatId);
      
      setState(prev => ({
        ...prev,
        userChats: updatedChats,
        filteredUserChats: updatedChats.filter(chat => 
          !prev.searchQuery || 
          chat.username.toLowerCase().includes(prev.searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(prev.searchQuery.toLowerCase())
        ),
        deleteDialogOpen: false
      }));
      
      toast.success(`Chat mit "${state.itemToDelete.name}" wurde gelöscht`);
    }
  };

  const handleSearch = (value: string) => {
    const query = value.toLowerCase();
    
    if (!query.trim()) {
      setState(prev => ({
        ...prev,
        searchQuery: value,
        filteredChats: {...prev.chats},
        filteredUserChats: [...prev.userChats]
      }));
      return;
    }
    
    const newFilteredChats: Record<string, ChatItem[]> = {};
    const expandedUpdates: Record<string, boolean> = {};
    
    state.projects.forEach(projectName => {
      const projectChats = state.chats[projectName] || [];
      
      if (projectName.toLowerCase().includes(query)) {
        newFilteredChats[projectName] = projectChats;
        expandedUpdates[projectName] = true;
        return;
      }
      
      const matchingChats = projectChats.filter(chat => 
        chat.title.toLowerCase().includes(query) || 
        chat.preview.toLowerCase().includes(query)
      );
      
      if (matchingChats.length > 0) {
        newFilteredChats[projectName] = matchingChats;
        expandedUpdates[projectName] = true;
      }
    });
    
    const newFilteredUserChats = state.userChats.filter(chat => 
      chat.username.toLowerCase().includes(query) || 
      chat.lastMessage.toLowerCase().includes(query)
    );
    
    setState(prev => ({
      ...prev,
      searchQuery: value,
      filteredChats: newFilteredChats,
      filteredUserChats: newFilteredUserChats,
      expandedProjects: {...prev.expandedProjects, ...expandedUpdates}
    }));
  };

  const getFilteredProjects = () => {
    return state.projects.filter(project => {
      if (!state.searchQuery.trim()) return true;
      
      if (project.toLowerCase().includes(state.searchQuery.toLowerCase())) return true;
      
      return !!state.filteredChats[project]?.length;
    });
  };

  return {
    state,
    setProjectInput,
    setUserChatInput,
    setSearchQuery,
    setActiveTab,
    setSelectedProject,
    handleCreateProject,
    handleCreateUserChat,
    handleCreateChat,
    toggleProjectExpansion,
    handleRenameProject,
    handleRenameChat,
    handleRenameUserChat,
    handleDeleteProject,
    handleDeleteChat,
    handleDeleteUserChat,
    closeRenameDialog,
    closeDeleteDialog,
    performRename,
    performDelete,
    handleSearch,
    getFilteredProjects
  };
}
