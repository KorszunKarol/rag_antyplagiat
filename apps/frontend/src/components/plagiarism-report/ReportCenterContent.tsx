import React from 'react';
import DocumentViewer from './DocumentViewer';
import SideBySideViewer from './SideBySideViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Text } from "lucide-react";
import { type LlmMatch, type LlmSource } from '@/lib/mock-report-data';

interface ReportCenterContentProps {
  documentText: string;
  matches: LlmMatch[];
  sources: LlmSource[];
  activeSourceId: string | null;
  selectedMatchId: string | null;
  onMatchHover: (matchId: string | null) => void;
  onMatchClick: (match: LlmMatch) => void;
  // Add props for text size state/handler later
}

/**
 * Displays the center content area with tabs for Document View and Side-by-Side Comparison.
 */
const ReportCenterContent: React.FC<ReportCenterContentProps> = ({
  documentText,
  matches,
  sources,
  activeSourceId,
  selectedMatchId,
  onMatchHover,
  onMatchClick,
}) => {
  const activeSource = sources.find(s => s.id === activeSourceId) || null;
  const selectedMatch = matches.find(m => m.id === selectedMatchId) || null;

  return (
    <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
      <Tabs defaultValue="document" className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
           <TabsList>
            <TabsTrigger value="document">Document View</TabsTrigger>
            <TabsTrigger value="compare">Side-by-Side Comparison</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
             <Text className="mr-2 h-4 w-4" /> Text Size
          </Button>
        </div>

        <TabsContent value="document" className="flex-1 overflow-hidden">
          <DocumentViewer
             text={documentText}
             matches={matches}
             activeSourceId={activeSourceId}
             selectedMatchId={selectedMatchId}
             onMatchHover={onMatchHover}
             onMatchClick={onMatchClick}
           />
        </TabsContent>
        <TabsContent value="compare" className="flex-1 overflow-hidden">
           <SideBySideViewer
             documentText={documentText}
             activeSource={activeSource}
             selectedMatch={selectedMatch}
           />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default ReportCenterContent;