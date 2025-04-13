
import { useState } from "react";
import { toast } from "sonner";
import { SidebarDataState } from "@/types/sidebar";
import { createNewChat } from "@/utils/sidebarUtils";

export function useChatManagement(initialState: SidebarDataState, updateState: (updates: Partial<SidebarDataState>) => void) {
  
  const handleCreateChat = (projectName: string) => {
    const updates = createNewChat(projectName, initialState);
    updateState(updates);
  };

  const handleRenameChat = (chatId: string, projectId: string) => {
    const chat = initialState.chats[projectId]?.find(c => c.id === chatId);
    if (chat) {
      updateState({
        itemToRename: {
          type: 'chat',
          id: chatId,
          name: chat.title,
          projectId
        },
        renameDialogOpen: true
      });
    }
  };

  const handleDeleteChat = (chatId: string, projectId: string) => {
    const chat = initialState.chats[projectId]?.find(c => c.id === chatId);
    if (chat) {
      updateState({
        itemToDelete: {
          type: 'chat',
          id: chatId,
          name: chat.title,
          projectId
        },
        deleteDialogOpen: true
      });
    }
  };

  const performChatRename = (chatId: string, projectId: string, newName: string): Partial<SidebarDataState> => {
    const projectChats = [...(initialState.chats[projectId] || [])];
    const chatIndex = projectChats.findIndex(c => c.id === chatId);
    
    if (chatIndex !== -1) {
      projectChats[chatIndex] = {
        ...projectChats[chatIndex],
        title: newName
      };
      
      const updatedChats = {
        ...initialState.chats,
        [projectId]: projectChats
      };
      
      const filteredProjectChats = [...(initialState.filteredChats[projectId] || [])];
      const filteredChatIndex = filteredProjectChats.findIndex(c => c.id === chatId);
      
      let updatedFilteredChats = {...initialState.filteredChats};
      
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
      
      toast.success(`Chat umbenannt: ${initialState.itemToRename.name} → ${newName}`);
      
      return {
        chats: updatedChats,
        filteredChats: updatedFilteredChats
      };
    }
    
    return {};
  };

  const performChatDelete = (chatId: string, projectId: string): Partial<SidebarDataState> => {
    const projectChats = initialState.chats[projectId] || [];
    const updatedProjectChats = projectChats.filter(c => c.id !== chatId);
    
    const updatedChats = {
      ...initialState.chats,
      [projectId]: updatedProjectChats
    };
    
    const filteredProjectChats = initialState.filteredChats[projectId] || [];
    const updatedFilteredChats = {
      ...initialState.filteredChats,
      [projectId]: filteredProjectChats.filter(c => c.id !== chatId)
    };
    
    toast.success(`Chat "${initialState.itemToDelete.name}" wurde gelöscht`);
    
    return {
      chats: updatedChats,
      filteredChats: updatedFilteredChats,
      deleteDialogOpen: false
    };
  };

  return {
    handleCreateChat,
    handleRenameChat,
    handleDeleteChat,
    performChatRename,
    performChatDelete
  };
}
