
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UserChatCreationFormProps {
  userChatInput: string;
  setUserChatInput: (value: string) => void;
  handleCreateUserChat: () => void;
}

const UserChatCreationForm: React.FC<UserChatCreationFormProps> = ({
  userChatInput,
  setUserChatInput,
  handleCreateUserChat
}) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Neuer User Chat"
        value={userChatInput}
        onChange={(e) => setUserChatInput(e.target.value)}
        className="glass-input"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreateUserChat();
        }}
      />
      <Button onClick={handleCreateUserChat} size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UserChatCreationForm;
