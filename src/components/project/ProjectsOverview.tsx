
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { Calendar, CheckCircle2, Clock, MessageSquare } from "lucide-react";

interface ProjectsOverviewProps {
  projects: Project[];
}

const getStatusColor = (status: Project["status"]) => {
  switch (status) {
    case "planning":
      return "bg-blue-500";
    case "in-progress":
      return "bg-orange-500";
    case "completed":
      return "bg-green-500";
    case "on-hold":
      return "bg-gray-500";
    default:
      return "bg-blue-500";
  }
};

const getStatusLabel = (status: Project["status"]) => {
  switch (status) {
    case "planning":
      return "Planung";
    case "in-progress":
      return "In Bearbeitung";
    case "completed":
      return "Abgeschlossen";
    case "on-hold":
      return "Pausiert";
    default:
      return status;
  }
};

const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({ projects }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meine Projekte</h1>
        <Button onClick={() => {}}>Neues Projekt</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const completedTasks = project.tasks.filter(task => task.completed).length;
          const totalTasks = project.tasks.length;
          
          return (
            <Card 
              key={project.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || "Keine Beschreibung vorhanden"}
                </p>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(project.deadline).toLocaleDateString("de-DE")}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>{completedTasks}/{totalTasks} Aufgaben</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{project.comments.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsOverview;
