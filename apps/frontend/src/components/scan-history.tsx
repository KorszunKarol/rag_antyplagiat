"use client"

import { useState } from "react"
import {
  FileText,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export function ScanHistory() {
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Mock data for the scan history
  const scans = [
    {
      id: "DOC-1234",
      title: "Research Paper on Climate Change.pdf",
      date: "2023-04-12",
      similarity: 32,
      status: "flagged",
      sources: 18,
    },
    {
      id: "DOC-1235",
      title: "Analysis of Economic Trends.pdf",
      date: "2023-04-10",
      similarity: 5,
      status: "clean",
      sources: 3,
    },
    {
      id: "DOC-1236",
      title: "Literature Review: Modern Poetry.pdf",
      date: "2023-04-08",
      similarity: 18,
      status: "flagged",
      sources: 12,
    },
    {
      id: "DOC-1237",
      title: "Introduction to Quantum Physics.pdf",
      date: "2023-04-05",
      similarity: 0,
      status: "clean",
      sources: 0,
    },
    {
      id: "DOC-1238",
      title: "Historical Analysis: World War II.pdf",
      date: "2023-04-03",
      similarity: 24,
      status: "flagged",
      sources: 15,
    },
    {
      id: "DOC-1239",
      title: "Marketing Strategies in Digital Age.pdf",
      date: "2023-04-01",
      similarity: 7,
      status: "clean",
      sources: 4,
    },
    {
      id: "DOC-1240",
      title: "Advancements in Artificial Intelligence.pdf",
      date: "2023-03-28",
      similarity: 42,
      status: "flagged",
      sources: 22,
    },
  ]

  // Filter scans based on status and search query
  const filteredScans = scans
    .filter((scan) => {
      const matchesStatus = filterStatus === "all" || scan.status === filterStatus
      const matchesSearch = scan.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDate = !date || new Date(scan.date).toDateString() === date.toDateString()
      return matchesStatus && matchesSearch && matchesDate
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === "similarity") {
        return sortOrder === "asc" ? a.similarity - b.similarity : b.similarity - a.similarity
      } else if (sortBy === "title") {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      }
      return 0
    })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "flagged":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
          >
            <AlertTriangle className="h-3 w-3" />
            Flagged
          </Badge>
        )
      case "clean":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
          >
            <CheckCircle className="h-3 w-3" />
            Clean
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity > 30) return "bg-gradient-to-r from-red-500 to-pink-500"
    if (similarity > 15) return "bg-gradient-to-r from-amber-500 to-orange-500"
    return "bg-gradient-to-r from-green-500 to-emerald-500"
  }

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  return (
    <div className="w-full p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8 w-full border-slate-200 dark:border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-slate-200 dark:border-slate-700">
                <Calendar className="h-4 w-4 mr-2" />
                {date ? date.toLocaleDateString() : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9 border-slate-200 dark:border-slate-700">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="clean">Clean</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 border-slate-200 dark:border-slate-700">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {filteredScans.length > 0 ? (
        <>
          <div className="rounded-2xl border overflow-hidden shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f8f9fa] dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-gray-800">
                  <TableHead className="font-semibold">Document</TableHead>
                  <TableHead className="font-semibold">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-semibold -ml-3"
                      onClick={() => toggleSort("date")}
                    >
                      Date
                      <ArrowUpDown className={`ml-1 h-3.5 w-3.5 ${sortBy === "date" ? "opacity-100" : "opacity-40"}`} />
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-semibold -ml-3"
                      onClick={() => toggleSort("similarity")}
                    >
                      Similarity
                      <ArrowUpDown
                        className={`ml-1 h-3.5 w-3.5 ${sortBy === "similarity" ? "opacity-100" : "opacity-40"}`}
                      />
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">Sources</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScans.map((scan) => (
                  <TableRow key={scan.id} className="hover:bg-[#f8f9fa] dark:hover:bg-gray-800/50 group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-700 p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div className="leading-tight">
                          <div className="font-medium">{scan.title}</div>
                          <div className="text-xs text-muted-foreground">{scan.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{new Date(scan.date).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-sm">{scan.similarity}%</div>
                        <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getSimilarityColor(scan.similarity)}`}
                            style={{ width: `${scan.similarity}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{scan.sources}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(scan.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-3.5 w-3.5" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-3.5 w-3.5" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{filteredScans.length}</strong> of <strong>{scans.length}</strong> documents
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" size="default" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive size="icon">
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="icon">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="icon">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" size="default" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        <div className="text-center py-12 border rounded-xl bg-[#f8f9fa]/50 dark:bg-gray-800/30">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No documents match your current search filters. Try changing your search or filter settings.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery("")
            setFilterStatus("all")
            setDate(undefined)
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}