
import React, { useState } from "react";
import { SearchResult } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  searchResults: SearchResult[];
  clearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  searchResults,
  clearSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    clearSearch();
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Nachrichtenverlauf durchsuchen..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 glass-input pr-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          className="shrink-0"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {searchResults.length > 0 && (
        <div className="rounded-lg border overflow-hidden animate-slide-up">
          <div className="bg-card px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {searchResults.length} Ergebnisse
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 px-2 text-xs"
              >
                Schließen
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-[200px] bg-card/50 backdrop-blur-sm">
            <div className="p-4 space-y-3">
              {searchResults.map((result) => (
                <div
                  key={result.messageId}
                  className="p-3 rounded-md bg-background border hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium mb-1">
                      {result.sender === "user" ? "Sie" : "Agent"} • {result.projectName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleString("de-DE", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-balance">{result.messageText}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
