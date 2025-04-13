
// Simple chat relevance agent system

// Using a closure to encapsulate the internal data and logic
const createRelevanceAgent = () => {
  // Pre-defined responses for exact matches
  const internalData: Record<string, string> = {
    "hallo": "Hallo, wie kann ich Ihnen helfen?",
    "test": "Dies ist eine Testantwort.",
  };

  // Function to generate a response based on the message content
  const getResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (internalData[lowerMessage]) {
      return internalData[lowerMessage];
    } else if (lowerMessage.includes("qualität")) {
      return "Möchten Sie Ihre Anfrage an den Qualitätswächter weiterleiten?";
    } else if (lowerMessage.includes("prozess")) {
      return "Soll ich den Lean Master einbinden?";
    } else {
      return "Ich habe Ihre Anfrage aufgenommen. Möchten Sie weitere Details hinzufügen oder wichtige Aspekte markieren?";
    }
  };

  // Only expose the getResponse function
  return {
    getResponse
  };
};

// Create and export the relevance agent
export const simpleChatAgent = createRelevanceAgent();
