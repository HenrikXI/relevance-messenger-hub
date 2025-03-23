
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  projectName?: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface Metric {
  id: string;
  key: string;
  value: string;
  projectId: string;
}

export interface SearchResult {
  messageId: string;
  messageText: string;
  projectName: string;
  timestamp: Date;
  sender: 'user' | 'agent';
}
