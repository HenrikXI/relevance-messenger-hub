
// Benutzertypen
export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
}

// Projekttypen
export interface Project {
  id: string;
  name: string;
  status?: string;
  deadline?: Date;
  tasks?: Task[];
  comments?: Comment[];
  description?: string;
}

// Task-Typ
export interface Task {
  id: string;
  name: string;
  completed: boolean;
  projectId: string;
}

// Kommentar-Typ
export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

// Kennzahlentypen
export interface Metric {
  id: string;
  key: string;
  value: string;
  projectId: string;
  color?: string; // Farbattribut für die Kategorisierung
}

// Nachrichten
export interface Message {
  id: string;
  text: string;
  sender: "user" | "agent" | "system";
  timestamp: Date;
  projectName: string;
}

// Suchergebnisse
export interface SearchResult {
  messageId: string;
  messageText: string;
  projectName: string;
  timestamp: Date;
  sender: "user" | "agent" | "system";
}
