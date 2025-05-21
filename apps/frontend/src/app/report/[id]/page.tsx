"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  FileText,
  ArrowLeft,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Globe,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  SlidersHorizontal,
  Printer,
  Copy,
  Info,
  BarChart2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Import the RetroGrid component
import { RetroGrid } from "@/components/retro-grid"

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const [activeMatch, setActiveMatch] = useState(0)
  const [excludeQuotes, setExcludeQuotes] = useState(true)
  const [excludeBibliography, setExcludeBibliography] = useState(true)
  const [sourceFilter, setSourceFilter] = useState("all")
  const [similarityThreshold, setSimilarityThreshold] = useState(0)
  const [textSize, setTextSize] = useState("base")

  // Mock data for the analysis
  const documentData = {
    id: params.id,
    title: "Research Paper on Climate Change.pdf",
    author: "John Smith",
    date: "2023-04-12",
    overallSimilarity: 32,
    wordCount: 4582,
    status: "flagged",
    matches: [
      {
        id: 1,
        text: "Climate change is one of the most pressing issues of our time, with far-reaching implications for ecosystems, economies, and human societies worldwide.",
        similarity: 92,
        source: {
          title: "Global Climate Change: Causes, Effects, and Solutions",
          url: "https://example.com/climate-research/global-climate-change",
          type: "academic",
          author: "Dr. Emily Johnson",
          date: "2022-08-15",
          publication: "Journal of Environmental Science",
        },
        location: {
          page: 1,
          paragraph: 2,
          startOffset: 120,
          endOffset: 250,
        },
      },
      {
        id: 2,
        text: "The Intergovernmental Panel on Climate Change (IPCC) has concluded that human activities are the dominant cause of observed warming since the mid-20th century.",
        similarity: 85,
        source: {
          title: "IPCC Sixth Assessment Report",
          url: "https://example.com/ipcc/ar6",
          type: "academic",
          author: "IPCC",
          date: "2021-08-09",
          publication: "Intergovernmental Panel on Climate Change",
        },
        location: {
          page: 2,
          paragraph: 1,
          startOffset: 50,
          endOffset: 180,
        },
      },
      {
        id: 3,
        text: "Rising global temperatures have been linked to changes in precipitation patterns, more frequent and intense weather events, and rising sea levels.",
        similarity: 78,
        source: {
          title: "Climate Change Impacts on Weather Patterns",
          url: "https://example.com/weather/climate-impacts",
          type: "website",
          author: "National Weather Service",
          date: "2023-01-20",
          publication: "Weather.gov",
        },
        location: {
          page: 3,
          paragraph: 4,
          startOffset: 210,
          endOffset: 320,
        },
      },
      {
        id: 4,
        text: "Mitigation strategies include transitioning to renewable energy sources, improving energy efficiency, and implementing carbon capture technologies.",
        similarity: 65,
        source: {
          title: "Climate Change Mitigation Strategies",
          url: "https://example.com/climate/mitigation",
          type: "website",
          author: "Environmental Protection Agency",
          date: "2022-11-05",
          publication: "EPA.gov",
        },
        location: {
          page: 5,
          paragraph: 2,
          startOffset: 150,
          endOffset: 260,
        },
      },
      {
        id: 5,
        text: "Adaptation measures are necessary to address the unavoidable impacts of climate change, including infrastructure improvements, agricultural adjustments, and ecosystem conservation.",
        similarity: 58,
        source: {
          title: "Adapting to a Changing Climate",
          url: "https://example.com/climate/adaptation",
          type: "journal",
          author: "Dr. Robert Chen",
          date: "2022-06-18",
          publication: "Climate Policy Journal",
        },
        location: {
          page: 6,
          paragraph: 3,
          startOffset: 180,
          endOffset: 320,
        },
      },
    ],
    sourceBreakdown: [
      { type: "Academic Journals", percentage: 42 },
      { type: "Websites", percentage: 28 },
      { type: "Books", percentage: 15 },
      { type: "Student Papers", percentage: 10 },
      { type: "Other Sources", percentage: 5 },
    ],
    documentContent: `
      <h1>Research Paper on Climate Change</h1>
      <h2>Abstract</h2>
      <p>This paper examines the current state of climate change research, focusing on causes, effects, and potential solutions. Through a comprehensive literature review, we analyze the scientific consensus and explore policy implications.</p>

      <h2>Introduction</h2>
      <p><span>Climate change is one of the most pressing issues of our time, with far-reaching implications for ecosystems, economies, and human societies worldwide.</span> Understanding the complex dynamics of climate systems and the anthropogenic factors that influence them is crucial for developing effective mitigation and adaptation strategies.</p>

      <h2>Scientific Consensus</h2>
      <p><span>The Intergovernmental Panel on Climate Change (IPCC) has concluded that human activities are the dominant cause of observed warming since the mid-20th century.</span> This conclusion is supported by multiple lines of evidence, including temperature records, atmospheric and oceanic measurements, and climate modeling.</p>

      <h2>Observed Effects</h2>
      <p>The effects of climate change are already observable across the globe. <span>Rising global temperatures have been linked to changes in precipitation patterns, more frequent and intense weather events, and rising sea levels.</span> These changes have significant implications for biodiversity, agriculture, water resources, and human health.</p>

      <h2>Mitigation Strategies</h2>
      <p>Addressing climate change requires a multi-faceted approach to reduce greenhouse gas emissions and enhance carbon sinks. <span>Mitigation strategies include transitioning to renewable energy sources, improving energy efficiency, and implementing carbon capture technologies.</span> International cooperation and policy frameworks, such as the Paris Agreement, play a crucial role in coordinating global efforts.</p>

      <h2>Adaptation Measures</h2>
      <p><span>Adaptation measures are necessary to address the unavoidable impacts of climate change, including infrastructure improvements, agricultural adjustments, and ecosystem conservation.</span> Developing resilient communities and systems is essential, particularly for vulnerable populations and regions.</p>

      <h2>Conclusion</h2>
      <p>Climate change presents one of the greatest challenges of the 21st century. Addressing this challenge requires coordinated action at local, national, and international levels, informed by robust scientific understanding and guided by principles of sustainability and equity.</p>

      <h2>References</h2>
      <p>IPCC. (2021). Sixth Assessment Report. Intergovernmental Panel on Climate Change.</p>
      <p>Johnson, E. (2022). Global Climate Change: Causes, Effects, and Solutions. Journal of Environmental Science.</p>
      <p>National Weather Service. (2023). Climate Change Impacts on Weather Patterns. Weather.gov.</p>
      <p>Environmental Protection Agency. (2022). Climate Change Mitigation Strategies. EPA.gov.</p>
      <p>Chen, R. (2022). Adapting to a Changing Climate. Climate Policy Journal.</p>
    `,
  }

  // Filter matches based on user settings
  const filteredMatches = documentData.matches.filter((match) => {
    // Filter by source type
    if (sourceFilter !== "all" && match.source.type !== sourceFilter) {
      return false
    }

    // Filter by similarity threshold
    if (match.similarity < similarityThreshold) {
      return false
    }

    return true
  })

  // Get source icon based on type
  const getSourceIcon = (type: string) => {
    switch (type) {
      case "academic":
        return <GraduationCap className="h-4 w-4" />
      case "website":
        return <Globe className="h-4 w-4" />
      case "journal":
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Get similarity color based on percentage
  const getSimilarityColor = (similarity: number) => {
    if (similarity > 80) return "text-red-600 dark:text-red-400"
    if (similarity > 60) return "text-amber-600 dark:text-amber-400"
    if (similarity > 40) return "text-yellow-600 dark:text-yellow-400"
    return "text-green-600 dark:text-green-400"
  }

  // Get similarity badge based on percentage
  const getSimilarityBadge = (similarity: number) => {
    if (similarity > 80) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
        >
          High Match ({similarity}%)
        </Badge>
      )
    }
    if (similarity > 60) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30"
        >
          Moderate Match ({similarity}%)
        </Badge>
      )
    }
    if (similarity > 40) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30"
        >
          Low Match ({similarity}%)
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
      >
        Minor Match ({similarity}%)
      </Badge>
    )
  }

  // Navigate to next/previous match
  const navigateMatch = (direction: "next" | "prev") => {
    if (direction === "next" && activeMatch < filteredMatches.length - 1) {
      setActiveMatch(activeMatch + 1)
    } else if (direction === "prev" && activeMatch > 0) {
      setActiveMatch(activeMatch - 1)
    }
  }

  // Highlight matches in document content
  const highlightMatches = () => {
    let content = documentData.documentContent

    // Replace match text with highlighted version
    documentData.matches.forEach((match, index) => {
      const isActive = index === activeMatch
      const className = isActive
        ? "bg-yellow-200 dark:bg-yellow-900/50 px-1 py-0.5 rounded-md border border-yellow-400 dark:border-yellow-700"
        : "bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded-md"

      content = content.replace(
        `<span>${match.text}</span>`,
        `<span class="${className}" data-match-id="${match.id}">${match.text}</span>`,
      )
    })

    return content
  }

  return (
    <div className="relative min-h-screen">
      {/* Add the RetroGrid component here */}
      <RetroGrid />

      {/* Header and Main content should be relative to place them above the grid */}
      <div className="relative z-10">
        <header className="border-b bg-[#f8f9fa]/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#f8f9fa]/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-30">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-slate-700 dark:text-slate-300"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-slate-700 p-2 rounded-lg shadow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-lg leading-none">{documentData.title}</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Analyzed on {new Date(documentData.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Printer className="h-4 w-4" />
                      <span className="sr-only">Print</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Print report</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy link</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy link to report</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>

              <Button className="bg-slate-700 hover:bg-slate-800 text-white">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Reviewed
              </Button>
            </div>
          </div>
        </header>

        <main className="container px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Summary and controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Overall similarity card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <h2 className="text-lg font-semibold">Similarity Score</h2>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-slate-100 dark:text-slate-800 stroke-current"
                        strokeWidth="10"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-amber-500 stroke-current"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${documentData.overallSimilarity * 2.51} 251`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold">{documentData.overallSimilarity}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">Matches</p>
                    <p className="text-2xl font-bold mt-1">{documentData.matches.length}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg shadow-sm text-center">
                    <p className="text-sm text-muted-foreground">Words</p>
                    <p className="text-2xl font-bold mt-1">{documentData.wordCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Filters card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    Reset
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="similarity-threshold">Similarity Threshold</Label>
                      <span className="text-xs text-muted-foreground">{similarityThreshold}%</span>
                    </div>
                    <input
                      id="similarity-threshold"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={similarityThreshold}
                      onChange={(e) => setSimilarityThreshold(Number.parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match navigation (mobile only) */}
              <div className="lg:hidden bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => navigateMatch("prev")} disabled={activeMatch === 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Match {activeMatch + 1} of {filteredMatches.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMatch("next")}
                    disabled={activeMatch === filteredMatches.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right column - Document and matches */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="document" className="w-full">
                <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md">
                  <TabsTrigger
                    value="document"
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Document View
                  </TabsTrigger>
                  <TabsTrigger
                    value="side-by-side"
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Side-by-Side Comparison
                  </TabsTrigger>
                </TabsList>

                {/* Document View Tab */}
                <TabsContent value="document">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                    {/* Document content - Keep wide */}
                    <div className="md:col-span-4 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Document Content</h2>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                                Text Size
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setTextSize("sm")}>
                                Small
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setTextSize("base")}>
                                Medium
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setTextSize("lg")}>
                                Large
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <Alert className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Highlighted Text</AlertTitle>
                        <AlertDescription>
                          Highlighted sections indicate potential matches with external sources.
                        </AlertDescription>
                      </Alert>

                      <ScrollArea className="h-[600px] rounded-md border p-4">
                        <div
                          className={`prose prose-${textSize} prose-slate dark:prose-invert max-w-none`}
                          dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                        />
                      </ScrollArea>
                    </div>

                    {/* Matches list - Give slightly more space */}
                    <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-2xl border shadow-sm">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold">Matches ({filteredMatches.length})</h2>
                        </div>
                      </div>

                      <ScrollArea className="h-[600px]">
                        <div className="space-y-1 p-1">
                          {filteredMatches.length > 0 ? (
                            filteredMatches.map((match, index) => (
                              <div
                                key={match.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                  index === activeMatch
                                    ? "bg-slate-100 dark:bg-slate-700/50 border-l-2 border-slate-700 dark:border-slate-400"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                }`}
                                onClick={() => setActiveMatch(index)}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    {getSourceIcon(match.source.type)}
                                    <span className="text-sm font-medium truncate max-w-[150px]">
                                      {match.source.title}
                                    </span>
                                  </div>
                                  <span className={`text-sm font-semibold ${getSimilarityColor(match.similarity)}`}>
                                    {match.similarity}%
                                  </span>
                                </div>

                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{match.text}</p>

                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    Page {match.location.page}, Para {match.location.paragraph}
                                  </span>
                                  <Button variant="ghost" size="sm" className="h-6 text-xs p-0">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Source
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <h3 className="text-lg font-semibold mb-1">No matches found</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Try adjusting your filters to see more results
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSourceFilter("all")
                                  setSimilarityThreshold(0)
                                }}
                              >
                                Reset Filters
                              </Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      {filteredMatches.length > 0 && (
                        <div className="p-3 border-t flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMatch("prev")}
                            disabled={activeMatch === 0}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <span className="text-sm">
                            Match {activeMatch + 1} of {filteredMatches.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMatch("next")}
                            disabled={activeMatch === filteredMatches.length - 1}
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Side-by-Side Comparison Tab */}
                <TabsContent value="side-by-side">
                  {filteredMatches.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm">
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-semibold">Side-by-Side Comparison</h2>
                            <p className="text-sm text-muted-foreground">
                              Comparing with {filteredMatches[activeMatch].source.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateMatch("prev")}
                              disabled={activeMatch === 0}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateMatch("next")}
                              disabled={activeMatch === filteredMatches.length - 1}
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                        {/* Your document */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-medium">Your Document</h3>
                            {getSimilarityBadge(filteredMatches[activeMatch].similarity)}
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border">
                            <p className={`text-${textSize}`}>
                              <span className="bg-yellow-200 dark:bg-yellow-900/50 px-1 py-0.5 rounded-md border border-yellow-400 dark:border-yellow-700">
                                {filteredMatches[activeMatch].text}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Page {filteredMatches[activeMatch].location.page}, Paragraph{" "}
                              {filteredMatches[activeMatch].location.paragraph}
                            </p>
                          </div>
                        </div>

                        {/* Source document */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-base font-medium">{filteredMatches[activeMatch].source.title}</h3>
                              <p className="text-xs text-muted-foreground">
                                {filteredMatches[activeMatch].source.author} •{" "}
                                {new Date(filteredMatches[activeMatch].source.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8">
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Visit Source
                            </Button>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border">
                            <p className={`text-${textSize}`}>{filteredMatches[activeMatch].text}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {filteredMatches[activeMatch].source.publication}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <p className="text-sm">
                            This match has a{" "}
                            <span className="font-medium">{filteredMatches[activeMatch].similarity}%</span> similarity
                            score. Consider reviewing and citing this source appropriately.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3">
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No matches to compare</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                          There are no matches that meet your current filter criteria. Try adjusting your filters to see
                          more results.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSourceFilter("all")
                            setSimilarityThreshold(0)
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

