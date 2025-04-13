
import { useState, useEffect, useCallback } from "react";
import { SidebarDataState } from "@/types/sidebar";
import { loadSidebarData, saveSidebarData, performSearch, getFilteredProjects as getFilteredProjectsList } from "@/utils/sidebarUtils";
import { useProjectManagement } from "./useProjectManagement";
import { useChatManagement } from "./useChatManagement";
import { useUserChatManagement } from "./useUserChatManagement";
import { updateSidebarState, resetDialogState } from "@/utils/sidebarStateUtils";
import { toast } from "sonner";

const initialSidebarState: SidebarDataState = {
  projects: [],
  selectedProject: null,
  projectInput: "",
  userChatInput: "",
  searchQuery: "",
  chats: {},
  userChats: [],
  expandedProjects: {},
  renameDialogOpen: false,
  itemToRename: {type: 'project', id: '', name: ''},
  deleteDialogOpen: false,
  itemToDelete: {type: 'project', id: '', name: ''},
  filteredChats: {},
  filteredUserChats: [],
  activeTab: "projects",
  selectedChatId: null
};

export function useSidebarData() {
  const [state, setState] = useState<SidebarDataState>(initialSidebarState);

  // Helper function to update state safely
  const updateState = useCallback((updates: Partial<SidebarDataState>) => {
    setState(prev => updateSidebarState(prev, updates));
  }, []);

  // Initialize hooks with state and update function
  const projectManagement = useProjectManagement(state, updateState);
  const chatManagement = useChatManagement(state, updateState);
  const userChatManagement = useUserChatManagement(state, updateState);

  // Load data on initial mount
  useEffect(() => {
    try {
      const data = loadSidebarData();
      if (Object.keys(data).length > 0) {
        updateState(data);
      }
    } catch (error) {
      console.error("Error loading sidebar data:", error);
      toast.error("Fehler beim Laden der Daten");
    }
  }, [updateState]);

  // Save data when it changes
  useEffect(() => {
    try {
      saveSidebarData(state);
    } catch (error) {
      console.error("Error saving sidebar data:", error);
      // Don't show toast on save errors to avoid spamming the user
    }
  }, [state.projects, state.chats, state.expandedProjects, state.userChats]);

  // Set search query and filter results
  const setSearchQuery = useCallback((value: string) => {
    try {
      const { filteredChats, filteredUserChats, expandedUpdates } = performSearch(state, value);
      
      updateState({
        searchQuery: value,
        filteredChats,
        filteredUserChats,
        expandedProjects: {...state.expandedProjects, ...expandedUpdates}
      });
    } catch (error) {
      console.error("Error performing search:", error);
      toast.error("Fehler bei der Suche");
    }
  }, [state, updateState]);

  // Set active tab
  const setActiveTab = useCallback((value: string) => {
    updateState({ activeTab: value });
  }, [updateState]);

  // Set selected project
  const setSelectedProject = useCallback((project: string | null) => {
    updateState({ selectedProject: project });
  }, [updateState]);

  // Set selected chat ID
  const setSelectedChatId = useCallback((id: string | null) => {
    updateState({ selectedChatId: id });
  }, [updateState]);

  // Close rename dialog
  const closeRenameDialog = useCallback(() => {
    updateState(resetDialogState(state));
  }, [state, updateState]);

  // Close delete dialog
  const closeDeleteDialog = useCallback(() => {
    updateState(resetDialogState(state));
  }, [state, updateState]);

  // Perform rename based on item type
  const performRename = useCallback((newName: string) => {
    try {
      if (!newName.trim()) {
        toast.error("Name darf nicht leer sein");
        return;
      }

      let updates: Partial<SidebarDataState> = {};
      
      if (state.itemToRename.type === 'project') {
        updates = projectManagement.performProjectRename(state.itemToRename.id, newName);
      } else if (state.itemToRename.type === 'chat' && state.itemToRename.projectId) {
        updates = chatManagement.performChatRename(state.itemToRename.id, state.itemToRename.projectId, newName);
      } else if (state.itemToRename.type === 'userChat') {
        updates = userChatManagement.performUserChatRename(state.itemToRename.id, newName);
      }
      
      updateState({...updates, ...resetDialogState(state)});
    } catch (error) {
      console.error("Error renaming item:", error);
      toast.error("Fehler beim Umbenennen");
      closeRenameDialog();
    }
  }, [state, updateState, projectManagement, chatManagement, userChatManagement, closeRenameDialog]);

  // Perform delete based on item type
  const performDelete = useCallback(() => {
    try {
      let updates: Partial<SidebarDataState> = {};
      
      if (state.itemToDelete.type === 'project') {
        updates = projectManagement.performProjectDelete(state.itemToDelete.id);
      } else if (state.itemToDelete.type === 'chat' && state.itemToDelete.projectId) {
        updates = chatManagement.performChatDelete(state.itemToDelete.id, state.itemToDelete.projectId);
      } else if (state.itemToDelete.type === 'userChat') {
        updates = userChatManagement.performUserChatDelete(state.itemToDelete.id);
      }
      
      updateState({...updates, ...resetDialogState(state)});
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Fehler beim Löschen");
      closeDeleteDialog();
    }
  }, [state, updateState, projectManagement, chatManagement, userChatManagement, closeDeleteDialog]);

  // Get filtered projects
  const getFilteredProjects = useCallback(() => {
    try {
      return getFilteredProjectsList(state);
    } catch (error) {
      console.error("Error getting filtered projects:", error);
      return [];
    }
  }, [state]);

  return {
    state,
    setProjectInput: projectManagement.setProjectInput,
    setUserChatInput: userChatManagement.setUserChatInput,
    setSearchQuery,
    setActiveTab,
    setSelectedProject,
    setSelectedChatId,
    handleCreateProject: projectManagement.handleCreateProject,
    handleCreateUserChat: userChatManagement.handleCreateUserChat,
    handleCreateChat: chatManagement.handleCreateChat,
    toggleProjectExpansion: projectManagement.toggleProjectExpansion,
    handleRenameProject: projectManagement.handleRenameProject,
    handleRenameChat: chatManagement.handleRenameChat,
    handleRenameUserChat: userChatManagement.handleRenameUserChat,
    handleDeleteProject: projectManagement.handleDeleteProject,
    handleDeleteChat: chatManagement.handleDeleteChat,
    handleDeleteUserChat: userChatManagement.handleDeleteUserChat,
    closeRenameDialog,
    closeDeleteDialog,
    performRename,
    performDelete,
    handleSearch: setSearchQuery,
    getFilteredProjects
  };
}
