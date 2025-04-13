
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Project, Task, Comment } from "@/types/project";
import { Calendar, CheckCircle2, Clock, MessageSquare, ArrowLeft, Plus } from "lucide-react";
import AgentPanel from "./AgentPanel";
import { toast } from "sonner";

interface ProjectDetailProps {
  projects: Project[];
  updateProject: (updatedProject: Project) => void;
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

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projects, updateProject }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const project = projects.find(p => p.id === projectId);
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold">Projekt nicht gefunden</h1>
        <Button onClick={() => navigate("/projects")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }
  
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = project.tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    updateProject({ ...project, tasks: updatedTasks });
  };
  
  const handleAddTask = (title: string) => {
    if (!title.trim()) return;
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    updateProject({
      ...project,
      tasks: [...project.tasks, newTask]
    });
    
    // If called from form input, clear the input
    setNewTaskTitle("");
  };
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      text: newComment.trim(),
      author: "Aktiver Benutzer", // In a real app, this would be the current user
      createdAt: new Date()
    };
    
    updateProject({
      ...project,
      comments: [...project.comments, comment]
    });
    
    setNewComment("");
    toast.success("Kommentar hinzugefügt");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Alle Projekte
        </Button>
        <Badge className={getStatusColor(project.status)}>
          {getStatusLabel(project.status)}
        </Badge>
      </div>
      
      <h1 className="text-3xl font-bold">{project.name}</h1>
      
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Deadline: {new Date(project.deadline).toLocaleDateString("de-DE")}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <span>
            {project.tasks.filter(t => t.completed).length}/{project.tasks.length} Aufgaben abgeschlossen
          </span>
        </div>
      </div>
      
      {project.description && (
        <Card>
          <CardContent className="pt-6">
            <p>{project.description}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Aufgaben</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.tasks.length > 0 ? (
                <div className="space-y-2">
                  {project.tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-2 p-2 rounded hover:bg-secondary/20">
                      <Checkbox 
                        id={task.id} 
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                      />
                      <label 
                        htmlFor={task.id}
                        className={`flex-1 cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {task.title}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Keine Aufgaben vorhanden</p>
              )}
              
              <Separator />
              
              <div className="flex gap-2">
                <Input
                  placeholder="Neue Aufgabe..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask(newTaskTitle);
                    }
                  }}
                />
                <Button onClick={() => handleAddTask(newTaskTitle)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Kommentare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.comments.length > 0 ? (
                <div className="space-y-4">
                  {project.comments.map(comment => (
                    <div key={comment.id} className="bg-secondary/20 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-muted-foreground">
                          {comment.createdAt.toLocaleDateString("de-DE")}
                        </span>
                      </div>
                      <p className="mt-2">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Keine Kommentare vorhanden</p>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Neuer Kommentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={handleAddComment}>Kommentar hinzufügen</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Agent Panel */}
        <div>
          <AgentPanel 
            project={project} 
            onAddTask={handleAddTask}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
