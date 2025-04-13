
import { Project } from "@/types/project";

// A collection of sample projects for development purposes
export const sampleProjects: Project[] = [
  {
    id: "proj-001",
    name: "Website Relaunch",
    status: "in-progress",
    deadline: "2025-05-01",
    tasks: [
      {
        id: "task-001",
        title: "Design finalisieren",
        completed: false,
        createdAt: new Date()
      },
      {
        id: "task-002",
        title: "SEO vorbereiten",
        completed: false,
        createdAt: new Date()
      },
      {
        id: "task-003",
        title: "Content migrieren",
        completed: true,
        createdAt: new Date()
      }
    ],
    comments: [
      {
        id: "comment-001",
        text: "Design-Team benötigt Feedback bis Freitag",
        author: "Anna M.",
        createdAt: new Date()
      }
    ],
    description: "Komplettes Redesign der Unternehmenswebsite mit Fokus auf verbesserte Nutzererfahrung und Conversion-Rate."
  },
  {
    id: "proj-002",
    name: "CRM Integration",
    status: "planning",
    deadline: "2025-06-15",
    tasks: [
      {
        id: "task-004",
        title: "Anforderungsanalyse",
        completed: false,
        createdAt: new Date()
      },
      {
        id: "task-005",
        title: "Anbietervergleich",
        completed: false,
        createdAt: new Date()
      }
    ],
    comments: [],
    description: "Integration eines neuen CRM-Systems zur Verbesserung des Kundenbeziehungsmanagements."
  },
  {
    id: "proj-003",
    name: "Marketingkampagne Q3",
    status: "on-hold",
    deadline: "2025-07-30",
    tasks: [
      {
        id: "task-006",
        title: "Zielgruppenanalyse",
        completed: true,
        createdAt: new Date()
      },
      {
        id: "task-007",
        title: "Kanalstrategie entwickeln",
        completed: false,
        createdAt: new Date()
      }
    ],
    comments: [
      {
        id: "comment-002",
        text: "Budget muss noch freigegeben werden",
        author: "Thomas K.",
        createdAt: new Date()
      }
    ],
    description: "Entwicklung und Umsetzung einer integrierten Marketingkampagne für das dritte Quartal."
  }
];
