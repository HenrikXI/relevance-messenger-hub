
import { useState, useEffect } from "react";
import { Message } from "../types";
import { toast } from "sonner";
import { getResponse } from "../services/relevanceAgent";

export interface ChatState {
  messages: Message[];
  history: Message[];
  input: string;
  projects: string[];
  selectedProject: string;
  userChats: any[];
  projectMetrics: Record<string, Record<string, string>>;
  showDeleteMessageDialog: string | null;
}

export interface ChatActions {
  setInput: (input: string) => void;
  setSelectedProject: (project: string) => void;
  handleSend: () => void;
  confirmDeleteMessage: (messageId: string) => void;
  handleDeleteMessage: () => void;
  handleCopyMessage: (text: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  setProjects: React.Dispatch<React.SetStateAction<string[]>>;
  setProjectMetrics: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>;
}

export function useChatState(selectedChatId?: string | null, onSelectChat?: (id: string) => void): [ChatState, ChatActions] {
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
  const [history, setHistory] = useState<Message[]>([]);
  const [userChats, setUserChats] = useState<any[]>([]);
  const [showDeleteMessageDialog, setShowDeleteMessageDialog] = useState<string | null>(null);
  const [projectMetrics, setProjectMetrics] = useState<Record<string, Record<string, string>>>({});

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
          timestamp: new Date(msg.timestamp),
          // Ensure text is always a string
          text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text),
          // Ensure id is always present
          id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        setMessages(messagesWithDates);
        setHistory(messagesWithDates);
      } catch (error) {
        console.error("Fehler beim Laden der Nachrichten:", error);
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

    // Load project metrics from localStorage
    const savedProjectMetrics = localStorage.getItem("projectMetrics");
    if (savedProjectMetrics) {
      try {
        setProjectMetrics(JSON.parse(savedProjectMetrics));
      } catch (error) {
        console.error("Fehler beim Laden der Projektkennzahlen:", error);
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

    if (userChats.length > 0) {
      localStorage.setItem("userChats", JSON.stringify(userChats));
    }

    // Save projectMetrics to localStorage
    if (Object.keys(projectMetrics).length > 0) {
      localStorage.setItem("projectMetrics", JSON.stringify(projectMetrics));
    }
  }, [projects, messages, userChats, projectMetrics]);

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
    
    const newMessage: Message = { 
      id: `msg_${Date.now()}`,
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
      const response = getResponse(currentInput);
      const responseMessage: Message = { 
        id: `msg_${Date.now() + 1}`,
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

  // Copy a message handler
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Text in die Zwischenablage kopiert"))
      .catch(() => toast.error("Fehler beim Kopieren"));
  };

  return [
    { 
      messages, 
      history, 
      input, 
      projects, 
      selectedProject, 
      userChats, 
      projectMetrics, 
      showDeleteMessageDialog 
    },
    { 
      setInput, 
      setSelectedProject, 
      handleSend, 
      confirmDeleteMessage, 
      handleDeleteMessage, 
      handleCopyMessage,
      setMessages,
      setHistory,
      setProjects,
      setProjectMetrics
    }
  ];
}
