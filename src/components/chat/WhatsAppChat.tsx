
import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import EmptyChat from "./EmptyChat";

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  read: boolean;
}

interface WhatsAppChatProps {
  selectedChatId?: string | null;
  className?: string;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ selectedChatId, className }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChat, setCurrentChat] = useState<{id: string, name: string} | null>(null);
  
  // Load messages when chat changes
  useEffect(() => {
    if (selectedChatId) {
      // In a real app, you would fetch messages from a server
      // For this demo, we'll use localStorage
      const savedChats = localStorage.getItem("userChats");
      if (savedChats) {
        try {
          const chats = JSON.parse(savedChats);
          const chat = chats.find((c: any) => c.id === selectedChatId);
          if (chat) {
            setCurrentChat({id: chat.id, name: chat.username});
            
            // Load saved messages or create empty array
            const savedMessages = localStorage.getItem(`chat_${selectedChatId}_messages`);
            if (savedMessages) {
              const parsedMessages = JSON.parse(savedMessages);
              // Convert string dates to Date objects
              setMessages(parsedMessages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })));
            } else {
              setMessages([{
                id: `welcome_${Date.now()}`,
                text: `Das ist der Beginn Ihres Chats mit ${chat.username}.`,
                sender: "system",
                timestamp: new Date(),
                read: true
              }]);
            }
          } else {
            // Chat wurde nicht gefunden oder gelöscht
            setMessages([]);
            setCurrentChat(null);
          }
        } catch (error) {
          console.error("Error loading chat data:", error);
          toast.error("Fehler beim Laden der Chat-Daten");
        }
      }
    } else {
      setMessages([]);
      setCurrentChat(null);
    }
  }, [selectedChatId]);

  // Format timestamp for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendMessage = (text: string) => {
    if (!selectedChatId || !currentChat) return;
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: text,
      sender: "user", // In a real app, this would be the current user's ID
      timestamp: new Date(),
      read: false
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Save to localStorage
    localStorage.setItem(`chat_${selectedChatId}_messages`, JSON.stringify(updatedMessages));
    
    // Simulate response (in a real app, this would come from the server)
    setTimeout(() => {
      // Überprüfen, ob der Chat immer noch existiert und ausgewählt ist
      const currentSavedChats = localStorage.getItem("userChats");
      if (currentSavedChats) {
        const currentChats = JSON.parse(currentSavedChats);
        const chatStillExists = currentChats.some((c: any) => c.id === selectedChatId);
        
        if (!chatStillExists || selectedChatId !== currentChat.id) {
          // Chat wurde gelöscht oder ein anderer Chat wurde ausgewählt
          return;
        }
      }
      
      const responseMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        text: `Dies ist eine automatische Antwort von ${currentChat.name}`,
        sender: "other",
        timestamp: new Date(),
        read: true
      };
      
      const withResponseMessages = [...updatedMessages, responseMessage];
      setMessages(withResponseMessages);
      
      // Save to localStorage
      localStorage.setItem(`chat_${selectedChatId}_messages`, JSON.stringify(withResponseMessages));
    }, 1000);
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Chat header */}
      <ChatHeader currentChat={currentChat} />
      
      {/* Messages area */}
      <ScrollArea className="flex-1 chat-background">
        {(!selectedChatId || !currentChat) ? (
          <EmptyChat 
            selectedChatId={selectedChatId} 
            currentChat={currentChat} 
          />
        ) : (
          <MessageList 
            messages={messages} 
            formatTime={formatTime} 
          />
        )}
      </ScrollArea>
      
      {/* Input area - only show if we have a valid chat */}
      {selectedChatId && currentChat && (
        <ChatInput onSendMessage={handleSendMessage} />
      )}
    </div>
  );
};

export default WhatsAppChat;
