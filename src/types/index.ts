
// Benutzertypen
export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
}

// Projekttypen
export interface Project {
  name: string;
}

// Kennzahlentypen
export interface Metric {
  key: string;
  value: string;
}

// Nachrichten
export interface Message {
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  projectName: string;
}

// Suchergebnisse
export interface SearchResult {
  messageText: string;
  projectName: string;
  timestamp: Date;
  sender: "user" | "agent";
}
