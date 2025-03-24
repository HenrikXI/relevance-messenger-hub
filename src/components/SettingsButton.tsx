
import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsButtonProps {
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground"
      title="Einstellungen"
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
};

export default SettingsButton;
