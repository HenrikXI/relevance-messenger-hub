
import { AgentRequest, AgentResponse } from "@/types/project";

// This function simulates the backend processing a request to the Relevance Agent API
export const mockAgentEndpoint = (request: AgentRequest): Promise<AgentResponse> => {
  // In a real implementation, this would be handled by the backend
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const input = request.input.toLowerCase();
      let response: AgentResponse;
      
      // Generate different responses based on input keywords
      if (input.includes("zusammenfassung") || input.includes("status")) {
        response = {
          text: `Hier ist eine Zusammenfassung für das Projekt "${request.metadata.project.name}":\n\nDas Projekt befindet sich im Zeitplan und hat ${request.metadata.project.tasks.length} Aufgaben, von denen einige noch offen sind. Die Deadline ist am ${request.metadata.project.deadline}.`,
          suggestions: [
            {
              type: "summary",
              content: "Fortschrittsbericht erstellen"
            }
          ]
        };
      } else if (input.includes("to-do") || input.includes("aufgabe") || input.includes("todo")) {
        response = {
          text: `Basierend auf dem aktuellen Projektstand für "${request.metadata.project.name}" schlage ich folgende To-Dos vor:`,
          suggestions: [
            {
              type: "task",
              content: "Meeting mit Stakeholdern planen"
            },
            {
              type: "task",
              content: "Ressourcenplan aktualisieren"
            }
          ]
        };
      } else if (input.includes("risiko") || input.includes("problem")) {
        response = {
          text: `Ich habe folgende potenzielle Risiken für das Projekt "${request.metadata.project.name}" identifiziert:`,
          suggestions: [
            {
              type: "risk",
              content: "Zeitplan könnte durch externe Abhängigkeiten gefährdet sein"
            },
            {
              type: "risk",
              content: "Budget reicht möglicherweise nicht für alle geplanten Features"
            }
          ]
        };
      } else {
        response = {
          text: `Ich habe Ihre Anfrage zu "${request.metadata.project.name}" verstanden. Kann ich Ihnen mit Zusammenfassungen, To-Dos oder Risikoanalysen helfen?`,
          suggestions: [
            {
              type: "task",
              content: "Projektplan überprüfen"
            }
          ]
        };
      }
      
      resolve(response);
    }, 1000); // Simulate 1 second delay
  });
};
