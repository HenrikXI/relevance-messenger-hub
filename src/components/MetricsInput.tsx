
import React, { useState, useEffect } from "react";
import { Metric } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Palette, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Farbpalette definieren
const COLOR_PALETTE = {
  "Neutral Gray": "#8E9196",
  "Primary Purple": "#9b87f5",
  "Soft Green": "#F2FCE2",
  "Soft Yellow": "#FEF7CD",
  "Soft Orange": "#FEC6A1",
  "Soft Purple": "#E5DEFF",
  "Soft Pink": "#FFDEE2",
  "Soft Blue": "#D3E4FD",
  "Vivid Purple": "#8B5CF6",
  "Ocean Blue": "#0EA5E9",
  "Bright Orange": "#F97316",
};

// Typsicherer Farbtyp
type ColorKey = keyof typeof COLOR_PALETTE;

interface MetricsInputProps {
  metrics: Metric[];
  projectId: string;
  onAddMetric: (metric: Metric) => void;
  onRemoveMetric: (metricId: string) => void;
}

const MetricsInput: React.FC<MetricsInputProps> = ({
  metrics,
  projectId,
  onAddMetric,
  onRemoveMetric,
}) => {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [selectedColor, setSelectedColor] = useState<ColorKey>("Neutral Gray");
  const [colorFilter, setColorFilter] = useState<ColorKey | null>(null);
  const [filteredMetrics, setFilteredMetrics] = useState<Metric[]>(metrics);

  // Aktualisiere filteredMetrics wenn sich metrics oder colorFilter ändert
  useEffect(() => {
    if (colorFilter) {
      setFilteredMetrics(metrics.filter(metric => metric.color === COLOR_PALETTE[colorFilter]));
    } else {
      setFilteredMetrics(metrics);
    }
  }, [metrics, colorFilter]);

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (key.trim() && value.trim() && projectId) {
      const newMetric: Metric = {
        id: Date.now().toString(),
        key: key.trim(),
        value: value.trim(),
        projectId,
        color: COLOR_PALETTE[selectedColor], // Farbwert speichern
      };
      
      onAddMetric(newMetric);
      setKey("");
      setValue("");
    }
  };

  const handleResetFilter = () => {
    setColorFilter(null);
  };

  return (
    <div className="w-full space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Projektkennzahlen</h3>
        
        {/* Farbfilter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              variant="outline" 
              className={`gap-2 text-xs ${colorFilter ? 'border-primary/60 bg-primary/10' : ''}`}
            >
              <Filter className="h-3.5 w-3.5" />
              {colorFilter ? `Filter: ${colorFilter}` : "Farbfilter"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              {Object.entries(COLOR_PALETTE).map(([name, hex]) => (
                <DropdownMenuItem 
                  key={name}
                  onClick={() => setColorFilter(name as ColorKey)}
                  className="gap-2 cursor-pointer"
                >
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: hex }}
                  />
                  <span>{name}</span>
                </DropdownMenuItem>
              ))}
              <Separator className="my-1" />
              <DropdownMenuItem onClick={handleResetFilter} className="text-muted-foreground">
                Filter zurücksetzen
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <form onSubmit={handleAddMetric} className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Bezeichnung"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="glass-input"
            disabled={!projectId}
          />
          <Input
            type="text"
            placeholder="Wert"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="glass-input"
            disabled={!projectId}
          />
        </div>
        
        <div className="flex gap-2">
          {/* Farbauswahl-Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 justify-between gap-2"
                disabled={!projectId}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: COLOR_PALETTE[selectedColor] }}
                  />
                  <span>{selectedColor}</span>
                </div>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Farbkategorie wählen</h4>
                <Separator />
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {Object.entries(COLOR_PALETTE).map(([name, hex]) => (
                    <div
                      key={name}
                      onClick={() => setSelectedColor(name as ColorKey)}
                      className={`h-6 w-6 rounded-full cursor-pointer transition-all hover:scale-110 hover:shadow-md ${
                        selectedColor === name ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: hex }}
                      title={name}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="submit"
            disabled={!key.trim() || !value.trim() || !projectId}
            className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {filteredMetrics.length > 0 && (
        <ScrollArea className="h-[100px]">
          <div className="space-y-2">
            {filteredMetrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-center justify-between p-2 rounded-md border animate-fade-in"
                style={{ 
                  backgroundColor: `${metric.color}20`, // Transparente Version der Farbe
                  borderColor: metric.color 
                }}
              >
                <div className="flex-1 flex items-center justify-between mr-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: metric.color }}
                    />
                    <span className="font-medium">{metric.key}</span>
                  </div>
                  <span className="ml-4 text-muted-foreground">{metric.value}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveMetric(metric.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default MetricsInput;
