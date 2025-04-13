
import { SidebarDataState, UserChat } from "@/types/sidebar";

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
      const sampleUserChats = createSampleUserChats();
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

export const saveSidebarData = (data: Partial<SidebarDataState>): void => {
  if (data.projects && data.projects.length > 0) {
    localStorage.setItem("projects", JSON.stringify(data.projects));
  }
  
  if (data.chats && Object.keys(data.chats).length > 0) {
    localStorage.setItem("projectChats", JSON.stringify(data.chats));
  }
  
  if (data.expandedProjects && Object.keys(data.expandedProjects).length > 0) {
    localStorage.setItem("expandedProjects", JSON.stringify(data.expandedProjects));
  }

  if (data.userChats && data.userChats.length > 0) {
    localStorage.setItem("userChats", JSON.stringify(data.userChats));
  }
};

export const createSampleUserChats = (): UserChat[] => {
  return [
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
};
