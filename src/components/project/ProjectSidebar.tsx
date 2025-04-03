
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderClosed, Users } from "lucide-react";
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
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { 
    state, 
    setProjectInput,
    setUserChatInput,
    setActiveTab,
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
            
            <Tabs value={state.activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <FolderClosed className="h-4 w-4" />
                  <span>Projekte</span>
                </TabsTrigger>
                <TabsTrigger value="chats" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>User Chats</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="projects" className="space-y-4 mt-3">
                <ProjectCreationForm
                  projectInput={state.projectInput}
                  setProjectInput={setProjectInput}
                  handleCreateProject={handleCreateProject}
                />
              </TabsContent>
              
              <TabsContent value="chats" className="space-y-4 mt-3">
                <UserChatCreationForm
                  userChatInput={state.userChatInput}
                  setUserChatInput={setUserChatInput}
                  handleCreateUserChat={handleCreateUserChat}
                />
              </TabsContent>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className={state.activeTab === "projects" ? "block" : "hidden"}>
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
            
            <div className={state.activeTab === "chats" ? "block" : "hidden"}>
              <UserChatList 
                userChats={state.filteredUserChats}
                onRenameUserChat={handleRenameUserChat}
                onDeleteUserChat={handleDeleteUserChat}
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
