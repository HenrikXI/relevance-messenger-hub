
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleContent } from "@/components/ui/collapsible";
import ChatItem from "./ChatItem";

interface ChatItemData {
  id: string;
  title: string;
  preview: string;
  date: string;
}

interface ChatListProps {
  projectName: string;
  chats: ChatItemData[];
  onCreateChat: (project: string) => void;
  onRenameChat: (chatId: string, projectId: string) => void;
  onDeleteChat: (chatId: string, projectId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  projectName,
  chats,
  onCreateChat,
  onRenameChat,
  onDeleteChat
}) => {
  return (
    <CollapsibleContent>
      <div className="ml-4 space-y-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-xs"
          onClick={() => onCreateChat(projectName)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Neuer Chat
        </Button>
        
        {chats?.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            projectId={projectName}
            onRename={onRenameChat}
            onDelete={onDeleteChat}
          />
        ))}
      </div>
    </CollapsibleContent>
  );
};

export default ChatList;
