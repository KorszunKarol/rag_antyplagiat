'use client';

import React from 'react';
import { type LlmMatch } from '@/lib/mock-report-data';
import { highlightText } from '@/lib/highlight-utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentViewerProps {
  /** The full text of the document being analyzed. */
  text: string;
  /** An array of detected matches. */
  matches: LlmMatch[];
  /** The ID of the source currently active in the sidebar. */
  activeSourceId: string | null;
  /** The ID of the match currently selected by the user. */
  selectedMatchId: string | null;
  /** Callback function triggered when the mouse enters or leaves a match span. */
  onMatchHover: (matchId: string | null) => void;
  /** Callback function triggered when a match span is clicked. */
  onMatchClick: (match: LlmMatch) => void;
}

/**
 * Displays the main document text within a scrollable area,
 * highlighting plagiarism matches based on the provided data and state.
 * Uses the `highlightText` utility to generate the highlighted content.
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  text,
  matches,
  activeSourceId,
  selectedMatchId,
  onMatchHover,
  onMatchClick,
}) => {

  const content = highlightText(
    text,
    matches,
    activeSourceId,
    selectedMatchId,
    onMatchHover,
    onMatchClick
  );

  return (
    <Card className="h-full flex flex-col">
       <CardHeader>
        <CardTitle>Document Text</CardTitle>
      </CardHeader>
       <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-6">
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap break-words">
            {content.map((item, index) => (
                <React.Fragment key={index}>{item}</React.Fragment>
            ))}
            </div>
        </ScrollArea>
       </CardContent>
    </Card>
  );
};

export default DocumentViewer;
