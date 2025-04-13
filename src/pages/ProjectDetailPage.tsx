
import React from "react";
import ProjectDetail from "@/components/project/ProjectDetail";
import { useProjects } from "@/contexts/ProjectContext";

const ProjectDetailPage: React.FC = () => {
  const { projects, updateProject } = useProjects();
  
  return (
    <div className="container mx-auto py-8">
      <ProjectDetail 
        projects={projects}
        updateProject={updateProject}
      />
    </div>
  );
};

export default ProjectDetailPage;
