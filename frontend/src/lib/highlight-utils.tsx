import React from 'react';
import { type LlmMatch } from './mock-report-data'; // Assuming types are in the same dir or adjust path
import { cn } from "@/lib/utils"; // Assuming you have a cn utility

/**
 * Helper function to get Tailwind CSS classes based on match type and interaction state.
 * @param matchType The type of the match ('exact', 'paraphrase', 'ai').
 * @param isSelected Is the match currently selected?
 * @param isSourceActive Is the source related to this match currently active?
 * @returns A string of Tailwind CSS classes.
 */
const getHighlightClasses = (
  matchType: LlmMatch['matchType'],
  isSelected: boolean,
  isSourceActive: boolean
): string => {
  let baseClass = 'px-0.5 mx-[-0.5px] rounded'; // Slight horizontal padding/margin for better visual separation
  let typeClass = '';

  switch (matchType) {
    case 'exact':
      typeClass = 'bg-red-200 dark:bg-red-700/50';
      break;
    case 'paraphrase':
      typeClass = 'bg-yellow-200 dark:bg-yellow-700/50';
      break;
    case 'ai':
      typeClass = 'bg-blue-200 dark:bg-blue-700/50';
      break;
    default:
      typeClass = 'bg-gray-200 dark:bg-gray-700/50';
  }

  const interactionClass = isSelected
    ? 'ring-2 ring-offset-1 ring-primary dark:ring-offset-black' // Prominent ring for selected match
    : isSourceActive
    ? 'underline decoration-dashed decoration-primary decoration-1 underline-offset-2' // Subtle underline for matches of the active source
    : '';

  return cn(baseClass, typeClass, interactionClass);
};

/**
 * Generates an array of strings and React elements to render text with highlighted matches.
 *
 * @param text The full document text.
 * @param matches An array of LlmMatch objects, assumed to be potentially overlapping.
 * @param activeSourceId The ID of the currently active source in the UI.
 * @param selectedMatchId The ID of the currently selected match.
 * @param onMatchHover Callback function when a match is hovered.
 * @param onMatchClick Callback function when a match is clicked.
 * @returns An array of strings and ReactElement spans representing the text.
 */
export const highlightText = (
  text: string,
  matches: LlmMatch[],
  activeSourceId: string | null,
  selectedMatchId: string | null,
  onMatchHover: (matchId: string | null) => void,
  onMatchClick: (match: LlmMatch) => void
): (string | React.ReactElement)[] => {
  if (!matches || matches.length === 0) {
    return [text];
  }

  // Sort matches by start index, then by end index (longest first for overlaps)
  const sortedMatches = [...matches].sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    return b.endIndex - a.endIndex; // Longer matches first at same start
  });

  const result: (string | React.ReactElement)[] = [];
  let lastIndex = 0;

  sortedMatches.forEach((match) => {
    // Skip matches that are completely contained within the previous rendered match
    if (match.startIndex < lastIndex) {
        // If it starts before the last index but ends after, adjust its start index
        // This handles partial overlaps where the current match starts inside the previous one
        // but extends further. We only render the part extending beyond.
        if (match.endIndex > lastIndex) {
            match.startIndex = lastIndex;
        } else {
            // Completely contained, skip this match
            return;
        }
    }

    // Add text before the current match
    if (match.startIndex > lastIndex) {
      result.push(text.substring(lastIndex, match.startIndex));
    }

    // Add the highlighted match span
    const isSelected = match.id === selectedMatchId;
    const isSourceActive = match.sourceId === activeSourceId;
    const highlightClasses = getHighlightClasses(match.matchType, isSelected, isSourceActive);

    result.push(
      <span
        key={match.id}
        className={highlightClasses}
        data-match-id={match.id}
        data-source-id={match.sourceId}
        onMouseEnter={() => onMatchHover(match.id)}
        onMouseLeave={() => onMatchHover(null)}
        onClick={() => onMatchClick(match)}
        role="button"
        tabIndex={0}
        aria-label={`Match type ${match.matchType}, click for details`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMatchClick(match); }}
      >
        {text.substring(match.startIndex, match.endIndex)}
      </span>
    );

    lastIndex = match.endIndex;
  });

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
};