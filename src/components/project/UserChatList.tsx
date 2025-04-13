
import React from "react";
import { 
  MoreHorizontal,
  CircleDot
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserChatProps {
  id: string;
  username: string;
  avatar?: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
}

interface UserChatListProps {
  userChats: UserChatProps[];
  onRenameUserChat: (chatId: string) => void;
  onDeleteUserChat: (chatId: string) => void;
  onSelectChat?: (chatId: string) => void;
}

const UserChatList: React.FC<UserChatListProps> = ({ 
  userChats, 
  onRenameUserChat,
  onDeleteUserChat,
  onSelectChat
}) => {
  if (userChats.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Keine Benutzer-Chats gefunden.
      </div>
    );
  }

  // Get initials from a name (e.g. "John Doe" -> "JD")
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="p-3">
      <ul className="space-y-2">
        {userChats.map(chat => (
          <li 
            key={chat.id}
            className="relative flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer group transition-colors"
            onClick={() => onSelectChat && onSelectChat(chat.id)}
          >
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(chat.username)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium truncate">{chat.username}</h3>
                <span className="text-xs text-muted-foreground shrink-0 ml-1">{chat.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate pr-8">{chat.lastMessage}</p>
            </div>

            {chat.unread > 0 && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium">
                  {chat.unread}
                </div>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-48">
                <DropdownMenuItem onClick={() => onRenameUserChat(chat.id)}>
                  Umbenennen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={() => onDeleteUserChat(chat.id)}
                >
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserChatList;
