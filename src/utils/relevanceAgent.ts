
// This file contains the background logic for the Relevance Agent System

// Using a closure to encapsulate the internal data and logic
const createRelevanceAgent = () => {
  // Pre-defined responses for exact matches (not visible to users)
  const exactMatches: Record<string, string> = {
    'hallo': 'Hallo! Wie kann ich Ihnen bei Ihrem Projekt helfen?',
    'test': 'Dies ist eine Testantwort des Relevance Agent Systems. Das System funktioniert wie erwartet.',
    'hilfe': 'Ich kann Ihnen helfen! Bitte geben Sie weitere Details zu Ihrem Anliegen oder Projekt an.',
  };

  // Keywords that trigger specific responses (not visible to users)
  const keywordResponses: Record<string, string> = {
    'qualität': 'Qualität ist ein wichtiger Faktor. Könnten Sie näher erläutern, welche Qualitätsaspekte für Ihr Projekt relevant sind?',
    'prozess': 'Die Prozessoptimierung ist ein komplexes Thema. Lassen Sie uns die spezifischen Prozesse identifizieren, die verbessert werden sollen.',
    'kosten': 'Kosteneffizienz ist ein wichtiges Ziel. Haben Sie bereits ein Budget oder Kostenziele definiert?',
    'zeit': 'Zeitmanagement ist entscheidend für den Projekterfolg. Gibt es spezifische Fristen oder Meilensteine?',
    'team': 'Die Teamdynamik beeinflusst den Projekterfolg maßgeblich. Wie ist Ihr Team derzeit strukturiert?',
  };

  // Default response if no match is found
  const defaultResponse = 'Vielen Dank für Ihre Nachricht. Könnten Sie weitere Details zu Ihrem Anliegen hinzufügen, damit ich Ihnen besser helfen kann?';

  // Function to generate a response based on the message content
  const getResponse = (message: string): string => {
    // Convert to lowercase for case-insensitive matching
    const lowerMessage = message.toLowerCase();
    
    // Check for exact matches first
    if (exactMatches[lowerMessage]) {
      return exactMatches[lowerMessage];
    }
    
    // Check for keyword matches
    for (const keyword in keywordResponses) {
      if (lowerMessage.includes(keyword)) {
        return keywordResponses[keyword];
      }
    }
    
    // Return default response if no match is found
    return defaultResponse;
  };

  // Only expose the getResponse function
  return {
    getResponse
  };
};

// Create and export the relevance agent
export const relevanceAgent = createRelevanceAgent();
