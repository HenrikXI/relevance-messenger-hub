
import { useState, useEffect } from "react";
import { SidebarDataState } from "@/types/sidebar";
import { loadSidebarData, saveSidebarData, performSearch, getFilteredProjects as getFilteredProjectsList } from "@/utils/sidebarUtils";
import { useProjectManagement } from "./useProjectManagement";
import { useChatManagement } from "./useChatManagement";
import { useUserChatManagement } from "./useUserChatManagement";

export function useSidebarData() {
  const [state, setState] = useState<SidebarDataState>({
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
  });

  // Helper function to update state
  const updateState = (updates: Partial<SidebarDataState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Initialize hooks with state and update function
  const projectManagement = useProjectManagement(state, updateState);
  const chatManagement = useChatManagement(state, updateState);
  const userChatManagement = useUserChatManagement(state, updateState);

  // Load data on initial mount
  useEffect(() => {
    const data = loadSidebarData();
    if (Object.keys(data).length > 0) {
      updateState(data);
    }
  }, []);

  // Save data when it changes
  useEffect(() => {
    saveSidebarData(state);
  }, [state.projects, state.chats, state.expandedProjects, state.userChats]);

  // Set search query and filter results
  const setSearchQuery = (value: string) => {
    const { filteredChats, filteredUserChats, expandedUpdates } = performSearch(state, value);
    
    updateState({
      searchQuery: value,
      filteredChats,
      filteredUserChats,
      expandedProjects: {...state.expandedProjects, ...expandedUpdates}
    });
  };

  // Set active tab
  const setActiveTab = (value: string) => {
    updateState({ activeTab: value });
  };

  // Set selected project
  const setSelectedProject = (project: string | null) => {
    updateState({ selectedProject: project });
  };

  // Set selected chat ID
  const setSelectedChatId = (id: string | null) => {
    updateState({ selectedChatId: id });
  };

  // Close rename dialog
  const closeRenameDialog = () => {
    updateState({ renameDialogOpen: false });
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    updateState({ deleteDialogOpen: false });
  };

  // Perform rename based on item type
  const performRename = (newName: string) => {
    if (state.itemToRename.type === 'project') {
      const updates = projectManagement.performProjectRename(state.itemToRename.id, newName);
      updateState(updates);
    } else if (state.itemToRename.type === 'chat' && state.itemToRename.projectId) {
      const updates = chatManagement.performChatRename(state.itemToRename.id, state.itemToRename.projectId, newName);
      updateState(updates);
    } else if (state.itemToRename.type === 'userChat') {
      const updates = userChatManagement.performUserChatRename(state.itemToRename.id, newName);
      updateState(updates);
    }
    
    closeRenameDialog();
  };

  // Perform delete based on item type
  const performDelete = () => {
    if (state.itemToDelete.type === 'project') {
      const updates = projectManagement.performProjectDelete(state.itemToDelete.id);
      updateState(updates);
    } else if (state.itemToDelete.type === 'chat' && state.itemToDelete.projectId) {
      const updates = chatManagement.performChatDelete(state.itemToDelete.id, state.itemToDelete.projectId);
      updateState(updates);
    } else if (state.itemToDelete.type === 'userChat') {
      const updates = userChatManagement.performUserChatDelete(state.itemToDelete.id);
      updateState(updates);
    }
  };

  // Get filtered projects
  const getFilteredProjects = () => getFilteredProjectsList(state);

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
