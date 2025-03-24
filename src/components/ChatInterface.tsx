import React, { useState, useEffect, useCallback } from "react";
import { Message, Project, Metric, SearchResult } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, SendHorizonal } from "lucide-react";
import { relevanceAgent } from "../utils/relevanceAgent";
import { exportToPDF } from "../utils/pdfExport";
import ProjectSelector from "./ProjectSelector";
import MessageList from "./MessageList";
import MetricsInput from "./MetricsInput";
import SearchBar from "./SearchBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Sample projects data - would normally come from a database
const SAMPLE_PROJECTS: Project[] = [
  { id: '1', name: 'Prozessoptimierung HR' },
  { id: '2', name: 'Qualitätsmanagement Produktion' },
  { id: '3', name: 'IT-Infrastruktur Update' },
  { id: '4', name: 'Marketing Kampagne Q4' },
];

const ChatInterface: React.FC = () => {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const { toast } = useToast();

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessageHistory(parsedHistory);
      } catch (error) {
        console.error("Failed to parse chat history:", error);
        localStorage.removeItem("chatHistory");
      }
    }

    const savedMetrics = localStorage.getItem("projectMetrics");
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics));
      } catch (error) {
        console.error("Failed to parse project metrics:", error);
        localStorage.removeItem("projectMetrics");
      }
    }
  }, []);

  // Save chat history to localStorage when it changes
  useEffect(() => {
    if (messageHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messageHistory));
    }
  }, [messageHistory]);

  // Save metrics to localStorage when they change
  useEffect(() => {
    if (metrics.length > 0) {
      localStorage.setItem("projectMetrics", JSON.stringify(metrics));
    }
  }, [metrics]);

  // Filter messages when project changes
  useEffect(() => {
    if (selectedProject) {
      const filteredMessages = messageHistory.filter(
        (msg) => msg.projectName === selectedProject.name
      );
      setMessages(filteredMessages);
    } else {
      setMessages([]);
    }
  }, [selectedProject, messageHistory]);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputMessage.trim() || !selectedProject) return;

    setIsSending(true);

    try {
      // Create new user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage.trim(),
        sender: "user",
        timestamp: new Date(),
        projectName: selectedProject.name,
      };

      // Update messages and history state with the new user message
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessageHistory((prevHistory) => [...prevHistory, userMessage]);
      
      // Clear input field
      setInputMessage("");

      // Simulate delay before agent response (feels more natural)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate agent response
      const responseText = relevanceAgent.getResponse(userMessage.text);
      
      // Create agent message
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "agent",
        timestamp: new Date(),
        projectName: selectedProject.name,
      };

      // Update messages and history state with the agent response
      setMessages((prevMessages) => [...prevMessages, agentMessage]);
      setMessageHistory((prevHistory) => [...prevHistory, agentMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, selectedProject, toast]);

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle project selection
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    
    // Filter metrics for this project
    const projectMetrics = metrics.filter(m => m.projectId === project.id);
    
    if (projectMetrics.length === 0) {
      toast({
        title: "Projekt ausgewählt",
        description: `${project.name} wurde ausgewählt. Sie können nun Kennzahlen hinzufügen.`,
      });
    }
  };

  // Handle adding a new metric
  const handleAddMetric = (metric: Metric) => {
    setMetrics((prevMetrics) => [...prevMetrics, metric]);
    toast({
      title: "Kennzahl hinzugefügt",
      description: `${metric.key}: ${metric.value}`,
    });
  };

  // Handle removing a metric
  const handleRemoveMetric = (metricId: string) => {
    setMetrics((prevMetrics) => prevMetrics.filter((m) => m.id !== metricId));
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!selectedProject) {
      toast({
        title: "Export nicht möglich",
        description: "Bitte wählen Sie zuerst ein Projekt aus.",
        variant: "destructive",
      });
      return;
    }

    if (messages.length === 0) {
      toast({
        title: "Export nicht möglich",
        description: "Es gibt keine Nachrichten zum Exportieren.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Get project-specific metrics
      const projectMetrics = metrics.filter(
        (m) => m.projectId === selectedProject.id
      );

      // Export to PDF
      await exportToPDF({
        projectName: selectedProject.name,
        metrics: projectMetrics,
        messages,
      });

      toast({
        title: "Export erfolgreich",
        description: "Die PDF-Datei wurde erfolgreich erstellt.",
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Die PDF-Datei konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = messageHistory
      .filter((msg) => msg.text.toLowerCase().includes(term))
      .map((msg) => ({
        messageId: msg.id,
        messageText: msg.text,
        projectName: msg.projectName || "",
        timestamp: msg.timestamp,
        sender: msg.sender,
      }));

    setSearchResults(results);

    if (results.length === 0) {
      toast({
        title: "Keine Ergebnisse",
        description: `Keine Nachrichten mit "${searchTerm}" gefunden.`,
      });
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchResults([]);
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 glass-panel shadow-md">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-medium">Projekt</h2>
          </CardHeader>
          <CardContent>
            <ProjectSelector
              projects={SAMPLE_PROJECTS}
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
            />
          </CardContent>
        </Card>

        <Card className="flex-1 glass-panel shadow-md">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-medium">Suche</h2>
          </CardHeader>
          <CardContent>
            <SearchBar
              onSearch={handleSearch}
              searchResults={searchResults}
              clearSearch={clearSearch}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        <Card className="md:w-1/3 glass-panel shadow-md">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-medium">Kennzahlen</h2>
          </CardHeader>
          <CardContent>
            <MetricsInput
              metrics={metrics.filter(
                (m) => selectedProject && m.projectId === selectedProject.id
              )}
              projectId={selectedProject?.id || ""}
              onAddMetric={handleAddMetric}
              onRemoveMetric={handleRemoveMetric}
            />

            <Separator className="my-6" />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Aktionen</h3>
              <Button
                onClick={handleExportPDF}
                disabled={!selectedProject || messages.length === 0 || isExporting}
                className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary shadow-sm"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isExporting ? "Exportiere..." : "Als PDF exportieren"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col glass-panel shadow-md">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-medium">
              {selectedProject
                ? `Chat: ${selectedProject.name}`
                : "Chat"}
            </h2>
          </CardHeader>
          <CardContent className="flex-1 pb-0 flex flex-col">
            <div className="flex-1 mb-4 min-h-0 border rounded-md chat-background">
              <MessageList messages={messages} />
            </div>

            <div className="py-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    selectedProject
                      ? "Nachricht eingeben..."
                      : "Wählen Sie zuerst ein Projekt aus..."
                  }
                  disabled={!selectedProject || isSending}
                  className="glass-input"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || !selectedProject || isSending}
                  size="icon"
                  className="button-accent-blue shadow-sm shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizonal className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
