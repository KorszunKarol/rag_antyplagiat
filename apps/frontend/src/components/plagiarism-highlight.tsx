"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink } from "lucide-react"

interface Source {
  id: string
  title: string
  authors: string
  publication: string
  year: number
  url: string
}

interface HighlightedSection {
  start: number
  end: number
  source: Source
}

interface PlagiarismHighlightProps {
  content: string
  highlightedSections: HighlightedSection[]
}

export function PlagiarismHighlight({ content, highlightedSections }: PlagiarismHighlightProps) {
  const [activeSource, setActiveSource] = useState<Source | null>(null)

  // Function to render the content with highlighted sections
  const renderHighlightedContent = () => {
    let lastIndex = 0
    const result = []

    // Sort highlighted sections by start index
    const sortedSections = [...highlightedSections].sort((a, b) => a.start - b.start)

    for (const section of sortedSections) {
      // Add non-highlighted text before this section
      if (section.start > lastIndex) {
        result.push(
          <span key={`text-${lastIndex}`} className="text-foreground">
            {content.substring(lastIndex, section.start)}
          </span>,
        )
      }

      // Add highlighted section
      result.push(
        <TooltipProvider key={`highlight-${section.start}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="bg-red-100 text-red-900 cursor-pointer px-0.5 rounded"
                onClick={() => setActiveSource(section.source)}
              >
                {content.substring(section.start, section.end)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="text-xs space-y-1">
                <p className="font-semibold">{section.source.title}</p>
                <p>{section.source.authors}</p>
                <p className="text-muted-foreground">
                  {section.source.publication}, {section.source.year}
                </p>
                <a
                  href={section.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  View source <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      )

      lastIndex = section.end
    }

    // Add remaining non-highlighted text
    if (lastIndex < content.length) {
      result.push(
        <span key={`text-${lastIndex}`} className="text-foreground">
          {content.substring(lastIndex)}
        </span>,
      )
    }

    return result
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 text-sm whitespace-pre-line leading-relaxed">
        {renderHighlightedContent()}
      </div>

      {activeSource && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-900">Source Information</h4>
              <p className="text-sm font-medium">{activeSource.title}</p>
              <p className="text-sm">{activeSource.authors}</p>
              <p className="text-sm text-muted-foreground">
                {activeSource.publication}, {activeSource.year}
              </p>
              <a
                href={activeSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-primary hover:underline"
              >
                View original source <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

