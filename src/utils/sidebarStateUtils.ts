
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
export const resetDialogState = (state: SidebarDataState) => {
  return {
    ...state,
    renameDialogOpen: false,
    deleteDialogOpen: false,
    itemToRename: { type: 'project', id: '', name: '' },
    itemToDelete: { type: 'project', id: '', name: '' }
  };
};
