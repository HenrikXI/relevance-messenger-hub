
import { toast } from "sonner";
import { ChatItem, UserChat, SidebarDataState } from "@/types/sidebar";

// Load data from localStorage
export const loadSidebarData = (): Partial<SidebarDataState> => {
  try {
    const data: Partial<SidebarDataState> = {};
    
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      data.projects = JSON.parse(savedProjects);
    }
    
    const savedChats = localStorage.getItem("projectChats");
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      data.chats = parsedChats;
      data.filteredChats = parsedChats;
    }
    
    const savedExpanded = localStorage.getItem("expandedProjects");
    if (savedExpanded) {
      data.expandedProjects = JSON.parse(savedExpanded);
    }

    const savedUserChats = localStorage.getItem("userChats");
    if (savedUserChats) {
      const parsedUserChats = JSON.parse(savedUserChats);
      data.userChats = parsedUserChats;
      data.filteredUserChats = parsedUserChats;
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
      data.userChats = sampleUserChats;
      data.filteredUserChats = sampleUserChats;
      localStorage.setItem("userChats", JSON.stringify(sampleUserChats));
    }
    
    return data;
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
    return {};
  }
};

// Save data to localStorage
export const saveSidebarData = (state: SidebarDataState): void => {
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
};

// Search functionality
export const performSearch = (
  state: SidebarDataState, 
  query: string
): { filteredChats: Record<string, ChatItem[]>, filteredUserChats: UserChat[], expandedUpdates: Record<string, boolean> } => {
  const lowercaseQuery = query.toLowerCase();
  
  if (!lowercaseQuery.trim()) {
    return {
      filteredChats: {...state.chats},
      filteredUserChats: [...state.userChats],
      expandedUpdates: {}
    };
  }
  
  const newFilteredChats: Record<string, ChatItem[]> = {};
  const expandedUpdates: Record<string, boolean> = {};
  
  state.projects.forEach(projectName => {
    const projectChats = state.chats[projectName] || [];
    
    if (projectName.toLowerCase().includes(lowercaseQuery)) {
      newFilteredChats[projectName] = projectChats;
      expandedUpdates[projectName] = true;
      return;
    }
    
    const matchingChats = projectChats.filter(chat => 
      chat.title.toLowerCase().includes(lowercaseQuery) || 
      chat.preview.toLowerCase().includes(lowercaseQuery)
    );
    
    if (matchingChats.length > 0) {
      newFilteredChats[projectName] = matchingChats;
      expandedUpdates[projectName] = true;
    }
  });
  
  const newFilteredUserChats = state.userChats.filter(chat => 
    chat.username.toLowerCase().includes(lowercaseQuery) || 
    chat.lastMessage.toLowerCase().includes(lowercaseQuery)
  );
  
  return {
    filteredChats: newFilteredChats,
    filteredUserChats: newFilteredUserChats,
    expandedUpdates
  };
};

// Get filtered projects based on search query
export const getFilteredProjects = (state: SidebarDataState): string[] => {
  return state.projects.filter(project => {
    if (!state.searchQuery.trim()) return true;
    
    if (project.toLowerCase().includes(state.searchQuery.toLowerCase())) return true;
    
    return !!state.filteredChats[project]?.length;
  });
};

// Create a new chat for a project
export const createNewChat = (projectName: string, state: SidebarDataState): Partial<SidebarDataState> => {
  const newChat: ChatItem = {
    id: Date.now().toString(),
    title: `Chat ${(state.chats[projectName]?.length || 0) + 1}`,
    preview: "Neue Konversation",
    date: new Date().toLocaleDateString()
  };
  
  return {
    chats: {
      ...state.chats,
      [projectName]: [...(state.chats[projectName] || []), newChat]
    },
    filteredChats: {
      ...state.filteredChats,
      [projectName]: [...(state.filteredChats[projectName] || []), newChat]
    }
  };
};
