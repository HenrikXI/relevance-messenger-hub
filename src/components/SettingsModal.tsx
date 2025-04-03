
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import UserSettingsForm from "./settings/UserSettingsForm";
import UserActivityTable from "./settings/UserActivityTable";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState("user");
  const { user } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>HCS Messenger Hub - Einstellungen</DialogTitle>
          <DialogDescription>
            Passen Sie Ihre persönlichen Einstellungen an
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Benutzer</TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger value="admin">Admin</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="user" className="space-y-4 mt-4">
            <UserSettingsForm />
          </TabsContent>
          
          {user?.role === "admin" && (
            <TabsContent value="admin" className="space-y-4 mt-4">
              <UserActivityTable />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
