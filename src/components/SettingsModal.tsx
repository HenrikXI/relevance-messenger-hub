
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Schema für Benutzereinstellungen
const userSettingsSchema = z.object({
  displayName: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  language: z.string().min(1, "Bitte wählen Sie eine Sprache"),
  theme: z.string().min(1, "Bitte wählen Sie ein Theme"),
});

// Schema für Admin-Einstellungen
const adminSettingsSchema = z.object({
  apiKey: z.string().min(1, "API-Key ist erforderlich"),
  apiUrl: z.string().url("Gültige URL erforderlich"),
});

// Typ für die Benutzereinstellungen
type UserSettings = z.infer<typeof userSettingsSchema>;

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState("user");
  const { user } = useAuth();

  // Laden der gespeicherten Einstellungen aus localStorage
  const loadSavedSettings = (): UserSettings => {
    const savedSettings = localStorage.getItem("hcs-user-settings");
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error("Fehler beim Laden der Einstellungen:", error);
      }
    }
    
    // Standardwerte, falls keine gespeicherten Einstellungen vorhanden sind
    return {
      displayName: "Max Mustermann",
      language: "de-DE",
      theme: "system",
    };
  };

  // Formular für Benutzereinstellungen
  const userForm = useForm<UserSettings>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: loadSavedSettings(),
  });

  // Formular für Admin-Einstellungen
  const adminForm = useForm<z.infer<typeof adminSettingsSchema>>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      apiKey: "",
      apiUrl: "https://api.example.com",
    },
  });

  // Einstellungen beim Speichern im localStorage ablegen
  const onSaveUserSettings = (data: UserSettings) => {
    localStorage.setItem("hcs-user-settings", JSON.stringify(data));
    console.log("Benutzereinstellungen gespeichert:", data);
    toast.success("Benutzereinstellungen wurden gespeichert");
  };

  const onSaveAdminSettings = (data: z.infer<typeof adminSettingsSchema>) => {
    console.log("Admin-Einstellungen gespeichert:", data);
    toast.success("Admin-Einstellungen wurden gespeichert");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>HCS Messenger Hub - Einstellungen</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Benutzer</TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger value="admin">Admin</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="user" className="space-y-4 mt-4">
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onSaveUserSettings)} className="space-y-4">
                <FormField
                  control={userForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprache</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sprache wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="de-DE">Deutsch</SelectItem>
                            <SelectItem value="en-US">Englisch</SelectItem>
                            <SelectItem value="fr-FR">Französisch</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Theme wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Hell</SelectItem>
                            <SelectItem value="dark">Dunkel</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">Speichern</Button>
              </form>
            </Form>
          </TabsContent>
          
          {user?.role === "admin" && (
            <TabsContent value="admin" className="space-y-4 mt-4">
              <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(onSaveAdminSettings)} className="space-y-4">
                  <FormField
                    control={adminForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API-Key</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={adminForm.control}
                    name="apiUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API-URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">Speichern</Button>
                </form>
              </Form>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
