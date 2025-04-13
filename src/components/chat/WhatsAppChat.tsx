
import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SmilePlus, Paperclip, SendHorizonal, Check } from "lucide-react";
import { toast } from "sonner";

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
  const [input, setInput] = useState("");
  const [currentChat, setCurrentChat] = useState<{id: string, name: string} | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
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
                timestamp: new Date(msg.timestamp),
                // Ensure text is always a string
                text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
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
            setInput("");
          }
        } catch (error) {
          console.error("Error loading chat data:", error);
          toast.error("Fehler beim Laden der Chat-Daten");
        }
      }
    } else {
      setMessages([]);
      setCurrentChat(null);
      setInput("");
    }
  }, [selectedChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || !selectedChatId || !currentChat) return;
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: input.trim(),
      sender: "user", // In a real app, this would be the current user's ID
      timestamp: new Date(),
      read: false
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    
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

  // Format timestamp for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Chat header */}
      {currentChat ? (
        <div className="p-4 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-medium text-primary">
                {currentChat.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{currentChat.name}</h3>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b">
          <h3 className="font-medium">Chat</h3>
        </div>
      )}
      
      {/* Messages area */}
      <ScrollArea className="flex-1 chat-background">
        {!selectedChatId ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              Bitte wählen Sie einen Chat aus der Liste aus.
            </p>
          </div>
        ) : !currentChat ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              Der ausgewählte Chat existiert nicht mehr oder wurde gelöscht.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              Keine Nachrichten vorhanden. Starten Sie die Unterhaltung!
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-6">
            {messages.map((message, index) => {
              // Display date if it's the first message or if the date has changed
              const showDate =
                index === 0 ||
                message.timestamp.toDateString() !==
                  messages[index - 1].timestamp.toDateString();

              return (
                <div key={message.id} className="space-y-2">
                  {showDate && (
                    <div className="relative py-2">
                      <Separator className="absolute inset-0 my-auto" />
                      <span className="relative bg-background px-2 text-xs text-muted-foreground mx-auto w-auto flex justify-center">
                        {message.timestamp.toLocaleDateString('de-DE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.sender === 'user'
                          ? 'ml-12'
                          : 'mr-12'
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.sender === 'user'
                            ? 'bg-primary/95 text-primary-foreground rounded-tr-none'
                            : message.sender === 'system'
                              ? 'bg-secondary/40 text-secondary-foreground text-center rounded-lg'
                              : 'bg-secondary/80 text-secondary-foreground dark:bg-secondary/40 rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {typeof message.text === 'string' ? message.text : JSON.stringify(message.text)}
                        </p>
                      </div>
                      <div 
                        className={`text-[11px] px-2 mt-1 text-muted-foreground flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                        {message.sender === 'user' && (
                          <span className="ml-1 flex items-center">
                            <Check className="h-3 w-3 ml-0.5" />
                            {message.read && <Check className="h-3 w-3 -ml-1.5" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Input area */}
      {selectedChatId && currentChat && (
        <div className="p-3 border-t bg-card/95 backdrop-blur-sm">
          <div className="whatsapp-style-input">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-9 w-9 hover:bg-secondary/50"
              title="Emoji einfügen"
            >
              <SmilePlus className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nachricht schreiben..."
              onKeyDown={handleKeyPress}
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0 h-10 py-2.5 resize-none"
              rows={1}
            />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-9 w-9 hover:bg-secondary/50" 
              title="Datei anhängen"
            >
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim()}
              className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
              size="icon"
            >
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppChat;
