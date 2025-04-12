
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProjectManagementProps {
  projects: string[];
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  projectMetrics: Record<string, Record<string, string>>;
  setProjectMetrics: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
  setMessages: (messages: any[]) => void;
  setHistory: (history: any[]) => void;
  messages: any[];
  history: any[];
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  selectedProject,
  setSelectedProject,
  projectMetrics,
  setProjectMetrics,
  setMessages,
  setHistory,
  messages,
  history
}) => {
  const [projectNameInput, setProjectNameInput] = useState("");
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [renameProjectDialog, setRenameProjectDialog] = useState(false);
  const [projectToRename, setProjectToRename] = useState("");
  const [metricKey, setMetricKey] = useState("");
  const [metricValue, setMetricValue] = useState("");

  const handleCreateProject = () => {
    if (!projectNameInput.trim()) return;
    const newProject = projectNameInput.trim();
    if (!projects.includes(newProject)) {
      const updatedProjects = [...projects, newProject];
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
      setProjectMetrics(prev => ({
        ...prev,
        [newProject]: {}
      }));
      toast.success(`Projekt "${newProject}" erstellt`);
    }
    setSelectedProject(newProject);
    setProjectNameInput("");
  };

  const handleRenameProject = () => {
    if (projectToRename === selectedProject) return;
    if (!projectToRename.trim()) return;
    
    const updatedProjects = projects.map(project => 
      project === selectedProject ? projectToRename : project
    );
    
    const updatedMetrics = { ...projectMetrics };
    if (updatedMetrics[selectedProject]) {
      updatedMetrics[projectToRename] = updatedMetrics[selectedProject];
      delete updatedMetrics[selectedProject];
    }
    
    const updatedMessages = messages.map(msg => ({
      ...msg,
      projectName: msg.projectName === selectedProject ? projectToRename : msg.projectName
    }));
    
    const updatedHistory = history.map(msg => ({
      ...msg,
      projectName: msg.projectName === selectedProject ? projectToRename : msg.projectName
    }));
    
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    localStorage.setItem("projectMetrics", JSON.stringify(updatedMetrics));
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    
    setProjectMetrics(updatedMetrics);
    setMessages(updatedMessages);
    setHistory(updatedHistory);
    setSelectedProject(projectToRename);
    
    toast.success(`Projekt umbenannt zu "${projectToRename}"`);
    setRenameProjectDialog(false);
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;

    const filteredProjects = projects.filter(project => project !== selectedProject);
    
    const newMetrics = { ...projectMetrics };
    delete newMetrics[selectedProject];
    
    const filteredMessages = messages.filter(msg => msg.projectName !== selectedProject || msg.id === "welcome");
    const filteredHistory = history.filter(msg => msg.projectName !== selectedProject);
    
    localStorage.setItem("projects", JSON.stringify(filteredProjects));
    localStorage.setItem("projectMetrics", JSON.stringify(newMetrics));
    localStorage.setItem("messages", JSON.stringify(filteredMessages));
    
    setProjectMetrics(newMetrics);
    setMessages(filteredMessages);
    setHistory(filteredHistory);
    setSelectedProject("");
    setShowDeleteProjectDialog(false);
    
    toast.success(`Projekt "${selectedProject}" wurde gelöscht`);
  };

  const handleAddMetric = () => {
    if (!metricKey.trim() || !metricValue.trim() || !selectedProject) return;
    
    const updatedMetrics = {
      ...projectMetrics,
      [selectedProject]: {
        ...projectMetrics[selectedProject],
        [metricKey]: metricValue
      }
    };
    
    localStorage.setItem("projectMetrics", JSON.stringify(updatedMetrics));
    setProjectMetrics(updatedMetrics);
    setMetricKey("");
    setMetricValue("");
    
    toast.success(`Kennzahl hinzugefügt: ${metricKey}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <Card className="p-4 glass-panel shadow-md">
      <h2 className="text-xl font-medium mb-4">Projektmanagement</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Neues Projekt erstellen:</label>
          <div className="flex gap-2">
            <Input
              placeholder="Projektname"
              value={projectNameInput}
              onChange={(e) => setProjectNameInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleCreateProject)}
              className="glass-input"
            />
            <Button 
              onClick={handleCreateProject}
              className="button-accent-purple shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Erstellen
            </Button>
          </div>
        </div>

        {projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Projekt auswählen:</label>
            <div className="flex gap-2">
              <Select 
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Projekt auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project, index) => (
                    <SelectItem key={index} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedProject && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setProjectToRename(selectedProject);
                      setRenameProjectDialog(true);
                    }}
                    title="Projekt umbenennen"
                    className="shadow-sm"
                  >
                    Umbenennen
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => setShowDeleteProjectDialog(true)}
                    title="Projekt löschen"
                    className="shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <Dialog open={renameProjectDialog} onOpenChange={setRenameProjectDialog}>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Projekt umbenennen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input
                placeholder="Neuer Projektname"
                value={projectToRename}
                onChange={(e) => setProjectToRename(e.target.value)}
                className="glass-input"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameProjectDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleRenameProject}>
                Umbenennen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Projekt löschen</DialogTitle>
            </DialogHeader>
            <p>
              Möchten Sie das Projekt "{selectedProject}" wirklich löschen? 
              Alle zugehörigen Nachrichten und Kennzahlen werden ebenfalls gelöscht.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteProjectDialog(false)}>
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDeleteProject}>
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div>
          <h3 className="text-lg font-medium mb-2">Projektkennzahlen</h3>
          <div className="flex flex-col gap-2">
            <Input 
              placeholder="Kennzahlname" 
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              className="glass-input"
              disabled={!selectedProject}
            />
            <Input 
              placeholder="Wert" 
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleAddMetric)}
              className="glass-input"
              disabled={!selectedProject}
            />
            <Button 
              onClick={handleAddMetric}
              className="button-accent-teal shadow-sm"
              disabled={!selectedProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              Kennzahl speichern
            </Button>
          </div>
          
          {selectedProject && projectMetrics[selectedProject] && Object.keys(projectMetrics[selectedProject]).length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Gespeicherte Kennzahlen:</h4>
              <div className="space-y-1">
                {Object.entries(projectMetrics[selectedProject]).map(([key, value], index) => (
                  <div key={index} className="text-sm flex justify-between py-2 px-3 rounded bg-secondary/30 border border-secondary/50">
                    <span>{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProjectManagement;

