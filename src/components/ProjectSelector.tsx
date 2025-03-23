
import React from "react";
import { Project } from "../types";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProject,
  onSelectProject,
}) => {
  const handleChange = (value: string) => {
    const project = projects.find(p => p.id === value);
    if (project) {
      onSelectProject(project);
    }
  };

  return (
    <div className="w-full max-w-xs animate-fade-in">
      <Select
        value={selectedProject?.id}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full glass-input">
          <SelectValue placeholder="Projekt auswählen" />
        </SelectTrigger>
        <SelectContent className="glass-panel">
          <SelectGroup>
            <SelectLabel>Projekte</SelectLabel>
            {projects.map((project) => (
              <SelectItem
                key={project.id}
                value={project.id}
                className="cursor-pointer transition-colors hover:bg-secondary"
              >
                {project.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectSelector;
