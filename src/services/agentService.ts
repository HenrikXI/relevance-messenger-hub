
import { AgentRequest, AgentResponse } from "@/types/project";
import api from "@/mocks/mockApi";

export const triggerAgent = async (
  projectId: string,
  projectName: string,
  tasks: string[],
  deadline: string,
  userInput: string,
  userId: string = "user-1"
): Promise<AgentResponse> => {
  try {
    const request: AgentRequest = {
      agent_id: "your_agent_id", // In a real implementation, this would be the actual agent ID
      input: userInput,
      session_id: userId,
      metadata: {
        project: {
          id: projectId,
          name: projectName,
          tasks,
          deadline
        }
      }
    };

    // Call our mock API service instead of a real endpoint
    // In a real implementation, this would call an actual backend endpoint
    return await api.agentTrigger(request);
  } catch (error) {
    console.error("Error triggering agent:", error);
    // Provide a fallback response
    return {
      text: "Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie es später erneut."
    };
  }
};
