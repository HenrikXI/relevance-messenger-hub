
import React from "react";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import ProjectSidebar from "@/components/ProjectSidebar";
import ChatArea from "@/components/ChatArea";

const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-primary animate-pulse"></div>
            </div>
            <h1 className="text-xl font-medium">Relevance Messenger Hub</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Intelligente Kommunikation
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="border-r">
            <ProjectSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <ChatArea />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      
      <footer className="border-t py-4 bg-card/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <div>© {new Date().getFullYear()} Relevance Messenger Hub</div>
            <div className="flex items-center gap-4">
              <span>Datenschutz</span>
              <span>Impressum</span>
              <span>Hilfe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
