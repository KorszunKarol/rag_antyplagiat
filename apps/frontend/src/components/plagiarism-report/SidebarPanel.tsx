import React from 'react';
import { type LlmSource, type LlmMatch } from '@/lib/mock-report-data';
import SourceList from './SourceList';
import SourceTypeBreakdown from './SourceTypeBreakdown';
import SideBySideViewer from './SideBySideViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SidebarPanelProps {
  sources: LlmSource[];
  matches: LlmMatch[];
  activeSourceId: string | null;
  selectedMatchId: string | null;
  documentText: string; // Needed for SideBySideViewer
  onSourceSelect: (sourceId: string | null) => void;
}

/**
 * Renders the sidebar panel containing source information and comparison tools.
 * Uses Shadcn Tabs to switch between Sources view and Compare view.
 */
const SidebarPanel: React.FC<SidebarPanelProps> = ({
  sources,
  matches,
  activeSourceId,
  selectedMatchId,
  documentText,
  onSourceSelect,
}) => {

  const activeSource = sources.find(s => s.id === activeSourceId) || null;
  const selectedMatch = matches.find(m => m.id === selectedMatchId) || null;

  return (
    <Tabs defaultValue="sources" className="flex flex-col h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sources">Sources</TabsTrigger>
        <TabsTrigger value="compare">Compare</TabsTrigger>
      </TabsList>
      <TabsContent value="sources" className="flex-1 overflow-y-auto space-y-4 pt-4">
          <SourceTypeBreakdown matches={matches} />
          <SourceList
            sources={sources}
            activeSourceId={activeSourceId}
            onSourceSelect={onSourceSelect}
          />
      </TabsContent>
      <TabsContent value="compare" className="flex-1 overflow-y-auto pt-4">
           <SideBySideViewer
             documentText={documentText}
             activeSource={activeSource}
             selectedMatch={selectedMatch}
           />
      </TabsContent>
    </Tabs>
  );
};

export default SidebarPanel;