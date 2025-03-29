
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
import { Copy, Edit, MoreHorizontal, Trash2, FolderPlus } from "lucide-react";

interface ContextActionProps {
  children: React.ReactNode;
  onRename?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onAddToProject?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  onClick?: () => void;
  isProject?: boolean;
  isChat?: boolean;
  isMessage?: boolean;
  className?: string;
}

export const ContextMenuActions: React.FC<ContextActionProps> = ({
  children,
  onRename,
  onDelete,
  onCopy,
  onAddToProject,
  onShare,
  onArchive,
  onClick,
  isProject = false,
  isChat = false,
  isMessage = false,
  className,
}) => {
  // Safe handler to prevent React state updates on unmounted components
  const safeHandler = (handler?: () => void) => {
    if (!handler) return undefined;
    
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // Use setTimeout to ensure the menu is fully closed before the action is executed
      // This prevents UI freezes when components are unmounted during menu interactions
      setTimeout(() => {
        handler();
      }, 0);
    };
  };

  // Use standard ContextMenu for right-click actions
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          className={className}
          onClick={onClick}
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
                  onClick={safeHandler(onDelete)} 
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
                  {onAddToProject && (
                    <DropdownMenuItem onClick={safeHandler(onAddToProject)}>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      <span>Zu Projekt hinzufügen</span>
                    </DropdownMenuItem>
                  )}
                  
                  {onRename && (
                    <DropdownMenuItem onClick={safeHandler(onRename)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Umbenennen</span>
                    </DropdownMenuItem>
                  )}
                  
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={safeHandler(onDelete)}
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
        {onAddToProject && (
          <ContextMenuItem onClick={safeHandler(onAddToProject)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>Zu Projekt hinzufügen</span>
          </ContextMenuItem>
        )}
        
        {onRename && (
          <ContextMenuItem onClick={safeHandler(onRename)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Umbenennen</span>
          </ContextMenuItem>
        )}
        
        {onCopy && (
          <ContextMenuItem onClick={safeHandler(onCopy)}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Kopieren</span>
          </ContextMenuItem>
        )}
        
        {onDelete && (
          <ContextMenuItem 
            onClick={safeHandler(onDelete)}
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
