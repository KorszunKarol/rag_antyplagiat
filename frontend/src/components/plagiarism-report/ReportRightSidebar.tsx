import React from 'react';
import { type LlmMatch, type LlmSource } from '@/lib/mock-report-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportRightSidebarProps {
  matches: LlmMatch[];
  sources: LlmSource[];
  selectedMatchId: string | null;
  onMatchClick: (match: LlmMatch) => void; // To select a match from this list
  // Add state/handlers for sorting and pagination later
}

/**
 * Displays the right sidebar with the list of detected matches.
 */
const ReportRightSidebar: React.FC<ReportRightSidebarProps> = ({
  matches,
  sources,
  selectedMatchId,
  onMatchClick,
}) => {
  // TODO: Implement sorting and pagination state/logic
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5; // Example
  const totalPages = Math.ceil(matches.length / itemsPerPage);

  const paginatedMatches = matches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSourceTitle = (sourceId: string): string => {
    return sources.find(s => s.id === sourceId)?.title ?? 'Unknown Source';
  };

  return (
    <aside className="w-80 border-l bg-background p-4 md:p-6 flex flex-col gap-4">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <CardTitle>Matches ({matches.length})</CardTitle>
        <Select defaultValue="similarity">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="similarity">Similarity %</SelectItem>
            <SelectItem value="source">Source</SelectItem>
             <SelectItem value="order">Document Order</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <ul className="space-y-3">
          {paginatedMatches.map((match) => (
            <li
              key={match.id}
              className={cn(
                "border rounded-lg p-3 cursor-pointer transition-colors",
                 match.id === selectedMatchId ? "bg-muted border-primary" : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onMatchClick(match)}
              role="button"
              tabIndex={0}
              aria-selected={match.id === selectedMatchId}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium truncate pr-2">{getSourceTitle(match.sourceId)}</span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">{match.confidenceScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                 {match.explanation ?? 'Match explanation snippet...'}
              </p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Source Type: {sources.find(s => s.id === match.sourceId)?.type ?? 'N/A'}</span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs hover:bg-transparent">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Source
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">Match {Math.min(currentPage * itemsPerPage, matches.length)} of {matches.length}</span>
           <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
    </aside>
  );
};

export default ReportRightSidebar;