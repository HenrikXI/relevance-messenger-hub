
import { SidebarDataState } from "@/types/sidebar";

// Generic state update function
export const updateSidebarState = <K extends keyof SidebarDataState>(
  currentState: SidebarDataState, 
  updates: Partial<Pick<SidebarDataState, K>>
): SidebarDataState => {
  return {
    ...currentState,
    ...updates
  };
};

// Utility for resetting dialogs
export const resetDialogState = (state: SidebarDataState): Partial<SidebarDataState> => {
  return {
    renameDialogOpen: false,
    deleteDialogOpen: false,
    itemToRename: { type: 'project' as const, id: '', name: '' },
    itemToDelete: { type: 'project' as const, id: '', name: '' }
  };
};
