"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface Source {
  id: string
  title: string
  authors: string
  publication: string
  year: number
  similarity: number
  matchedWords: number
  url: string
}

interface SourcesListProps {
  sources: Source[]
}

export function SourcesList({ sources }: SourcesListProps) {
  // Sort sources by similarity (highest first)
  const sortedSources = [...sources].sort((a, b) => b.similarity - a.similarity)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Publication</TableHead>
          <TableHead>Similarity</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedSources.map((source) => (
          <TableRow key={source.id}>
            <TableCell>
              <div className="space-y-1">
                <p className="font-medium">{source.title}</p>
                <p className="text-sm text-muted-foreground">{source.authors}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <p className="text-sm">{source.publication}</p>
                <p className="text-sm text-muted-foreground">{source.year}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{source.similarity}%</span>
                  <span className="text-xs text-muted-foreground">{source.matchedWords} words</span>
                </div>
                <Progress value={source.similarity} className="h-2" />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Button>
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

