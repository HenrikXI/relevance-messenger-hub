
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProjectCreationFormProps {
  projectInput: string;
  setProjectInput: (value: string) => void;
  handleCreateProject: () => void;
}

const ProjectCreationForm: React.FC<ProjectCreationFormProps> = ({
  projectInput,
  setProjectInput,
  handleCreateProject
}) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Neues Projekt"
        value={projectInput}
        onChange={(e) => setProjectInput(e.target.value)}
        className="glass-input"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreateProject();
        }}
      />
      <Button onClick={handleCreateProject} size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProjectCreationForm;
