
import { useState, useEffect } from "react";
import { SidebarDataState } from "@/types/sidebar";
import { loadSidebarData, saveSidebarData } from "@/utils/sidebarStorage";
import { useProjectActions } from "./sidebar/useProjectActions";
import { useUserChatActions } from "./sidebar/useUserChatActions";
import { useDialogActions } from "./sidebar/useDialogActions";
import { useSearchActions } from "./sidebar/useSearchActions";

// Initialize the default state
const getInitialState = (): SidebarDataState => {
  return {
    projects: [],
    selectedProject: null,
    projectInput: "",
    userChatInput: "",
    searchQuery: "",
    chats: {},
    userChats: [],
    expandedProjects: {},
    renameDialogOpen: false,
    itemToRename: { type: 'project', id: '', name: '' },
    deleteDialogOpen: false,
    itemToDelete: { type: 'project', id: '', name: '' },
    filteredChats: {},
    filteredUserChats: [],
    activeTab: "projects",
    selectedChatId: null
  };
};

export function useSidebarData() {
  const [state, setState] = useState<SidebarDataState>(getInitialState());

  // Load data from localStorage on initialization
  useEffect(() => {
    const loadedData = loadSidebarData();
    setState(prev => ({ ...prev, ...loadedData }));
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    saveSidebarData(state);
  }, [state.projects, state.chats, state.expandedProjects, state.userChats]);

  // Import all the functionality from other hooks
  const projectActions = useProjectActions(state, setState);
  const userChatActions = useUserChatActions(state, setState);
  const dialogActions = useDialogActions(state, setState);
  const searchActions = useSearchActions(state, setState);

  // Return all actions and state
  return {
    state,
    ...projectActions,
    ...userChatActions,
    ...dialogActions,
    ...searchActions
  };
}
