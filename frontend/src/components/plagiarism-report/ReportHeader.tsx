import React from 'react';

// Assuming LlmReportScores is defined in mock-report-data.ts
// Adjust the import path as necessary based on your project structure
import { type LlmReportScores } from '@/lib/mock-report-data';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

interface ReportHeaderProps {
  /** The score summary object for the report. */
  scores: LlmReportScores;
}

/**
 * Displays the summary scores of the plagiarism report using Shadcn UI components.
 * Shows Exact Match, Paraphrase, AI Likelihood, and Overall scores.
 */
const ReportHeader: React.FC<ReportHeaderProps> = ({ scores }) => {
  const { exactMatch, paraphrase, aiLikelihood, overall } = scores;

  /**
   * Helper function to determine the Progress bar color based on the score.
   * @param value The score value (0-100).
   * @returns The appropriate color value for inline styling.
   */
  const getProgressColorValue = (value: number): string => {
    if (value > 75) return 'hsl(var(--destructive))'; // Use theme color
    if (value > 50) return 'hsl(var(--warning))'; // Custom var or direct color
    if (value > 25) return 'hsl(var(--warning)) / 0.7'; // Lighter warning or direct color
    return 'hsl(var(--success))'; // Custom var or direct color
  };

  return (
    <header className="border-b p-4 md:p-6">
      {/* Use h-screen only if this header is meant to be sticky or take full height initially */}
      {/* <h2 className="text-lg font-semibold mb-4">Report Summary</h2> */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exact Match</CardTitle>
            {/* Icon placeholder if needed */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exactMatch}%</div>
            <Progress
              value={exactMatch}
              className="mt-2 h-2"
              style={{ '--progress-indicator-fill': getProgressColorValue(exactMatch) } as React.CSSProperties} // Pass color via CSS variable
              aria-label={`Exact match score: ${exactMatch}%`}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paraphrase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paraphrase}%</div>
            <Progress
              value={paraphrase}
              className="mt-2 h-2"
              style={{ '--progress-indicator-fill': getProgressColorValue(paraphrase) } as React.CSSProperties}
              aria-label={`Paraphrase score: ${paraphrase}%`}
             />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Likelihood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiLikelihood}%</div>
             <Progress
              value={aiLikelihood}
              className="mt-2 h-2"
              style={{ '--progress-indicator-fill': getProgressColorValue(aiLikelihood) } as React.CSSProperties}
              aria-label={`AI Likelihood score: ${aiLikelihood}%`}
             />
          </CardContent>
        </Card>
        {/* Conditionally render Overall score if available */}
        {overall !== undefined && (
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overall}%</div>
               <Progress
                value={overall}
                className="mt-2 h-2"
                style={{ '--progress-indicator-fill': getProgressColorValue(overall) } as React.CSSProperties}
                aria-label={`Overall score: ${overall}%`}
               />
            </CardContent>
          </Card>
        )}
      </div>
    </header>
  );
};

export default ReportHeader;