import React from 'react';
import { type LlmReportData } from '@/lib/mock-report-data';
import ReportActions from './ReportActions'; // Assuming this component handles download etc.
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Share2, Download, CheckSquare } from "lucide-react";

interface ReportTopBarProps {
  reportData: LlmReportData;
  documentTitle?: string;
  analyzedDate?: string;
}

/**
 * Displays the top action bar for the plagiarism report.
 */
const ReportTopBar: React.FC<ReportTopBarProps> = ({
  reportData,
  documentTitle = "Document",
  analyzedDate
}) => {
  // TODO: Add actual functionality to buttons (navigation, print, share, review)
  const handleBack = () => { console.log("Back clicked"); };
  const handlePrint = () => { console.log("Print clicked"); };
  const handleShare = () => { console.log("Share clicked"); };
  const handleMarkReviewed = () => { console.log("Mark Reviewed clicked"); };

  return (
    <header className="flex h-16 items-center border-b bg-background px-4 md:px-6 sticky top-0 z-10">
      <Button variant="outline" size="icon" className="mr-4" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back</span>
      </Button>
      <div className="flex-1">
        <h1 className="text-lg font-semibold truncate">{documentTitle}</h1>
        {analyzedDate && (
            <p className="text-xs text-muted-foreground">Analyzed on {analyzedDate}</p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            <span className="sr-only">Print</span>
          </Button>
           <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
          {/* Render ReportActions which contains the Download button logic */}
          <ReportActions reportData={reportData} />
          <Button variant="default" onClick={handleMarkReviewed}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Mark as Reviewed
          </Button>
      </div>
    </header>
  );
};

export default ReportTopBar;