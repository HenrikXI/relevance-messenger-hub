import React, { useState, useEffect, useRef } from "react";
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
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Search, Plus, MessageSquare, Trash2, Copy, SendHorizonal, Paperclip, SmilePlus, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { ContextMenuActions } from "./ContextMenuActions";
import RenameDialog from "./RenameDialog";

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

interface SimpleChatInterfaceProps {
  selectedChatId?: string | null;
  onSelectChat?: (id: string) => void;
}

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({ selectedChatId, onSelectChat }) => {
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
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectNameInput, setProjectNameInput] = useState("");
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
  const [renameProjectDialog, setRenameProjectDialog] = useState(false);
  const [projectToRename, setProjectToRename] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userChats, setUserChats] = useState<any[]>([]);

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

    const savedUserChats = localStorage.getItem("userChats");
    if (savedUserChats) {
      try {
        setUserChats(JSON.parse(savedUserChats));
      } catch (error) {
        console.error("Fehler beim Laden der User Chats:", error);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    if (userChats.length > 0) {
      localStorage.setItem("userChats", JSON.stringify(userChats));
    }
  }, [projects, messages, projectMetrics, userChats]);

  const handleCreateProject = () => {
    if (!projectNameInput.trim()) return;
    const newProject = projectNameInput.trim();
    if (!projects.includes(newProject)) {
      setProjects((prev) => [...prev, newProject]);
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
    
    setProjects(updatedProjects);
    setProjectMetrics(updatedMetrics);
    setMessages(updatedMessages);
    setHistory(updatedHistory);
    setSelectedProject(projectToRename);
    
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    localStorage.setItem("projectMetrics", JSON.stringify(updatedMetrics));
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    
    toast.success(`Projekt umbenannt zu "${projectToRename}"`);
    setRenameProjectDialog(false);
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;

    setProjects(prev => prev.filter(project => project !== selectedProject));
    
    const newMetrics = { ...projectMetrics };
    delete newMetrics[selectedProject];
    setProjectMetrics(newMetrics);
    
    const filteredMessages = messages.filter(msg => msg.projectName !== selectedProject || msg.id === "welcome");
    setMessages(filteredMessages);
    setHistory(history.filter(msg => msg.projectName !== selectedProject));
    
    setSelectedProject("");
    setShowDeleteProjectDialog(false);
    
    localStorage.setItem("messages", JSON.stringify(filteredMessages));
    
    toast.success(`Projekt "${selectedProject}" wurde gelöscht`);
  };

  const confirmDeleteMessage = (messageId: string) => {
    setShowDeleteMessageDialog(messageId);
  };

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message)
      .then(() => toast.success("Nachricht kopiert"))
      .catch(() => toast.error("Fehler beim Kopieren"));
  };

  const handleDeleteMessage = () => {
    if (!showDeleteMessageDialog) return;
    
    const messageId = showDeleteMessageDialog;
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    const updatedHistory = history.filter(msg => msg.id !== messageId);
    
    setMessages(updatedMessages);
    setHistory(updatedHistory);
    
    if (searchResults.length > 0) {
      setSearchResults(searchResults.filter(msg => msg.id !== messageId));
    }
    
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    
    setShowDeleteMessageDialog(null);
    toast.success("Nachricht wurde gelöscht");
  };

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
    
    localStorage.setItem("messages", JSON.stringify(updatedMessages));

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
      
      localStorage.setItem("messages", JSON.stringify(withResponseMessages));
    }, 1000);
  };

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
        doc.text(`[${msg.timestamp.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit'
        })}] ${msg.sender === "user" ? "User:" : "Agent:"} ${msg.text}`, 10, y);
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

  const handleSearch = () => {
    if (!searchQuery.trim() && !searchByProject) {
      setSearchResults([]);
      return;
    }
    
    let results = [...history];
    
    if (searchByProject) {
      results = results.filter(msg => msg.projectName === searchByProject);
    }
    
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
    
    toast.success(`Kennzahl hinzugefügt: ${metricKey}`);
  };

  const resetSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
    setSearchByProject("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  useEffect(() => {
    if (selectedChatId) {
      const chat = userChats.find(c => c.id === selectedChatId);
      if (chat) {
        toast.info(`Chat mit ${chat.username} geöffnet`);
        console.log("Chat selected:", chat);
      }
    }
  }, [selectedChatId, userChats]);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 gap-6">
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
                    <TableHead>Aktionen</TableHead>
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
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleCopyMessage(result.text)}
                            title="Nachricht kopieren"
                            className="h-7 w-7"
                          >
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => confirmDeleteMessage(result.id)}
                            title="Nachricht löschen"
                            className="h-7 w-7"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Card>

      <Card className="flex-1 flex flex-col glass-panel shadow-md overflow-hidden">
        <div className="p-4 pb-2 border-b">
          <h2 className="text-xl font-medium">
            {selectedProject ? `Chat: ${selectedProject}` : "Chat"}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto chat-background">
          {messages
            .filter(msg => !selectedProject || msg.projectName === selectedProject || msg.id === "welcome")
            .length === 0 ? (
            <div className="h-full flex items-center justify-center p-8">
              <p className="text-muted-foreground text-center">
                Willkommen! Bitte erstellen Sie ein Projekt und geben Sie Ihre Anfrage ein.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {messages
                .filter(msg => !selectedProject || msg.projectName === selectedProject || msg.id === "welcome")
                .map((msg, index) => {
                  const isUser = msg.sender === "user";
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <ContextMenuActions
                        className={`max-w-[80%] ${isUser ? "ml-12" : "mr-12"}`}
                        isMessage={true}
                        onCopy={() => handleCopyMessage(msg.text)}
                        onDelete={() => msg.id !== "welcome" && confirmDeleteMessage(msg.id)}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            isUser
                              ? "bg-primary/95 text-primary-foreground rounded-tr-none"
                              : "bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 rounded-tl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                        </div>
                        <div 
                          className={`text-[11px] px-2 mt-1 text-muted-foreground flex ${
                            isUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString('de-DE', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </ContextMenuActions>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 bg-background/50 rounded-full px-3 py-1 border border-input/50">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-9 w-9 hover:bg-secondary/50"
              title="Emoji einfügen"
              disabled={!selectedProject}
            >
              <SmilePlus className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedProject ? "Nachricht schreiben..." : "Bitte wählen Sie ein Projekt aus..."}
              disabled={!selectedProject}
              onKeyDown={(e) => handleKeyPress(e, handleSend)}
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
            />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-9 w-9 hover:bg-secondary/50" 
              title="Datei anhängen"
              disabled={!selectedProject}
            >
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <Button 
              onClick={handleSend} 
              disabled={!selectedProject || !input.trim()}
              className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
              size="icon"
            >
              <SendHorizonal className="h-5 w-5" />
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
