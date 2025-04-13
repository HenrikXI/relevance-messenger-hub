
import { SidebarDataState } from '@/types/sidebar';

export const useSearchActions = (
  state: SidebarDataState, 
  setState: React.Dispatch<React.SetStateAction<SidebarDataState>>
) => {
  const setSearchQuery = (value: string) => {
    setState(prev => ({ ...prev, searchQuery: value }));
  };
  
  const setActiveTab = (value: string) => {
    setState(prev => ({ ...prev, activeTab: value }));
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
    
    const newFilteredChats: Record<string, any> = {};
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

  return {
    setSearchQuery,
    setActiveTab,
    handleSearch
  };
};
