
import { useState } from "react";
import { toast } from "sonner";
import { SidebarDataState } from "@/types/sidebar";

export function useProjectManagement(initialState: SidebarDataState, updateState: (updates: Partial<SidebarDataState>) => void) {
  const [projectInput, setProjectInput] = useState(initialState.projectInput);
  
  const handleCreateProject = () => {
    if (!projectInput.trim()) return;
    
    const newProject = projectInput.trim();
    if (!initialState.projects.includes(newProject)) {
      updateState({
        projects: [...initialState.projects, newProject],
        chats: { ...initialState.chats, [newProject]: [] },
        filteredChats: { ...initialState.filteredChats, [newProject]: [] },
        expandedProjects: { ...initialState.expandedProjects, [newProject]: true },
        selectedProject: newProject,
        projectInput: ""
      });
    } else {
      updateState({
        selectedProject: newProject,
        projectInput: ""
      });
    }
  };

  const handleRenameProject = (projectId: string) => {
    updateState({
      itemToRename: {
        type: 'project',
        id: projectId,
        name: projectId
      },
      renameDialogOpen: true
    });
  };

  const handleDeleteProject = (projectId: string) => {
    updateState({
      itemToDelete: {
        type: 'project',
        id: projectId,
        name: projectId
      },
      deleteDialogOpen: true
    });
  };

  const toggleProjectExpansion = (project: string) => {
    updateState({
      expandedProjects: {
        ...initialState.expandedProjects,
        [project]: !initialState.expandedProjects[project]
      }
    });
  };

  const performProjectRename = (oldName: string, newName: string): Partial<SidebarDataState> => {
    const projectIndex = initialState.projects.findIndex(p => p === oldName);
    
    if (projectIndex !== -1) {
      const updatedProjects = [...initialState.projects];
      updatedProjects[projectIndex] = newName;
      
      const projectChats = initialState.chats[oldName] || [];
      const updatedChats = {...initialState.chats};
      delete updatedChats[oldName];
      updatedChats[newName] = projectChats;
      
      const filteredProjectChats = initialState.filteredChats[oldName] || [];
      const updatedFilteredChats = {...initialState.filteredChats};
      delete updatedFilteredChats[oldName];
      updatedFilteredChats[newName] = filteredProjectChats;
      
      const isExpanded = initialState.expandedProjects[oldName];
      const updatedExpanded = {...initialState.expandedProjects};
      delete updatedExpanded[oldName];
      updatedExpanded[newName] = isExpanded;
      
      toast.success(`Projekt umbenannt: ${oldName} → ${newName}`);
      
      return {
        projects: updatedProjects,
        chats: updatedChats,
        filteredChats: updatedFilteredChats,
        expandedProjects: updatedExpanded,
        selectedProject: initialState.selectedProject === oldName ? newName : initialState.selectedProject
      };
    }
    
    return {};
  };

  const performProjectDelete = (projectId: string): Partial<SidebarDataState> => {
    const updatedProjects = initialState.projects.filter(p => p !== projectId);
    
    const updatedChats = {...initialState.chats};
    delete updatedChats[projectId];
    
    const updatedFilteredChats = {...initialState.filteredChats};
    delete updatedFilteredChats[projectId];
    
    const updatedExpanded = {...initialState.expandedProjects};
    delete updatedExpanded[projectId];
    
    toast.success(`Projekt "${projectId}" wurde gelöscht`);
    
    return {
      projects: updatedProjects,
      chats: updatedChats,
      filteredChats: updatedFilteredChats,
      expandedProjects: updatedExpanded,
      selectedProject: initialState.selectedProject === projectId ? null : initialState.selectedProject,
      deleteDialogOpen: false
    };
  };

  return {
    projectInput,
    setProjectInput,
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
    toggleProjectExpansion,
    performProjectRename,
    performProjectDelete
  };
}
