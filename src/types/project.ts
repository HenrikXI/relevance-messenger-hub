
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
  status: "planning" | "in-progress" | "completed" | "on-hold";
  deadline: string;
  comments: Comment[];
  description?: string;
}

export interface AgentResponse {
  text: string;
  suggestions?: {
    type: "task" | "risk" | "summary";
    content: string;
  }[];
}

export interface AgentRequest {
  agent_id: string;
  input: string;
  session_id: string;
  metadata: {
    project: {
      id: string;
      name: string;
      tasks: string[];
      deadline: string;
    }
  }
}
