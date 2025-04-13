
// Agent for generating responses
const internalData: Record<string, string> = {
  "hallo": "Hallo, wie kann ich Ihnen helfen?",
  "test": "Dies ist eine Testantwort.",
};

export function getResponse(message: string): string {
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
}
