
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
  sender: "user" | "agent";
  timestamp: Date;
  projectName: string;
}

// Suchergebnisse
export interface SearchResult {
  messageId: string;
  messageText: string;
  projectName: string;
  timestamp: Date;
  sender: "user" | "agent";
}
