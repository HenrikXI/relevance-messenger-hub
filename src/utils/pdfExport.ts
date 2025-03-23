
import { jsPDF } from "jspdf";
import { Message, Metric } from "../types";

// Logo SVG path for PDF header (placeholder - would be replaced with actual logo path)
const LOGO_PATH = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTM1IDY1TDY1IDM1TTM1IDM1TDY1IDY1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K";

interface ExportPDFOptions {
  projectName: string;
  metrics: Metric[];
  messages: Message[];
}

export const exportToPDF = async ({ projectName, metrics, messages }: ExportPDFOptions): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set font
  doc.setFont("helvetica");
  
  // Add logo (top right corner)
  try {
    const img = new Image();
    img.src = LOGO_PATH;
    
    await new Promise<void>((resolve) => {
      img.onload = () => {
        doc.addImage(img, "PNG", 170, 10, 20, 20);
        resolve();
      };
      img.onerror = () => {
        console.error("Error loading logo for PDF");
        resolve();
      };
    });
  } catch (error) {
    console.error("Failed to add logo to PDF:", error);
  }

  // Add title (project name)
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text(`Projekt: ${projectName}`, 20, 30);
  
  // Add separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  // Add metrics header
  let yPos = 45;
  if (metrics.length > 0) {
    doc.setFontSize(18);
    doc.text("Projektkennzahlen", 20, yPos);
    yPos += 10;
    
    // Add metrics
    doc.setFontSize(12);
    metrics.forEach(metric => {
      doc.text(`${metric.key}: ${metric.value}`, 20, yPos);
      yPos += 7;
    });
    
    // Add separator line after metrics
    yPos += 3;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
  }
  
  // Add conversation header
  doc.setFontSize(18);
  doc.text("Gesprächsverlauf", 20, yPos);
  yPos += 10;
  
  // Add messages
  doc.setFontSize(12);
  messages.forEach(message => {
    // Format the timestamp
    const formattedDate = message.timestamp.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Set different styles based on sender
    if (message.sender === 'user') {
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`Sie (${formattedDate})`, 20, yPos);
    } else {
      doc.setTextColor(59, 130, 246); // Primary blue color
      doc.setFont("helvetica", "bold");
      doc.text(`Agent (${formattedDate})`, 20, yPos);
    }
    
    // Add message text with proper wrapping
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    
    // Split text to fit on page width
    const textLines = doc.splitTextToSize(message.text, 160);
    
    // Check if we need a new page
    if (yPos + textLines.length * 7 > 280) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add each line
    textLines.forEach(line => {
      doc.text(line, 25, yPos);
      yPos += 7;
    });
    
    // Add space after each message
    yPos += 5;
  });
  
  // Save the PDF
  const filename = `${projectName.replace(/\s+/g, '_')}_Chat_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
