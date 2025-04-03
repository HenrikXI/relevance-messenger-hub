
import React from "react";
import RenameDialog from "@/components/RenameDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProjectDialogsProps {
  renameDialogOpen: boolean;
  deleteDialogOpen: boolean;
  itemToRename: {type: 'project' | 'chat' | 'userChat', id: string, name: string, projectId?: string};
  itemToDelete: {type: 'project' | 'chat' | 'userChat', id: string, name: string, projectId?: string};
  onCloseRenameDialog: () => void;
  onCloseDeleteDialog: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

const ProjectDialogs: React.FC<ProjectDialogsProps> = ({
  renameDialogOpen,
  deleteDialogOpen,
  itemToRename,
  itemToDelete,
  onCloseRenameDialog,
  onCloseDeleteDialog,
  onRename,
  onDelete
}) => {
  return (
    <>
      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialogOpen}
        onClose={onCloseRenameDialog}
        onRename={onRename}
        title={
          itemToRename.type === 'project' 
            ? "Projekt umbenennen" 
            : itemToRename.type === 'chat' 
              ? "Chat umbenennen"
              : "Benutzer-Chat umbenennen"
        }
        currentName={itemToRename.name}
        entityType={itemToRename.type}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>
              {itemToDelete.type === 'project' 
                ? "Projekt löschen" 
                : itemToDelete.type === 'chat'
                  ? "Chat löschen"
                  : "Benutzer-Chat löschen"
              }
            </DialogTitle>
          </DialogHeader>
          <p>
            {itemToDelete.type === 'project'
              ? `Möchten Sie das Projekt "${itemToDelete.name}" wirklich löschen? Alle zugehörigen Chats werden ebenfalls gelöscht.`
              : itemToDelete.type === 'chat'
                ? `Möchten Sie den Chat "${itemToDelete.name}" wirklich löschen?`
                : `Möchten Sie den Benutzer-Chat mit "${itemToDelete.name}" wirklich löschen?`
            }
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDeleteDialog}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectDialogs;
