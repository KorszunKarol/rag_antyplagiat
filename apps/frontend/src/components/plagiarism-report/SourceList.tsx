import React from 'react';
import { type LlmSource } from '@/lib/mock-report-data';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SourceListProps {
  sources: LlmSource[];
  activeSourceId: string | null;
  onSourceSelect: (sourceId: string | null) => void;
}

/**
 * Displays a scrollable list of detected sources within a Card.
 * Allows selecting a source and highlights the active one.
 */
const SourceList: React.FC<SourceListProps> = ({
  sources = [],
  activeSourceId,
  onSourceSelect,
}) => {

  /**
   * Handles keyboard interaction for selecting a source.
   * @param e The keyboard event.
   * @param sourceId The ID of the source associated with the event target.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, sourceId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent space bar from scrolling
      onSourceSelect(sourceId);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48"> {/* Adjust height as needed */}
          <ul className="space-y-1 pr-3">
            {sources.map((source) => (
              <li
                key={source.id}
                className={cn(
                  "p-2 rounded-md border cursor-pointer transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                  source.id === activeSourceId
                    ? "bg-muted border-primary text-primary-foreground"
                    : "border-transparent hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => onSourceSelect(source.id)}
                onKeyDown={(e) => handleKeyDown(e, source.id)}
                role="button"
                tabIndex={0}
                aria-selected={source.id === activeSourceId}
                aria-label={`Source: ${source.title}, Type: ${source.type}`}
              >
                <div className="font-medium truncate text-sm">{source.title}</div>
                <div className="text-xs text-muted-foreground">{source.type}</div>
              </li>
            ))}
          </ul>
          {sources.length === 0 && (
            <p className="text-sm text-muted-foreground text-center pt-4">No sources found.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SourceList;