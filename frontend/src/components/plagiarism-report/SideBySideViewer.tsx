import React from 'react';
import { type LlmSource, type LlmMatch } from '@/lib/mock-report-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SideBySideViewerProps {
  documentText: string;
  activeSource: LlmSource | null;
  selectedMatch: LlmMatch | null;
}

/**
 * Displays the document text context alongside the active source's content
 * for comparison, highlighting the selected match.
 */
const SideBySideViewer: React.FC<SideBySideViewerProps> = ({
  documentText,
  activeSource,
  selectedMatch,
}) => {

  if (!activeSource) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a source from the list to compare.</p>
      </div>
    );
  }

  if (!selectedMatch) {
     return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Click a highlighted match in the document to compare.</p>
      </div>
    );
  }

  // Basic context extraction (can be made more sophisticated)
  const getContext = (text: string, index: number, radius = 100): string => {
      const start = Math.max(0, index - radius);
      const end = Math.min(text.length, index + radius);
      return `${start > 0 ? '...' : ''}${text.substring(start, end)}${end < text.length ? '...' : ''}`;
  }

  const documentContext = getContext(documentText, selectedMatch.startIndex);
  const sourceContent = activeSource.snippet || activeSource.retrievedContent || 'No source content available.';
  const explanation = selectedMatch.explanation || 'No explanation provided.';

  return (
    <div className="space-y-4 h-full flex flex-col">
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Document Context</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
             <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{documentContext}</p>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Source: {activeSource.title}</CardTitle>
        </CardHeader>
        <CardContent>
           <ScrollArea className="h-32">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{sourceContent}</p>
           </ScrollArea>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Explanation</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground">{explanation}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SideBySideViewer;