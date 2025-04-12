
import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, SendHorizonal, Paperclip, SmilePlus } from "lucide-react";
import { ContextMenuActions } from "../ContextMenuActions";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
  projectName: string;
}

interface ChatMessagesProps {
  messages: Message[];
  selectedProject: string;
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  onCopyMessage: (text: string) => void;
  onDeleteMessage: (id: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  selectedProject,
  input,
  setInput,
  handleSend,
  onCopyMessage,
  onDeleteMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
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

  const filteredMessages = messages.filter(
    msg => !selectedProject || msg.projectName === selectedProject || msg.id === "welcome"
  );

  return (
    <Card className="flex-1 flex flex-col glass-panel shadow-md overflow-hidden">
      <div className="p-4 pb-2 border-b">
        <h2 className="text-xl font-medium">
          {selectedProject ? `Chat: ${selectedProject}` : "Chat"}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto chat-background">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              Willkommen! Bitte erstellen Sie ein Projekt und geben Sie Ihre Anfrage ein.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {filteredMessages.map((msg) => {
              const isUser = msg.sender === "user";
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <ContextMenuActions
                    className={`max-w-[80%] ${isUser ? "ml-12" : "mr-12"}`}
                    isMessage={true}
                    onCopy={() => onCopyMessage(msg.text)}
                    onDelete={() => msg.id !== "welcome" && onDeleteMessage(msg.id)}
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
            onKeyDown={handleKeyPress}
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
  );
};

export default ChatMessages;
