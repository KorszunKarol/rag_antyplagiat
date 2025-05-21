"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import {
  FileText,
  Upload,
  X,
  AlertTriangle,
  Info,
  Check,
  Loader2,
  SlidersHorizontal,
  BarChart3,
  Globe,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function UploadPaper() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [scanType, setScanType] = useState("standard")
  const [isComplete, setIsComplete] = useState(false)
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    setIsUploading(true)
    setIsComplete(false)
    setGeneratedReportId(null)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        // Simulate processing delay
        setTimeout(() => {
          setIsUploading(false)
          // Generate random ID for prototype
          const randomId = `proto-${Math.random().toString(36).substring(2, 9)}`;
          setGeneratedReportId(randomId);
          setIsComplete(true)
        }, 500)
      }
    }, 150)
  }

  const resetUpload = () => {
    setFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setIsComplete(false)
    setGeneratedReportId(null)
  }

  /**
   * Navigates to the generated report page.
   */
  const handleViewReport = () => {
    if (generatedReportId) {
        router.push(`/report/${generatedReportId}`);
    }
  };

  return (
    <div className="w-full p-6 max-w-5xl mx-auto">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-muted/50">
          <TabsTrigger value="upload" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            Upload File
          </TabsTrigger>
          <TabsTrigger value="options" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            Scan Options
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-12 transition-colors ${
                isDragging ? "border-slate-500 bg-slate-50 dark:bg-slate-900/20" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-500/10 to-slate-700/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="h-12 w-12 text-slate-700 dark:text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200">
                  Drag and drop your PDF file
                </h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-md">
                  Upload your document to check for plagiarism against our extensive database of academic papers,
                  journals, and web content
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="px-8 bg-slate-700 hover:bg-slate-800 text-white shadow-md transition-all hover:shadow-lg rounded-xl"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-6">Supported file types: PDF (Max size: 20MB)</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-2xl p-8 shadow-sm bg-[#f8f9fa] dark:bg-gray-800/50">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-500/10 to-slate-700/10 flex items-center justify-center mb-4">
                    <Loader2 className="h-10 w-10 text-slate-700 dark:text-slate-400 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Processing your document...</h3>
                  <div className="w-full max-w-md mb-2">
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : "Analyzing document for plagiarism..."}
                  </p>
                </div>
              ) : isComplete ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center mb-4">
                    <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Scan Complete!</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your document has been successfully analyzed. View the detailed report to see the results.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={resetUpload}>
                      <X className="mr-2 h-4 w-4" />
                      New Scan
                    </Button>
                    <Button
                      className="bg-slate-700 hover:bg-slate-800 text-white shadow-md transition-all hover:shadow-lg"
                      onClick={handleViewReport}
                      disabled={!generatedReportId}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-500/10 to-slate-700/10 flex items-center justify-center mb-4">
                    <FileText className="h-10 w-10 text-slate-700 dark:text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{file.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={() => setFile(null)}>
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                    <Button
                      onClick={handleUpload}
                      className="bg-slate-700 hover:bg-slate-800 text-white shadow-md transition-all hover:shadow-lg"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload and Scan
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <Alert className="mt-6 border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-gray-800/50 text-slate-800 dark:text-slate-300 rounded-xl">
            <Info className="h-4 w-4" />
            <AlertTitle>Scan Information</AlertTitle>
            <AlertDescription>
              Your document will be checked against our database of over 90 million academic papers, books, and web
              sources.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="options">
          <div className="border rounded-2xl p-8 shadow-sm bg-[#f8f9fa] dark:bg-gray-800/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-8 text-slate-800 dark:text-slate-200">Scan Configuration</h3>

            <div className="space-y-8 max-w-3xl">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <label className="text-sm font-medium flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-md">
                        <SlidersHorizontal className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      </span>
                      Scan Type
                    </label>
                    <Select value={scanType} onValueChange={setScanType}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-gray-800/80">
                        <SelectValue placeholder="Select scan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Scan</SelectItem>
                        <SelectItem value="thorough">Thorough Scan</SelectItem>
                        <SelectItem value="quick">Quick Scan</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                      {scanType === "standard" && "Balanced scan checking against major academic sources."}
                      {scanType === "thorough" && "In-depth scan that takes longer but checks more sources."}
                      {scanType === "quick" && "Fast scan that checks only against the most common sources."}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <label className="text-sm font-medium flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
                      <span className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-md">
                        <BarChart3 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      </span>
                      Sensitivity Level
                    </label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-gray-800/80">
                        <SelectValue placeholder="Select sensitivity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2 pl-1">
                      Determines how strict the plagiarism detection will be
                    </p>
                  </div>
                </div>

                {/* The following div containing 'Content Sources' and 'Advanced Options' will be removed */}
                {/* <div className="space-y-4"> ... entire div ... </div> */}

              </div>

            </div> {/* Closes the max-w-3xl container */}

            {/* Buttons container - outside max-w-3xl, inside main card */}
            <div className="pt-4 flex justify-end gap-3">
              <Button variant="outline">Reset to Defaults</Button>
              <Button className="bg-slate-700 hover:bg-slate-800 text-white shadow-md transition-all hover:shadow-lg">
                Save Preferences
              </Button>
            </div>

          </div> {/* This closes the main card div */}
        </TabsContent>
      </Tabs>
    </div>
  )
}