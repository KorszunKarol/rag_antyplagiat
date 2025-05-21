import React from 'react';
import ReportHeader from './ReportHeader'; // Contains score display
import { type LlmReportScores } from '@/lib/mock-report-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ReportLeftSidebarProps {
  scores: LlmReportScores;
  matchesCount: number;
  wordCount: number;
  // Add props for filter state and handlers later
}

/**
 * Displays the left sidebar with similarity score, source breakdown, and filters.
 */
const ReportLeftSidebar: React.FC<ReportLeftSidebarProps> = ({
  scores,
  matchesCount,
  wordCount,
}) => {
  // TODO: Implement filter state and handlers
  const [similarityThreshold, setSimilarityThreshold] = React.useState([0]);
  const [excludeQuotes, setExcludeQuotes] = React.useState(false);
  const [excludeBibliography, setExcludeBibliography] = React.useState(false);

  const handleResetFilters = () => {
     setSimilarityThreshold([0]);
     setExcludeQuotes(false);
     setExcludeBibliography(false);
     // Reset source type filter too
  };

  return (
    <aside className="w-72 border-r bg-background p-4 md:p-6 flex flex-col gap-6">
      {/* Reuse ReportHeader for the score/breakdown part, or extract logic */}
      {/* For now, just show a simplified score section */}
      <Card>
          <CardHeader>
            <CardTitle>Similarity Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {/* Placeholder for circular progress */}
            <div className="text-4xl font-bold mb-2">{scores.overall ?? 'N/A'}%</div>
            <div className="flex justify-around text-sm text-muted-foreground">
              <div>
                <div>Matches</div>
                <div className="font-semibold">{matchesCount}</div>
              </div>
              <div>
                <div>Word Count</div>
                <div className="font-semibold">{wordCount}</div>
              </div>
            </div>
          </CardContent>
      </Card>

      {/* Placeholder for Source Breakdown - move logic from ReportHeader later */}
      <Card>
        <CardHeader>
            <CardTitle>Source Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Websites</span><span>{scores.paraphrase}%</span></div> {/* Example mapping */}
            <div className="flex justify-between"><span>Publications</span><span>{scores.exactMatch}%</span></div>
             <div className="flex justify-between"><span>Student Papers</span><span>{scores.aiLikelihood}%</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
            <CardTitle>Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>Reset</Button>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
             <Label htmlFor="source-type">Source Type</Label>
             <Select defaultValue="all">
              <SelectTrigger id="source-type">
                <SelectValue placeholder="Select Source Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {/* Add other source types later */}
              </SelectContent>
            </Select>
           </div>
            <div>
             <Label htmlFor="similarity-threshold">Similarity Threshold ({similarityThreshold[0]}%)</Label>
             <Slider
                id="similarity-threshold"
                min={0}
                max={100}
                step={1}
                value={similarityThreshold}
                onValueChange={setSimilarityThreshold}
              />
           </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="exclude-quotes">Exclude Quoted Text</Label>
              <Switch
                id="exclude-quotes"
                checked={excludeQuotes}
                onCheckedChange={setExcludeQuotes}
              />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="exclude-bibliography">Exclude Bibliography</Label>
              <Switch
                id="exclude-bibliography"
                checked={excludeBibliography}
                onCheckedChange={setExcludeBibliography}
              />
            </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default ReportLeftSidebar;