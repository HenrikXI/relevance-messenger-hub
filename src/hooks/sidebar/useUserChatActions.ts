
import { toast } from 'sonner';
import { SidebarDataState, UserChat } from '@/types/sidebar';

export const useUserChatActions = (
  state: SidebarDataState, 
  setState: React.Dispatch<React.SetStateAction<SidebarDataState>>
) => {
  const setUserChatInput = (value: string) => {
    setState(prev => ({ ...prev, userChatInput: value }));
  };

  const setSelectedChatId = (id: string | null) => {
    setState(prev => ({ ...prev, selectedChatId: id }));
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

  return {
    setUserChatInput,
    setSelectedChatId,
    handleCreateUserChat,
    handleRenameUserChat,
    handleDeleteUserChat
  };
};
