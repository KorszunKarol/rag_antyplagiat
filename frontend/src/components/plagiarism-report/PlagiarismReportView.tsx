'use client';

import React from 'react';

// Import necessary types and mock data
import { mockReportData, type LlmReportData, type LlmMatch } from '@/lib/mock-report-data'; // Adjust path as needed

// Import the new layout components
import ReportTopBar from './ReportTopBar';
import ReportLeftSidebar from './ReportLeftSidebar';
import ReportCenterContent from './ReportCenterContent';
import ReportRightSidebar from './ReportRightSidebar';

// No props needed for now as it uses mock data directly
interface PlagiarismReportViewProps {}

/**
 * Main component to display the plagiarism report interface.
 * Orchestrates the new 3-column layout and interaction between sub-components.
 */
const PlagiarismReportView: React.FC<PlagiarismReportViewProps> = () => {
  // Use mock data directly for the prototype
  const reportData: LlmReportData = mockReportData;

  // State management for interactions (will be used by other components later)
  const [selectedMatchId, setSelectedMatchId] = React.useState<string | null>(null);
  const [activeSourceId, setActiveSourceId] = React.useState<string | null>(null);

  // Handler functions (will be implemented and passed down later)
  /**
   * Handles the hover event over a match segment in the document viewer.
   * @param matchId The ID of the match being hovered, or null if hover ends.
   */
  const handleMatchHover = (matchId: string | null) => {
    // Logic to handle hovering over a match in DocumentViewer
    console.log("Hovered match:", matchId);
  };

  /**
   * Handles the click event on a match segment in the document viewer or match list.
   * @param match The LlmMatch object that was clicked.
   */
  const handleMatchClick = (match: LlmMatch) => {
    // Logic to handle clicking on a match in DocumentViewer
    setSelectedMatchId(match.id);
    // Optionally activate the source related to the match
    setActiveSourceId(match.sourceId);
    console.log("Clicked match:", match);
  };

  /**
   * Handles the selection of a source (intended for future use, maybe clicking source in breakdown).
   * @param sourceId The ID of the selected source, or null if deselected.
   */
  const handleSourceSelect = (sourceId: string | null) => {
    // Logic to handle selecting a source in the SidebarPanel
    setActiveSourceId(sourceId);
    setSelectedMatchId(null); // Clear selected match when changing source focus
    console.log("Selected source:", sourceId);
  };

  // Basic word count calculation
  const wordCount = reportData.documentText.split(/\s+/).filter(Boolean).length;
  // Format date
  const analyzedDate = new Date(reportData.generatedAt).toLocaleDateString('en-US', {
     year: 'numeric', month: 'numeric', day: 'numeric'
  });

  return (
    <div className="flex h-screen flex-col bg-background">
      <ReportTopBar
        reportData={reportData}
        documentTitle={reportData.documentTitle}
        analyzedDate={analyzedDate}
      />

      <div className="flex flex-1 overflow-hidden">
        <ReportLeftSidebar
          scores={reportData.scores}
          matchesCount={reportData.matches.length}
          wordCount={wordCount}
          // Pass filter props later
        />

        <ReportCenterContent
          documentText={reportData.documentText}
          matches={reportData.matches}
          sources={reportData.sources} // Pass sources for SideBySideViewer
          activeSourceId={activeSourceId}
          selectedMatchId={selectedMatchId}
          onMatchHover={handleMatchHover}
          onMatchClick={handleMatchClick}
          // Pass text size props later
        />

        <ReportRightSidebar
          matches={reportData.matches}
          sources={reportData.sources} // Pass sources for title lookup
          selectedMatchId={selectedMatchId}
          onMatchClick={handleMatchClick} // Allow clicking match in list
          // Pass sorting/pagination props later
        />
      </div>
    </div>
  );
};

export default PlagiarismReportView;