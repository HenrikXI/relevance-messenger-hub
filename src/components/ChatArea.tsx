
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  MessageSquare, 
  Mic, 
  MicOff,
  Plus
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jsPDF } from "jspdf";

// Hidden Relevance Agent System
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

const ChatArea: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "agent", text: "Willkommen! Bitte wählen Sie ein Projekt und geben Sie Ihre Anfrage ein." },
  ]);
  const [input, setInput] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projectMetrics, setProjectMetrics] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [metricKey, setMetricKey] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecordingPermission, setHasRecordingPermission] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check for microphone permission
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasRecordingPermission(true);
        // Stop the stream immediately after permission check
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("Microphone permission denied:", error);
        setHasRecordingPermission(false);
      }
    };
    
    checkMicPermission();
  }, []);

  // Handle sending messages
  const handleSend = () => {
    if (!input.trim() || !selectedProject) return;
    const currentInput = input;
    const newMessage = { sender: "user" as const, text: currentInput };
    setMessages((prev) => [...prev, newMessage]);
    setHistory((prev) => [...prev, newMessage]);
    setInput("");

    // Generate agent response
    setTimeout(() => {
      const response = relevanceAgentSystem.getResponse(currentInput);
      const responseMessage = { sender: "agent" as const, text: response };
      setMessages((prev) => [...prev, responseMessage]);
      setHistory((prev) => [...prev, responseMessage]);
    }, 1000);
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // In a real app, send this to a speech-to-text service
        // For demo purposes, we'll simulate received text
        console.log("Audio recording completed, size:", audioBlob.size);
        
        // Simulate STT conversion with a delay
        setTimeout(() => {
          const simulatedText = "Dies ist ein Sprachtest";
          setInput(simulatedText);
        }, 1000);

        // Release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle metrics
  const handleAddMetric = () => {
    if (!metricKey.trim() || !metricValue.trim()) return;
    
    setProjectMetrics(prev => ({
      ...prev,
      [metricKey]: metricValue
    }));
    
    setMetricKey("");
    setMetricValue("");
  };

  // Export to PDF
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

  // Handle search
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

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {selectedProject ? `Chat: ${selectedProject}` : "Chat"}
        </h2>
        
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Projekt wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Projekt 1">Projekt 1</SelectItem>
            <SelectItem value="Projekt 2">Projekt 2</SelectItem>
            <SelectItem value="Projekt 3">Projekt 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          {/* Messages area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
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
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input area */}
          <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedProject ? "Ihre Anfrage eingeben..." : "Bitte wählen Sie ein Projekt aus..."}
                disabled={!selectedProject}
                onKeyDown={(e) => handleKeyPress(e, handleSend)}
                className="glass-input flex-1"
              />
              <Button 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!hasRecordingPermission || !selectedProject}
                variant="outline"
                className={isRecording ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                size="icon"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={!selectedProject || !input.trim()}
                size="icon"
              >
                <MessageSquare className="h-4 w-4" />
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
        </div>
        
        {/* Metrics and search sidebar */}
        <div className="w-72 border-l p-4 flex flex-col h-full">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Projektkennzahlen</h3>
              <div className="space-y-2">
                <Input 
                  placeholder="Kennzahlname" 
                  value={metricKey}
                  onChange={(e) => setMetricKey(e.target.value)}
                  className="glass-input text-sm"
                />
                <Input 
                  placeholder="Wert" 
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleAddMetric)}
                  className="glass-input text-sm"
                />
                <Button 
                  onClick={handleAddMetric}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Speichern
                </Button>
                
                {/* Display metrics */}
                {Object.keys(projectMetrics).length > 0 && (
                  <Card className="p-2 mt-2">
                    <h4 className="text-xs font-medium mb-2">Gespeicherte Kennzahlen:</h4>
                    <div className="space-y-1">
                      {Object.entries(projectMetrics).map(([key, value], index) => (
                        <div key={index} className="text-xs flex justify-between py-1 px-2 rounded bg-secondary/20">
                          <span>{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Verlaufssuche</h3>
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  <Input
                    placeholder="Suchbegriff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, handleSearch)}
                    className="glass-input text-sm flex-1"
                  />
                  <Button onClick={handleSearch} variant="outline" size="icon" className="h-8 w-8">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <Card className="p-2 max-h-40 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded-md text-xs mb-1 ${
                          result.sender === "user" 
                            ? "bg-primary/10 text-primary-foreground" 
                            : "bg-secondary/10 text-secondary-foreground"
                        }`}
                      >
                        <span className="font-medium">{result.sender === "user" ? "User:" : "Agent:"}</span> {result.text}
                      </div>
                    ))}
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
