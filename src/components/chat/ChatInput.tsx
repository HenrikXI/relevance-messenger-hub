
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SmilePlus, Paperclip, SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
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
  );
};

export default ChatInput;
