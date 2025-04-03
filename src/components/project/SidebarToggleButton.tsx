
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface SidebarToggleButtonProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  collapsed,
  onToggleCollapse
}) => {
  return (
    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 rounded-full bg-background border shadow-sm"
        onClick={onToggleCollapse}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default SidebarToggleButton;
