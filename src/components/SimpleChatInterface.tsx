
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import ProjectManagement from "./chat/ProjectManagement";
import SearchHistory from "./chat/SearchHistory";
import ChatMessages from "./chat/ChatMessages";
import DeleteMessageDialog from "./chat/DeleteMessageDialog";
import { Message } from "../types";

// Agent for generating responses
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

interface SimpleChatInterfaceProps {
  selectedChatId?: string | null;
  onSelectChat?: (id: string) => void;
}

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({ selectedChatId, onSelectChat }) => {
  // State management
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
  const [projectMetrics, setProjectMetrics] = useState<Record<string, Record<string, string>>>({});
  const [history, setHistory] = useState<Message[]>([]);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [showDeleteMessageDialog, setShowDeleteMessageDialog] = useState<string | null>(null);

  // Load data from localStorage on component mount
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

  // Save data to localStorage when it changes
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

  // Handle selected chat
  useEffect(() => {
    if (selectedChatId) {
      const chat = userChats.find(c => c.id === selectedChatId);
      if (chat) {
        toast.info(`Chat mit ${chat.username} geöffnet`);
        console.log("Chat selected:", chat);
      }
    }
  }, [selectedChatId, userChats]);

  // Message handlers
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

  // Copy message handler
  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message)
      .then(() => toast.success("Nachricht kopiert"))
      .catch(() => toast.error("Fehler beim Kopieren"));
  };

  // Delete message handlers
  const confirmDeleteMessage = (messageId: string) => {
    setShowDeleteMessageDialog(messageId);
  };

  const handleDeleteMessage = () => {
    if (!showDeleteMessageDialog) return;
    
    const messageId = showDeleteMessageDialog;
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    const updatedHistory = history.filter(msg => msg.id !== messageId);
    
    setMessages(updatedMessages);
    setHistory(updatedHistory);
    
    localStorage.setItem("messages", JSON.stringify(updatedMessages));
    
    setShowDeleteMessageDialog(null);
    toast.success("Nachricht wurde gelöscht");
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 gap-6">
      <ProjectManagement 
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projectMetrics={projectMetrics}
        setProjectMetrics={setProjectMetrics}
        messages={messages}
        setMessages={setMessages}
        history={history}
        setHistory={setHistory}
      />

      <SearchHistory 
        projects={projects}
        history={history}
        onDeleteMessage={confirmDeleteMessage}
      />

      <ChatMessages 
        messages={messages}
        selectedProject={selectedProject}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        onCopyMessage={handleCopyMessage}
        onDeleteMessage={confirmDeleteMessage}
      />

      <DeleteMessageDialog 
        open={!!showDeleteMessageDialog} 
        onOpenChange={(open) => !open && setShowDeleteMessageDialog(null)}
        onConfirm={handleDeleteMessage}
      />
    </div>
  );
};

export default SimpleChatInterface;
