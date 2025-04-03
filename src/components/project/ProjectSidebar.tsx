
import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ProjectList from "./ProjectList";
import ProjectDialogs from "./ProjectDialogs";
import UserChatList from "./UserChatList";
import SearchArea from "./SearchArea";
import ProjectCreationForm from "./ProjectCreationForm";
import UserChatCreationForm from "./UserChatCreationForm";
import SidebarToggleButton from "./SidebarToggleButton";
import { useSidebarData } from "@/hooks/useSidebarData";

interface ProjectSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: 'projects' | 'chats';
  setActiveTab: (tab: 'projects' | 'chats') => void;
  onSelectChat?: (chatId: string) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ 
  collapsed, 
  onToggleCollapse,
  activeTab,
  setActiveTab,
  onSelectChat
}) => {
  const { 
    state, 
    setProjectInput,
    setUserChatInput,
    setSelectedProject,
    handleCreateProject,
    handleCreateUserChat,
    handleCreateChat,
    toggleProjectExpansion,
    handleRenameProject,
    handleRenameChat,
    handleRenameUserChat,
    handleDeleteProject,
    handleDeleteChat,
    handleDeleteUserChat,
    closeRenameDialog,
    closeDeleteDialog,
    performRename,
    performDelete,
    handleSearch,
    getFilteredProjects
  } = useSidebarData();

  const filteredProjects = getFilteredProjects();

  useEffect(() => {
    // Update the active tab in the sidebar data
    setActiveTab(activeTab);
  }, [activeTab, setActiveTab]);

  return (
    <div className="flex flex-col h-full relative">
      <SidebarToggleButton 
        collapsed={collapsed} 
        onToggleCollapse={onToggleCollapse} 
      />
      
      {!collapsed && (
        <>
          <div className="p-4 border-b">
            <SearchArea 
              searchQuery={state.searchQuery} 
              onSearch={handleSearch} 
            />
            
            <Tabs value={activeTab} className="mt-3">
              <TabsContent value="projects" className="space-y-4">
                <ProjectCreationForm
                  projectInput={state.projectInput}
                  setProjectInput={setProjectInput}
                  handleCreateProject={handleCreateProject}
                />
              </TabsContent>
              
              <TabsContent value="chats" className="space-y-4">
                <UserChatCreationForm
                  userChatInput={state.userChatInput}
                  setUserChatInput={setUserChatInput}
                  handleCreateUserChat={handleCreateUserChat}
                />
              </TabsContent>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className={activeTab === "projects" ? "block" : "hidden"}>
              <ProjectList 
                projects={filteredProjects}
                expandedProjects={state.expandedProjects}
                selectedProject={state.selectedProject}
                chats={state.filteredChats}
                onSelectProject={setSelectedProject}
                onToggleProject={toggleProjectExpansion}
                onRenameProject={handleRenameProject}
                onDeleteProject={handleDeleteProject}
                onCreateChat={handleCreateChat}
                onRenameChat={handleRenameChat}
                onDeleteChat={handleDeleteChat}
              />
            </div>
            
            <div className={activeTab === "chats" ? "block" : "hidden"}>
              <UserChatList 
                userChats={state.filteredUserChats}
                onRenameUserChat={handleRenameUserChat}
                onDeleteUserChat={handleDeleteUserChat}
                onSelectChat={onSelectChat}
              />
            </div>
          </ScrollArea>
          
          <ProjectDialogs
            renameDialogOpen={state.renameDialogOpen}
            deleteDialogOpen={state.deleteDialogOpen}
            itemToRename={state.itemToRename}
            itemToDelete={state.itemToDelete}
            onCloseRenameDialog={closeRenameDialog}
            onCloseDeleteDialog={closeDeleteDialog}
            onRename={performRename}
            onDelete={performDelete}
          />
        </>
      )}
    </div>
  );
};

export default ProjectSidebar;
