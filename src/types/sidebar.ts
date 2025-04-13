
export interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
}

export interface UserChat {
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
  selectedChatId: string | null;
}
