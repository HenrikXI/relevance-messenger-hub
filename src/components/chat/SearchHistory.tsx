
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  projectName: string;
}

interface SearchHistoryProps {
  projects: string[];
  history: Message[];
  onDeleteMessage: (messageId: string) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ 
  projects, 
  history,
  onDeleteMessage
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [searchByProject, setSearchByProject] = useState("");

  const handleSearch = () => {
    if (!searchQuery.trim() && !searchByProject) {
      setSearchResults([]);
      return;
    }
    
    let results = [...history];
    
    if (searchByProject) {
      results = results.filter(msg => msg.projectName === searchByProject);
    }
    
    if (searchQuery.trim()) {
      results = results.filter(msg =>
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setSearchResults(results);
    
    if (results.length === 0) {
      toast.info("Keine Ergebnisse gefunden");
    } else {
      toast.success(`${results.length} Ergebnis(se) gefunden`);
    }
  };

  const resetSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
    setSearchByProject("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message)
      .then(() => toast.success("Nachricht kopiert"))
      .catch(() => toast.error("Fehler beim Kopieren"));
  };

  return (
    <Card className="p-4 glass-panel shadow-md">
      <h3 className="text-lg font-medium mb-2">Verlaufssuche</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <Button
            variant="ghost" 
            onClick={() => setAdvancedSearch(!advancedSearch)}
            className="text-xs"
          >
            {advancedSearch ? "Einfache Suche" : "Erweiterte Suche"}
          </Button>
          
          {searchResults.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetSearch}
              className="text-xs"
            >
              Suche zurücksetzen
            </Button>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {advancedSearch && (
            <Select
              value={searchByProject}
              onValueChange={setSearchByProject}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Nach Projekt filtern (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Projekte</SelectItem>
                {projects.map((project, index) => (
                  <SelectItem key={index} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="flex gap-2">
            <Input
              placeholder="Suchbegriff eingeben..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="glass-input"
            />
            <Button 
              onClick={handleSearch} 
              className="button-accent-blue shadow-sm"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {searchResults.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">{searchResults.length} Ergebnis(se)</h4>
          <div className="overflow-auto max-h-60 border rounded-md bg-white/50 dark:bg-black/20">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/20">
                  <TableHead>Projekt</TableHead>
                  <TableHead>Absender</TableHead>
                  <TableHead>Text</TableHead>
                  <TableHead>Zeit</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((result) => (
                  <TableRow key={result.id} className="hover:bg-secondary/10">
                    <TableCell className="font-medium">
                      {result.projectName || "System"}
                    </TableCell>
                    <TableCell>
                      {result.sender === "user" ? "Sie" : "Agent"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {result.text}
                    </TableCell>
                    <TableCell>
                      {result.timestamp.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopyMessage(result.text)}
                          title="Nachricht kopieren"
                          className="h-7 w-7"
                        >
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onDeleteMessage(result.id)}
                          title="Nachricht löschen"
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SearchHistory;
