
import React from "react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContextMenuActions } from "@/components/ContextMenuActions";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

interface ProjectItemProps {
  project: string;
  expanded: boolean;
  isSelected: boolean;
  onSelect: (project: string) => void;
  onToggleExpand: (project: string) => void;
  onRename: (project: string) => void;
  onDelete: (project: string) => void;
  onCreateChat: (project: string) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({
  project,
  expanded,
  isSelected,
  onSelect,
  onToggleExpand,
  onRename,
  onDelete,
  onCreateChat
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <ContextMenuActions
          className={`flex-1 flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent relative group ${
            isSelected ? "bg-accent" : ""
          }`}
          isProject={true}
          onRename={() => onRename(project)}
          onDelete={() => onDelete(project)}
          onClick={() => onSelect(project)}
        >
          <div className="flex-1 flex items-center gap-2">
            <Folder className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{project}</span>
          </div>
        </ContextMenuActions>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-7 w-7" onClick={() => onToggleExpand(project)}>
            {expanded ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </Button>
        </CollapsibleTrigger>
      </div>
    </div>
  );
};

export default ProjectItem;
