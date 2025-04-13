
import React from "react";
import ProjectsOverview from "@/components/project/ProjectsOverview";
import { useProjects } from "@/contexts/ProjectContext";

const ProjectsPage: React.FC = () => {
  const { projects } = useProjects();
  
  return (
    <div className="container mx-auto py-8">
      <ProjectsOverview projects={projects} />
    </div>
  );
};

export default ProjectsPage;
