
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: "user" | "admin";
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

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange, userRole }) => {
  const [activeTab, setActiveTab] = useState("user");

  // Formular für Benutzereinstellungen
  const userForm = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      displayName: "Max Mustermann",
      language: "de-DE",
      theme: "system",
    },
  });

  // Formular für Admin-Einstellungen
  const adminForm = useForm<z.infer<typeof adminSettingsSchema>>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      apiKey: "",
      apiUrl: "https://api.example.com",
    },
  });

  const onSaveUserSettings = (data: z.infer<typeof userSettingsSchema>) => {
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
          <DialogTitle>Einstellungen</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="user" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Benutzer</TabsTrigger>
            {userRole === "admin" && (
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
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="de-DE">Deutsch</option>
                          <option value="en-US">Englisch</option>
                          <option value="fr-FR">Französisch</option>
                        </select>
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
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="light">Hell</option>
                          <option value="dark">Dunkel</option>
                          <option value="system">System</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">Speichern</Button>
              </form>
            </Form>
          </TabsContent>
          
          {userRole === "admin" && (
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
