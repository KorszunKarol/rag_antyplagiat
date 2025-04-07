import React from 'react';
import { type LlmReportData } from '@/lib/mock-report-data';
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ReportActionsProps {
  reportData: LlmReportData;
}

/**
 * Provides actions related to the report, such as downloading.
 */
const ReportActions: React.FC<ReportActionsProps> = ({ reportData }) => {

  /**
   * Handles the download button click event.
   * Creates a JSON blob of the report data and triggers a browser download.
   */
  const handleDownload = () => {
    try {
      const jsonString = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plagiarism-report-${reportData.documentId || 'data'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <div>
      <Button onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download Report
      </Button>
    </div>
  );
};

export default ReportActions;
