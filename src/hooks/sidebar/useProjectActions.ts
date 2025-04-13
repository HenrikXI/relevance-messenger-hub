
import { useState } from 'react';
import { toast } from 'sonner';
import { SidebarDataState, ChatItem } from '@/types/sidebar';

export const useProjectActions = (
  state: SidebarDataState, 
  setState: React.Dispatch<React.SetStateAction<SidebarDataState>>
) => {
  const setProjectInput = (value: string) => {
    setState(prev => ({ ...prev, projectInput: value }));
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

  const getFilteredProjects = () => {
    return state.projects.filter(project => {
      if (!state.searchQuery.trim()) return true;
      
      if (project.toLowerCase().includes(state.searchQuery.toLowerCase())) return true;
      
      return !!state.filteredChats[project]?.length;
    });
  };

  return {
    setProjectInput,
    setSelectedProject,
    handleCreateProject,
    handleCreateChat,
    toggleProjectExpansion,
    handleRenameProject,
    handleRenameChat,
    handleDeleteProject,
    handleDeleteChat,
    getFilteredProjects
  };
};
