
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  title: string;
  currentName: string;
  entityType: "project" | "chat";
}

const RenameDialog: React.FC<RenameDialogProps> = ({
  isOpen,
  onClose,
  onRename,
  title,
  currentName,
  entityType,
}) => {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={entityType === "project" ? "Projektname" : "Chat-Name"}
              className="glass-input"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit">
              Umbenennen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;
