
import { useState } from "react";
import { toast } from "sonner";
import { SidebarDataState, UserChat } from "@/types/sidebar";

export function useUserChatManagement(initialState: SidebarDataState, updateState: (updates: Partial<SidebarDataState>) => void) {
  const [userChatInput, setUserChatInput] = useState(initialState.userChatInput);
  
  const handleCreateUserChat = () => {
    if (!userChatInput.trim()) return;
    
    const newChat: UserChat = {
      id: Date.now().toString(),
      username: userChatInput.trim(),
      lastMessage: "Neue Konversation gestartet",
      unread: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    updateState({
      userChats: [...initialState.userChats, newChat],
      filteredUserChats: [...initialState.filteredUserChats, newChat],
      userChatInput: ""
    });
    
    toast.success(`Chat mit ${newChat.username} erstellt`);
  };

  const handleRenameUserChat = (chatId: string) => {
    const chat = initialState.userChats.find(c => c.id === chatId);
    if (chat) {
      updateState({
        itemToRename: {
          type: 'userChat',
          id: chatId,
          name: chat.username
        },
        renameDialogOpen: true
      });
    }
  };

  const handleDeleteUserChat = (chatId: string) => {
    const chat = initialState.userChats.find(c => c.id === chatId);
    if (chat) {
      updateState({
        itemToDelete: {
          type: 'userChat',
          id: chatId,
          name: chat.username
        },
        deleteDialogOpen: true
      });
    }
  };

  const performUserChatRename = (chatId: string, newName: string): Partial<SidebarDataState> => {
    const updatedChats = initialState.userChats.map(chat => 
      chat.id === chatId ? { ...chat, username: newName } : chat
    );
    
    toast.success(`Chat umbenannt: ${initialState.itemToRename.name} → ${newName}`);
    
    return {
      userChats: updatedChats,
      filteredUserChats: updatedChats.filter(chat => 
        !initialState.searchQuery || 
        chat.username.toLowerCase().includes(initialState.searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(initialState.searchQuery.toLowerCase())
      )
    };
  };

  const performUserChatDelete = (chatId: string): Partial<SidebarDataState> => {
    const updatedChats = initialState.userChats.filter(chat => chat.id !== chatId);
    
    // Sicherstellen, dass der selectedChatId zurückgesetzt wird, wenn der aktuelle Chat gelöscht wird
    const isSelectedChat = initialState.selectedChatId === chatId;
    
    // Nachrichten für diesen Chat aus dem localStorage entfernen
    localStorage.removeItem(`chat_${chatId}_messages`);
    
    toast.success(`Chat mit "${initialState.itemToDelete.name}" wurde gelöscht`);
    
    return {
      userChats: updatedChats,
      filteredUserChats: updatedChats.filter(chat => 
        !initialState.searchQuery || 
        chat.username.toLowerCase().includes(initialState.searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(initialState.searchQuery.toLowerCase())
      ),
      deleteDialogOpen: false,
      selectedChatId: isSelectedChat ? null : initialState.selectedChatId
    };
  };

  return {
    userChatInput,
    setUserChatInput,
    handleCreateUserChat,
    handleRenameUserChat,
    handleDeleteUserChat,
    performUserChatRename,
    performUserChatDelete
  };
}
