
import React from "react";

interface EmptyChatProps {
  selectedChatId: string | null;
  currentChat: { id: string; name: string } | null;
}

const EmptyChat: React.FC<EmptyChatProps> = ({ selectedChatId, currentChat }) => {
  if (!selectedChatId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center">
          Bitte wählen Sie einen Chat aus der Liste aus.
        </p>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center">
          Der ausgewählte Chat existiert nicht mehr oder wurde gelöscht.
        </p>
      </div>
    );
  }

  return null;
};

export default EmptyChat;
