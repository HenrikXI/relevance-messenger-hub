
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";

// Schema für Benutzereinstellungen
const userSettingsSchema = z.object({
  displayName: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  language: z.string().min(1, "Bitte wählen Sie eine Sprache"),
  theme: z.string().min(1, "Bitte wählen Sie ein Theme"),
});

// Typ für die Benutzereinstellungen
export type UserSettings = z.infer<typeof userSettingsSchema>;

const UserSettingsForm: React.FC = () => {
  const { setTheme } = useTheme();
  
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
    
    setTheme(data.theme);
    
    toast.success("Benutzereinstellungen wurden gespeichert");
  };

  return (
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
  );
};

export default UserSettingsForm;
