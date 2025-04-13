
import { AgentRequest, AgentResponse } from "@/types/project";
import { mockAgentEndpoint } from "./mockAgentEndpoint";

// Since we don't have a real backend yet, we'll use this mock API service
const api = {
  // Mock implementation of the /api/agent/trigger endpoint
  agentTrigger: async (request: AgentRequest): Promise<AgentResponse> => {
    try {
      // In a production app, this would make a real API call
      // return await fetch('/api/agent/trigger', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(request)
      // }).then(res => res.json());
      
      // For our demo, we'll use the mock implementation
      return await mockAgentEndpoint(request);
    } catch (error) {
      console.error("Error in agent trigger:", error);
      return {
        text: "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
      };
    }
  }
};

export default api;
