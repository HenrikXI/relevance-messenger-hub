
import { toast } from 'sonner';
import { SidebarDataState } from '@/types/sidebar';

export const useDialogActions = (
  state: SidebarDataState, 
  setState: React.Dispatch<React.SetStateAction<SidebarDataState>>
) => {
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
      
      // Sicherstellen, dass der selectedChatId zurückgesetzt wird, wenn der aktuelle Chat gelöscht wird
      const isSelectedChat = state.selectedChatId === chatId;
      
      setState(prev => ({
        ...prev,
        userChats: updatedChats,
        filteredUserChats: updatedChats.filter(chat => 
          !prev.searchQuery || 
          chat.username.toLowerCase().includes(prev.searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(prev.searchQuery.toLowerCase())
        ),
        deleteDialogOpen: false,
        selectedChatId: isSelectedChat ? null : prev.selectedChatId
      }));
      
      // Nachrichten für diesen Chat aus dem localStorage entfernen
      localStorage.removeItem(`chat_${chatId}_messages`);
      
      toast.success(`Chat mit "${state.itemToDelete.name}" wurde gelöscht`);
    }
  };

  return {
    closeRenameDialog,
    closeDeleteDialog,
    performRename,
    performDelete
  };
};
