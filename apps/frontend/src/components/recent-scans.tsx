"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink } from "lucide-react"

// Sample data for demonstration
const recentScans = [
  {
    id: "123",
    title: "Novel Approach to Quantum Computing",
    date: "2023-11-15",
    status: "High Risk",
    similarity: 32,
  },
  {
    id: "122",
    title: "Effects of Climate Change on Marine Ecosystems",
    date: "2023-11-10",
    status: "Low Risk",
    similarity: 8,
  },
  {
    id: "121",
    title: "Advancements in Neural Network Architecture",
    date: "2023-11-05",
    status: "Medium Risk",
    similarity: 18,
  },
  {
    id: "120",
    title: "Genetic Markers for Alzheimer's Disease",
    date: "2023-10-28",
    status: "No Risk",
    similarity: 3,
  },
]

export function RecentScans() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "High Risk":
        return "destructive"
      case "Medium Risk":
        return "warning"
      case "Low Risk":
        return "secondary"
      case "No Risk":
        return "success"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Similarity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentScans.map((scan) => (
            <TableRow key={scan.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{scan.title}</span>
                </div>
              </TableCell>
              <TableCell>{scan.date}</TableCell>
              <TableCell>{scan.similarity}%</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(scan.status) as any}>{scan.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/results/${scan.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

