
import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import MetricsInput from "./MetricsInput";
import { Metric } from "../types";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
}

const ChatArea: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Willkommen beim Relevance Messenger Hub. Wie kann ich Ihnen helfen?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>("project-1"); // This would come from context or props
  const [showMetrics, setShowMetrics] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'de-DE'; // Set language to German
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInputValue(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        toast.error('Fehler bei der Spracherkennung: ' + event.error);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        text: "Ich habe Ihre Anfrage erhalten und werde sie verarbeiten.",
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);

      // Scroll to the bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 1000);
  };

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Spracherkennung wird von Ihrem Browser nicht unterstützt.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        toast.success('Spracherkennung aktiviert. Sprechen Sie bitte.');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Fehler beim Starten der Spracherkennung.');
      }
    }
    setIsRecording(!isRecording);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddMetric = (metric: Metric) => {
    setMetrics(prev => [...prev, metric]);
  };

  const handleRemoveMetric = (metricId: string) => {
    setMetrics(prev => prev.filter(metric => metric.id !== metricId));
  };

  const handleExportPDF = () => {
    console.log("Exporting chat as PDF...");
    // Implement PDF export logic here
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Metrics panel (optional) */}
      {metrics.length > 0 ? (
        <div className="mb-2">
          <MetricsInput 
            metrics={metrics} 
            projectId={currentProjectId} 
            onAddMetric={handleAddMetric} 
            onRemoveMetric={handleRemoveMetric} 
          />
        </div>
      ) : (
        <Collapsible open={showMetrics} onOpenChange={setShowMetrics}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="mb-2">
              {showMetrics ? "Kennzahlen ausblenden" : "Kennzahlen hinzufügen"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mb-2">
              <MetricsInput 
                metrics={metrics} 
                projectId={currentProjectId} 
                onAddMetric={handleAddMetric} 
                onRemoveMetric={handleRemoveMetric} 
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Chat display */}
      <Card className="flex-1 overflow-hidden border rounded-lg">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* Input area */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          onClick={handleToggleRecording}
          className="flex-shrink-0"
          title={isRecording ? "Spracherkennung stoppen" : "Spracherkennung starten"}
        >
          {isRecording ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Nachricht eingeben..."
          className="flex-1"
        />
        
        <Button 
          size="icon" 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim()} 
          className="flex-shrink-0"
          title="Nachricht senden"
        >
          <Send className="h-5 w-5" />
        </Button>
        
        <Button 
          size="icon" 
          variant="outline" 
          onClick={handleExportPDF} 
          className="flex-shrink-0"
          title="Als PDF exportieren"
        >
          <FileText className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatArea;
