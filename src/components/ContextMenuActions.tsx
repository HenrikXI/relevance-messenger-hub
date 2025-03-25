
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit, MoreHorizontal, Share, Trash2, Archive, FolderPlus } from "lucide-react";

interface ContextActionProps {
  children: React.ReactNode;
  onRename?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onAddToProject?: () => void;
  onClick?: () => void; // Added onClick prop to the interface
  isProject?: boolean;
  isChat?: boolean;
  isMessage?: boolean;
  className?: string;
}

export const ContextMenuActions: React.FC<ContextActionProps> = ({
  children,
  onRename,
  onDelete,
  onArchive,
  onCopy,
  onShare,
  onAddToProject,
  onClick, // Add onClick to the parameter list
  isProject = false,
  isChat = false,
  isMessage = false,
  className,
}) => {
  // Use standard ContextMenu for right-click actions
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          className={className}
          onClick={onClick} // Use the onClick prop here
        >
          {children}
          
          {/* For messages, show icon buttons directly */}
          {isMessage && (
            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              {onCopy && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onCopy(); }} 
                  className="p-1 hover:bg-accent rounded-full"
                  title="Kopieren"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                  className="p-1 hover:bg-accent rounded-full"
                  title="Löschen"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              )}
            </div>
          )}
          
          {/* For chats and projects, show three dots menu */}
          {(isChat || isProject) && (
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    onClick={(e) => e.stopPropagation()} 
                    className="p-1 hover:bg-accent rounded-sm"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                      <Share className="mr-2 h-4 w-4" />
                      <span>Gemeinsam nutzen</span>
                    </DropdownMenuItem>
                  )}
                  
                  {onAddToProject && (
                    <DropdownMenuItem onClick={onAddToProject}>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      <span>Zu Projekt hinzufügen</span>
                    </DropdownMenuItem>
                  )}
                  
                  {onRename && (
                    <DropdownMenuItem onClick={onRename}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Umbenennen</span>
                    </DropdownMenuItem>
                  )}
                  
                  {onArchive && (
                    <DropdownMenuItem onClick={onArchive}>
                      <Archive className="mr-2 h-4 w-4" />
                      <span>Archivieren</span>
                    </DropdownMenuItem>
                  )}
                  
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Löschen</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-56">
        {onShare && (
          <ContextMenuItem onClick={onShare}>
            <Share className="mr-2 h-4 w-4" />
            <span>Gemeinsam nutzen</span>
          </ContextMenuItem>
        )}
        
        {onAddToProject && (
          <ContextMenuItem onClick={onAddToProject}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>Zu Projekt hinzufügen</span>
          </ContextMenuItem>
        )}
        
        {onRename && (
          <ContextMenuItem onClick={onRename}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Umbenennen</span>
          </ContextMenuItem>
        )}
        
        {onArchive && (
          <ContextMenuItem onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" />
            <span>Archivieren</span>
          </ContextMenuItem>
        )}
        
        {onCopy && (
          <ContextMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Kopieren</span>
          </ContextMenuItem>
        )}
        
        {onDelete && (
          <ContextMenuItem 
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Löschen</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
