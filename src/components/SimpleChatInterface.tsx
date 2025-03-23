
import React, { useState } from "react";
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
import { FileText, Search, Plus, MessageSquare } from "lucide-react";
import { jsPDF } from "jspdf";

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
  sender: "user" | "agent";
  text: string;
}

const SimpleChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "agent", text: "Willkommen! Bitte erstellen Sie ein Projekt und geben Sie Ihre Anfrage ein." },
  ]);
  const [input, setInput] = useState("");
  const [projects, setProjects] = useState<string[]>([]); // Keine vorgewählten Projekte
  const [selectedProject, setSelectedProject] = useState("");
  const [projectNameInput, setProjectNameInput] = useState(""); // Eingabefeld für neuen Projektnamen
  const [projectMetrics, setProjectMetrics] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [metricKey, setMetricKey] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Funktion: Neues Projekt erstellen
  const handleCreateProject = () => {
    if (!projectNameInput.trim()) return;
    const newProject = projectNameInput.trim();
    // Optional: Prüfen, ob das Projekt bereits existiert
    if (!projects.includes(newProject)) {
      setProjects((prev) => [...prev, newProject]);
    }
    setSelectedProject(newProject);
    setProjectNameInput("");
  };

  // Funktion: Chat-Nachricht senden
  const handleSend = () => {
    if (!input.trim() || !selectedProject) return;
    const currentInput = input;
    const newMessage = { sender: "user" as const, text: `[${selectedProject}] ${currentInput}` };
    setMessages((prev) => [...prev, newMessage]);
    setHistory((prev) => [...prev, newMessage]);
    setInput("");

    // Generiere Agentenantwort im Hintergrund
    setTimeout(() => {
      const response = relevanceAgentSystem.getResponse(currentInput);
      const responseMessage = { sender: "agent" as const, text: response };
      setMessages((prev) => [...prev, responseMessage]);
      setHistory((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  // Funktion: Chat-Verlauf als PDF exportieren (ohne Logo)
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
      Object.entries(projectMetrics).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 10, y);
        y += 10;
      });
      
      messages.forEach((msg) => {
        doc.text(`${msg.sender === "user" ? "User:" : "Agent:"} ${msg.text}`, 10, y);
        y += 10;
      });
      
      doc.save(`Projekt_${selectedProject}_Chatverlauf.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Funktion: Verlaufssuche
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = history.filter((msg) =>
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  // Funktion: Kennzahl hinzufügen
  const handleAddMetric = () => {
    if (!metricKey.trim() || !metricValue.trim()) return;
    
    setProjectMetrics(prev => ({
      ...prev,
      [metricKey]: metricValue
    }));
    
    setMetricKey("");
    setMetricValue("");
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
      <Card className="p-4 glass-panel">
        <h2 className="text-xl font-medium mb-4">Projektmanagement</h2>
        
        <div className="space-y-4">
          {/* Projekt erstellen */}
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
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                Erstellen
              </Button>
            </div>
          </div>

          {/* Projekt auswählen */}
          {projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Projekt auswählen:</label>
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
            </div>
          )}

          {/* Kennzahlen */}
          <div>
            <h3 className="text-lg font-medium mb-2">Projektkennzahlen</h3>
            <div className="flex flex-col gap-2">
              <Input 
                placeholder="Kennzahlname" 
                value={metricKey}
                onChange={(e) => setMetricKey(e.target.value)}
                className="glass-input"
              />
              <Input 
                placeholder="Wert" 
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, handleAddMetric)}
                className="glass-input"
              />
              <Button 
                onClick={handleAddMetric}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Kennzahl speichern
              </Button>
            </div>
            
            {/* Display metrics */}
            {Object.keys(projectMetrics).length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Gespeicherte Kennzahlen:</h4>
                <div className="space-y-1">
                  {Object.entries(projectMetrics).map(([key, value], index) => (
                    <div key={index} className="text-sm flex justify-between py-1 px-2 rounded bg-secondary/20">
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

      {/* Search */}
      <Card className="p-4 glass-panel">
        <h3 className="text-lg font-medium mb-2">Verlaufssuche</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Suchbegriff eingeben..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleSearch)}
            className="glass-input"
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-md text-sm ${
                  result.sender === "user" 
                    ? "bg-primary/10 text-primary-foreground" 
                    : "bg-secondary/10 text-secondary-foreground"
                }`}
              >
                <span className="font-medium">{result.sender === "user" ? "User:" : "Agent:"}</span> {result.text}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Chat */}
      <Card className="flex-1 flex flex-col glass-panel overflow-hidden">
        <div className="p-4 pb-2 border-b">
          <h2 className="text-xl font-medium">
            {selectedProject ? `Chat: ${selectedProject}` : "Chat"}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/10 text-secondary-foreground"
                }`}
              >
                {msg.text}
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
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Senden
            </Button>
          </div>
          
          <div className="mt-2">
            <Button 
              onClick={handleExportPDF} 
              disabled={!selectedProject || messages.length <= 1 || isExporting}
              variant="outline"
              className="w-full"
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
