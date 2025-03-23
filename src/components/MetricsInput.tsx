
import React, { useState } from "react";
import { Metric } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (key.trim() && value.trim() && projectId) {
      const newMetric: Metric = {
        id: Date.now().toString(),
        key: key.trim(),
        value: value.trim(),
        projectId,
      };
      
      onAddMetric(newMetric);
      setKey("");
      setValue("");
    }
  };

  return (
    <div className="w-full space-y-3 animate-fade-in">
      <h3 className="text-sm font-medium">Projektkennzahlen</h3>
      
      <form onSubmit={handleAddMetric} className="flex gap-2">
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
        <Button
          type="submit"
          size="icon"
          disabled={!key.trim() || !value.trim() || !projectId}
          className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </form>

      {metrics.length > 0 && (
        <ScrollArea className="h-[100px]">
          <div className="space-y-2">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="flex items-center justify-between p-2 rounded-md bg-background border animate-fade-in"
              >
                <div className="flex-1 flex items-center justify-between mr-2">
                  <span className="font-medium">{metric.key}</span>
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
