import React from 'react';
import { type LlmMatch } from '@/lib/mock-report-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface SourceTypeBreakdownProps {
  matches: LlmMatch[];
}

/**
 * Displays a breakdown of matches by type (Exact, Paraphrase, AI).
 */
const SourceTypeBreakdown: React.FC<SourceTypeBreakdownProps> = ({ matches }) => {

  const breakdown = matches.reduce((acc, match) => {
    acc[match.matchType] = (acc[match.matchType] || 0) + 1;
    return acc;
  }, {} as Record<LlmMatch['matchType'], number>);

  const totalMatches = matches.length;

  const getPercentage = (count: number | undefined): number => {
    if (!totalMatches || !count) return 0;
    return Math.round((count / totalMatches) * 100);
  };

  const exactPercentage = getPercentage(breakdown.exact);
  const paraphrasePercentage = getPercentage(breakdown.paraphrase);
  const aiPercentage = getPercentage(breakdown.ai);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Match Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Exact</span>
            <span>{exactPercentage}%</span>
          </div>
          <Progress value={exactPercentage} className="h-2" aria-label={`Exact matches: ${exactPercentage}%`} />
        </div>
         <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Paraphrase</span>
            <span>{paraphrasePercentage}%</span>
          </div>
          <Progress value={paraphrasePercentage} className="h-2" aria-label={`Paraphrased matches: ${paraphrasePercentage}%`} />
        </div>
         <div>
          <div className="flex justify-between text-sm mb-1">
            <span>AI Likelihood</span>
            <span>{aiPercentage}%</span>
          </div>
          <Progress value={aiPercentage} className="h-2" aria-label={`AI Likelihood matches: ${aiPercentage}%`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceTypeBreakdown;