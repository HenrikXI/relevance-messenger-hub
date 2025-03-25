
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Search, Plus, MessageSquare, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

// Hidden Relevance Agent System: Interne Daten & Logik sind gekapselt
const relevanceAgentSystem = (() => {
  const internalData: Record<string, string> = {
    "hallo": "Hallo, wie kann ich Ihnen helfen?",
    "test": "Dies ist eine Testantwort.",
  };

  function getResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    if (internalData[lowerMessage]) {
      return internalData[lowerMessage];
    } else if (lowerMessage.includes("qualität")) {
      return "Möchten Sie Ihre Anfrage an den Qualitätswächter weiterleiten?";
    } else if (lowerMessage.includes("prozess")) {
      return "Soll ich den Lean Master einbinden?";
    } else {
      return "Ich habe Ihre Anfrage aufgenommen. Möchten Sie weitere Details hinzufügen oder wichtige Aspekte markieren?";
    }
  }

  return { getResponse };
})();

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
  projectName: string;
}

const SimpleChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome",
      sender: "agent", 
      text: "Willkommen! Bitte erstellen Sie ein Projekt und geben Sie Ihre Anfrage ein.",
      timestamp: new Date(),
      projectName: ""
    },
  ]);
  const [input, setInput] = useState("");
  const [projects, setProjects] = useState<string[]>([]); // Keine vorgewählten Projekte
  const [selectedProject, setSelectedProject] = useState("");
  const [projectNameInput, setProjectNameInput] = useState(""); // Eingabefeld für neuen Projektnamen
  const [projectMetrics, setProjectMetrics] = useState<Record<string, Record<string, string>>>({});
  const [history, setHistory] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [metricKey, setMetricKey] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [searchByProject, setSearchByProject] = useState("");
  const [showDeleteMessageDialog, setShowDeleteMessageDialog] = useState<string | null>(null);

  // Laden der Daten aus localStorage beim Start
  useEffect(() => {
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error("Fehler beim Laden der Projekte:", error);
      }
    }

    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Konvertieren der String-Timestamps zurück in Date-Objekte
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        setHistory(messagesWithDates);
      } catch (error) {
        console.error("Fehler beim Laden der Nachrichten:", error);
      }
    }

    const savedMetrics = localStorage.getItem("projectMetrics");
    if (savedMetrics) {
      try {
        setProjectMetrics(JSON.parse(savedMetrics));
      } catch (error) {
        console.error("Fehler beim Laden der Kennzahlen:", error);
      }
    }
  }, []);

  // Speichern der Daten in localStorage bei Änderungen
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("projects", JSON.stringify(projects));
    }
    
    if (messages.length > 0) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
    
    if (Object.keys(projectMetrics).length > 0) {
      localStorage.setItem("projectMetrics", JSON.stringify(projectMetrics));
    }
  }, [projects, messages, projectMetrics]);

  // Funktion: Neues Projekt erstellen
  const handleCreateProject = () => {
    if (!projectNameInput.trim()) return;
    const newProject = projectNameInput.trim();
    // Optional: Prüfen, ob das Projekt bereits existiert
    if (!projects.includes(newProject)) {
      setProjects((prev) => [...prev, newProject]);
      // Initialisieren der Kennzahlen für das neue Projekt
      setProjectMetrics(prev => ({
        ...prev,
        [newProject]: {}
      }));
      toast.success(`Projekt "${newProject}" erstellt`);
    }
    setSelectedProject(newProject);
    setProjectNameInput("");
  };

  // Funktion: Projekt löschen
  const handleDeleteProject = () => {
    if (!selectedProject) return;

    // Aktualisiere die Projekte-Liste
    setProjects(prev => prev.filter(project => project !== selectedProject));
    
    // Lösche zugehörige Kennzahlen
    const newMetrics = { ...projectMetrics };
    delete newMetrics[selectedProject];
    setProjectMetrics(newMetrics);
    
    // Lösche zugehörige Nachrichten
    const filteredMessages = messages.filter(msg => msg.projectName !== selectedProject || msg.id === "welcome");
    setMessages(filteredMessages);
    setHistory(history.filter(msg => msg.projectName !== selectedProject));
    
    // Reset Auswahl und Dialog
    setSelectedProject("");
    setShowDeleteProjectDialog(false);
    
    // Update localStorage after deletion
    localStorage.setItem("messages", JSON.stringify(filteredMessages));
    
    toast.success(`Projekt "${selectedProject}" wurde gelöscht`);
  };

  // Funktion: Nachricht löschen mit Dialog
  const confirmDeleteMessage = (messageId: string) => {
    setShowDeleteMessageDialog(messageId);
  };

  // Funktion: Nachricht löschen durchführen
  const handleDeleteMessage = () => {
    if (!showDeleteMessageDialog) return;
    
    const messageId = showDeleteMessageDialog;
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    const updatedHistory = history.filter(msg => msg.id !== messageId);
    
    setMessages(updatedMessages);
    setHistory(updatedHistory);
    
    // Update searchResults if we're currently showing search results
    if (searchResults.length > 0) {
      setSearchResults(searchResults.filter(msg => msg.id !== messageId));
    }
    
    // Update localStorage after deletion
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    
    setShowDeleteMessageDialog(null);
    toast.success("Nachricht wurde gelöscht");
  };

  // Funktion: Chat-Nachricht senden
  const handleSend = () => {
    if (!input.trim() || !selectedProject) return;
    const currentInput = input;
    
    const newMessage = { 
      id: `user_${Date.now()}`,
      sender: "user" as const, 
      text: currentInput,
      timestamp: new Date(),
      projectName: selectedProject
    };
    
    const updatedMessages = [...messages, newMessage];
    const updatedHistory = [...history, newMessage];
    
    setMessages(updatedMessages);
    setHistory(updatedHistory);
    setInput("");
    
    // Save to localStorage
    localStorage.setItem("messages", JSON.stringify(updatedMessages));

    // Generiere Agentenantwort im Hintergrund
    setTimeout(() => {
      const response = relevanceAgentSystem.getResponse(currentInput);
      const responseMessage = { 
        id: `agent_${Date.now()}`,
        sender: "agent" as const, 
        text: response,
        timestamp: new Date(),
        projectName: selectedProject
      };
      
      const withResponseMessages = [...updatedMessages, responseMessage];
      const withResponseHistory = [...updatedHistory, responseMessage];
      
      setMessages(withResponseMessages);
      setHistory(withResponseHistory);
      
      // Save to localStorage including the agent response
      localStorage.setItem("messages", JSON.stringify(withResponseMessages));
    }, 1000);
  };

  // Funktion: Chat-Verlauf als PDF exportieren
  const handleExportPDF = () => {
    if (!selectedProject) return;
    
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Projekt: ${selectedProject}`, 10, 10);
      doc.setFontSize(12);
      
      let y = 30;
      doc.text("Projektkennzahlen:", 10, y);
      y += 10;
      
      const projectData = projectMetrics[selectedProject] || {};
      Object.entries(projectData).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 10, y);
        y += 10;
      });
      
      const projectMessages = messages.filter(m => m.projectName === selectedProject);
      projectMessages.forEach((msg) => {
        // Formatierte Zeit hinzufügen
        const timeStr = msg.timestamp.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        doc.text(`[${timeStr}] ${msg.sender === "user" ? "User:" : "Agent:"} ${msg.text}`, 10, y);
        y += 10;
      });
      
      doc.save(`Projekt_${selectedProject}_Chatverlauf.pdf`);
      toast.success("PDF erfolgreich exportiert");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Fehler beim Exportieren der PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Funktion: Verlaufssuche
  const handleSearch = () => {
    if (!searchQuery.trim() && !searchByProject) {
      setSearchResults([]);
      return;
    }
    
    let results = [...history];
    
    // Nach Projekt filtern, wenn ausgewählt
    if (searchByProject) {
      results = results.filter(msg => msg.projectName === searchByProject);
    }
    
    // Nach Suchbegriff filtern
    if (searchQuery.trim()) {
      results = results.filter(msg =>
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setSearchResults(results);
    
    if (results.length === 0) {
      toast.info("Keine Ergebnisse gefunden");
    } else {
      toast.success(`${results.length} Ergebnis(se) gefunden`);
    }
  };

  // Funktion: Kennzahl hinzufügen
  const handleAddMetric = () => {
    if (!metricKey.trim() || !metricValue.trim() || !selectedProject) return;
    
    setProjectMetrics(prev => ({
      ...prev,
      [selectedProject]: {
        ...prev[selectedProject],
        [metricKey]: metricValue
      }
    }));
    
    setMetricKey("");
    setMetricValue("");
  };

  // Funktion: Suche zurücksetzen
  const resetSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
    setSearchByProject("");
  };

  // Handle key press for inputs
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 gap-6">
      <Card className="p-4 glass-panel shadow-md">
        <h2 className="text-xl font-medium mb-4">Projektmanagement</h2>
        
        <div className="space-y-4">
          {/* Projekt erstellen - mit hervorgehobenem Button */}
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

          {/* Projekt auswählen */}
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
                  <Button 
                    variant="destructive"
                    onClick={() => setShowDeleteProjectDialog(true)}
                    title="Projekt löschen"
                    className="shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Projekt löschen Dialog */}
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

          {/* Nachricht löschen Dialog */}
          <Dialog open={!!showDeleteMessageDialog} onOpenChange={(open) => !open && setShowDeleteMessageDialog(null)}>
            <DialogContent className="glass-panel">
              <DialogHeader>
                <DialogTitle>Nachricht löschen</DialogTitle>
              </DialogHeader>
              <p>
                Möchten Sie diese Nachricht wirklich löschen?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteMessageDialog(null)}>
                  Abbrechen
                </Button>
                <Button variant="destructive" onClick={handleDeleteMessage}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Kennzahlen - mit hervorgehobenem Button */}
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
            
            {/* Display metrics with subtle background */}
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

      {/* Search - mit besseren visuellen Kontrasten */}
      <Card className="p-4 glass-panel shadow-md">
        <h3 className="text-lg font-medium mb-2">Verlaufssuche</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <Button
              variant="ghost" 
              onClick={() => setAdvancedSearch(!advancedSearch)}
              className="text-xs"
            >
              {advancedSearch ? "Einfache Suche" : "Erweiterte Suche"}
            </Button>
            
            {searchResults.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetSearch}
                className="text-xs"
              >
                Suche zurücksetzen
              </Button>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {advancedSearch && (
              <Select
                value={searchByProject}
                onValueChange={setSearchByProject}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Nach Projekt filtern (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Projekte</SelectItem>
                  {projects.map((project, index) => (
                    <SelectItem key={index} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="Suchbegriff eingeben..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, handleSearch)}
                className="glass-input"
              />
              <Button 
                onClick={handleSearch} 
                className="button-accent-blue shadow-sm"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">{searchResults.length} Ergebnis(se)</h4>
            <div className="overflow-auto max-h-60 border rounded-md bg-white/50 dark:bg-black/20">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/20">
                    <TableHead>Projekt</TableHead>
                    <TableHead>Absender</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Zeit</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result) => (
                    <TableRow key={result.id} className="hover:bg-secondary/10">
                      <TableCell className="font-medium">
                        {result.projectName || "System"}
                      </TableCell>
                      <TableCell>
                        {result.sender === "user" ? "Sie" : "Agent"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {result.text}
                      </TableCell>
                      <TableCell>
                        {result.timestamp.toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => confirmDeleteMessage(result.id)}
                          title="Nachricht löschen"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Card>

      {/* Chat - mit subtiler Hintergrundfarbe */}
      <Card className="flex-1 flex flex-col glass-panel shadow-md overflow-hidden">
        <div className="p-4 pb-2 border-b">
          <h2 className="text-xl font-medium">
            {selectedProject ? `Chat: ${selectedProject}` : "Chat"}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-background">
          {messages
            .filter(msg => !selectedProject || msg.projectName === selectedProject || msg.id === "welcome")
            .map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="group relative">
                  <div
                    className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border-[0.5px] border-border/50 text-card-foreground"
                    }`}
                  >
                    {msg.text}
                    <div className="text-xs opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {msg.id !== "welcome" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 -m-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                      onClick={() => confirmDeleteMessage(msg.id)}
                      title="Nachricht löschen"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedProject ? "Ihre Anfrage eingeben..." : "Bitte wählen Sie ein Projekt aus..."}
              disabled={!selectedProject}
              onKeyDown={(e) => handleKeyPress(e, handleSend)}
              className="glass-input"
            />
            <Button 
              onClick={handleSend} 
              disabled={!selectedProject || !input.trim()}
              className="button-accent-blue shadow-sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Senden
            </Button>
          </div>
          
          <div className="mt-2">
            <Button 
              onClick={handleExportPDF} 
              disabled={!selectedProject || messages.filter(m => m.projectName === selectedProject).length === 0 || isExporting}
              variant="outline"
              className="w-full border-primary/30 hover:bg-primary/5"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExporting ? "Exportiere..." : "Als PDF exportieren"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SimpleChatInterface;
