
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchAreaProps {
  searchQuery: string;
  onSearch: (value: string) => void;
}

const SearchArea: React.FC<SearchAreaProps> = ({ searchQuery, onSearch }) => {
  return (
    <div className="mb-3 relative">
      <Input
        placeholder="Projekte und Chats durchsuchen..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="glass-input pr-8"
      />
      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
};

export default SearchArea;
