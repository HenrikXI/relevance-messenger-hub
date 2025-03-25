
import React from "react";
import { MessageSquare } from "lucide-react";
import { ContextMenuActions } from "@/components/ContextMenuActions";
import { toast } from "sonner";

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
}

interface ChatItemProps {
  chat: ChatItem;
  projectId: string;
  onRename: (chatId: string, projectId: string) => void;
  onDelete: (chatId: string, projectId: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  projectId,
  onRename,
  onDelete
}) => {
  return (
    <ContextMenuActions
      key={chat.id}
      className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent/50 text-xs relative group"
      isChat={true}
      onRename={() => onRename(chat.id, projectId)}
      onDelete={() => onDelete(chat.id, projectId)}
      onAddToProject={() => toast.info("Diese Funktion wird bald verfügbar sein")}
    >
      <div className="flex-1 flex items-center gap-2">
        <MessageSquare className="h-3 w-3 text-muted-foreground" />
        <div className="flex-1 truncate">
          <div className="font-medium">{chat.title}</div>
          <div className="text-muted-foreground truncate">{chat.preview}</div>
        </div>
      </div>
    </ContextMenuActions>
  );
};

export default ChatItem;
