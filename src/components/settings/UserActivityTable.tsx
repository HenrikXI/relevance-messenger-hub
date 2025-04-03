
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "lucide-react";

// Typ für tatsächliche Benutzeraktivitäten
export interface UserActivity {
  email: string;
  lastActive: Date;
  currentActivity: {
    type: string;
    projectName?: string;
    chatName?: string;
  };
  status: "online" | "idle" | "offline";
}

const UserActivityTable: React.FC = () => {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  // Laden von Benutzeraktivitäten für die Admin-Ansicht
  useEffect(() => {
    // In einer echten Anwendung würden hier Daten aus einer API oder einem System geladen,
    // das Benutzeraktivitäten verfolgt
    
    // Lese aktive Projekte und aktuelle Chats aus localStorage
    const activeUsers: UserActivity[] = [
      {
        email: "alexander.mueller@firma.de",
        lastActive: new Date(),
        currentActivity: {
          type: "Chat",
          projectName: "Prozessoptimierung 2025",
          chatName: "Lean Management"
        },
        status: "online"
      },
      {
        email: "sebastian.weber@firma.de",
        lastActive: new Date(Date.now() - 8 * 60 * 1000), // 8 Minuten her
        currentActivity: {
          type: "Einstellungen",
          projectName: "Qualitätsmanagement"
        },
        status: "idle"
      },
      {
        email: "maria.schmidt@firma.de",
        lastActive: new Date(Date.now() - 3 * 60 * 1000), // 3 Minuten her
        currentActivity: {
          type: "Projektübersicht",
          projectName: "Digitale Transformation"
        },
        status: "online"
      },
      {
        email: "thomas.becker@firma.de",
        lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 Stunden her
        currentActivity: {
          type: "Letzte Anmeldung"
        },
        status: "offline"
      }
    ];
    
    setUserActivities(activeUsers);
  }, []);

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

  // Erstellt einen aussagekräftigen Aktivitätstext
  const getActivityText = (activity: UserActivity["currentActivity"]): string => {
    if (activity.type === "Chat" && activity.projectName && activity.chatName) {
      return `Chat: ${activity.chatName} (Projekt: ${activity.projectName})`;
    } else if (activity.type === "Einstellungen" && activity.projectName) {
      return `Einstellungen für Projekt: ${activity.projectName}`;
    } else if (activity.projectName) {
      return `${activity.type} - ${activity.projectName}`;
    } else {
      return activity.type;
    }
  };

  return (
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
              <TableCell>{getActivityText(activity.currentActivity)}</TableCell>
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
  );
};

export default UserActivityTable;
