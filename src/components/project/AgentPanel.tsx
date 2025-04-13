
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AgentResponse, Project, Task } from "@/types/project";
import { triggerAgent } from "@/services/agentService";
import { PlusCircle, AlertTriangle, ListChecks, FileText, SendHorizonal, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AgentPanelProps {
  project: Project;
  onAddTask?: (taskTitle: string) => void;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ project, onAddTask }) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);

  // Format tasks for agent request
  const getTaskTitles = () => {
    return project.tasks.map(task => task.title);
  };

  const handleSendRequest = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const agentResponse = await triggerAgent(
        project.id,
        project.name,
        getTaskTitles(),
        project.deadline,
        input,
        "user-1" // In a real app, this would be the actual user ID
      );
      
      setResponse(agentResponse);
      toast.success("Antwort vom Agenten erhalten");
    } catch (error) {
      console.error("Error sending request to agent:", error);
      toast.error("Fehler bei der Kommunikation mit dem Agenten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = (taskTitle: string) => {
    if (onAddTask) {
      onAddTask(taskTitle);
      toast.success(`Aufgabe "${taskTitle}" erstellt`);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse"></div>
          </div>
          Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Textarea 
            placeholder="Agent fragen..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <Button 
            onClick={handleSendRequest} 
            className="self-end"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
            <span className="ml-2">Anfrage senden</span>
          </Button>
        </div>

        {response && (
          <div className="bg-secondary/30 rounded-lg p-4 animate-fade-in">
            <div className="prose dark:prose-invert text-sm">
              <p>{response.text}</p>
            </div>
            
            {response.suggestions && response.suggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Vorschläge:</h4>
                <div className="flex flex-wrap gap-2">
                  {response.suggestions.map((suggestion, index) => {
                    let icon;
                    switch (suggestion.type) {
                      case "task":
                        icon = <ListChecks className="h-4 w-4" />;
                        break;
                      case "risk":
                        icon = <AlertTriangle className="h-4 w-4" />;
                        break;
                      case "summary":
                        icon = <FileText className="h-4 w-4" />;
                        break;
                    }

                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => {
                          if (suggestion.type === "task") {
                            handleCreateTask(suggestion.content);
                          }
                        }}
                      >
                        {icon}
                        <span>{suggestion.content}</span>
                        {suggestion.type === "task" && (
                          <PlusCircle className="h-3 w-3 ml-1" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentPanel;
