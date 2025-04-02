
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { useTheme } from "next-themes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "lucide-react";

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

// Typ für die Benutzereinstellungen
type UserSettings = z.infer<typeof userSettingsSchema>;

// Simuliertes Benutzeraktivitätslog für die Admin-Ansicht
interface UserActivity {
  email: string;
  lastActive: Date;
  currentAction: string;
  status: "online" | "idle" | "offline";
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState("user");
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  // Simuliertes Laden von Benutzeraktivitäten für die Admin-Ansicht
  useEffect(() => {
    if (user?.role === "admin" && activeTab === "admin") {
      // Simulierte Benutzerdaten für die Admin-Ansicht
      const mockActivities: UserActivity[] = [
        {
          email: "user@example.com",
          lastActive: new Date(),
          currentAction: "Chat mit Projekt A",
          status: "online"
        },
        {
          email: "user2@example.com",
          lastActive: new Date(Date.now() - 15 * 60 * 1000), // 15 Minuten her
          currentAction: "Einstellungen bearbeiten",
          status: "idle"
        },
        {
          email: "admin@example.com",
          lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 Minuten her
          currentAction: "Benutzeraktivitäten anzeigen",
          status: "online"
        },
        {
          email: "test@example.com",
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 Stunden her
          currentAction: "Letzte Anmeldung",
          status: "offline"
        }
      ];
      setUserActivities(mockActivities);
    }
  }, [activeTab, user?.role]);

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

  // Einstellungen beim Speichern im localStorage ablegen
  const onSaveUserSettings = (data: UserSettings) => {
    localStorage.setItem("hcs-user-settings", JSON.stringify(data));
    console.log("Benutzereinstellungen gespeichert:", data);
    
    // Apply theme immediately when saved
    setTheme(data.theme);
    
    toast.success("Benutzereinstellungen wurden gespeichert");
  };

  // Formatieren eines Datums für die Anzeige
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Gerade eben";
    if (diffInMinutes < 60) return `Vor ${diffInMinutes} Minuten`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Vor ${diffInHours} Stunden`;
    
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render-Funktion für die Status-Badge
  const renderStatusBadge = (status: "online" | "idle" | "offline") => {
    switch (status) {
      case "online":
        return <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>Online</span>;
      case "idle":
        return <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>Inaktiv</span>;
      case "offline":
        return <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>Offline</span>;
    }
  };

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
              <div className="rounded-md border">
                <div className="p-4 bg-muted/50">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Benutzeraktivitäten
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Übersicht der aktuellen Benutzeraktivitäten im System
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aktuelle Aktivität</TableHead>
                      <TableHead>Letzte Aktivität</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivities.map((activity) => (
                      <TableRow key={activity.email}>
                        <TableCell className="font-medium">{activity.email}</TableCell>
                        <TableCell>{renderStatusBadge(activity.status)}</TableCell>
                        <TableCell>{activity.currentAction}</TableCell>
                        <TableCell>{formatDate(activity.lastActive)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 bg-muted/50 border-t">
                  <p className="text-sm text-muted-foreground italic">
                    Daten werden alle 60 Sekunden aktualisiert
                  </p>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
