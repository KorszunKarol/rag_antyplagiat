"use client"

import { useTheme } from "next-themes"
import { FileText, History, HelpCircle, Settings, Bell, Sun, Moon, Search, User, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { UploadPaper } from "@/components/upload-paper"
import { ScanHistory } from "@/components/scan-history"
import { MetricCards } from "@/components/metric-cards"
import { RetroGrid } from "@/components/retro-grid"

export default function DashboardPage() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-gray-900 relative overflow-hidden">
      <RetroGrid />

      <div className="relative z-10 w-full mx-auto">
        <header className="border-b bg-[#f8f9fa]/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#f8f9fa]/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-30">
          <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-6xl">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-2 rounded-lg shadow-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div className="font-bold text-xl tracking-tight">PlagiarismGuard</div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-700 text-white">DR</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="container px-4 py-6 mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Monitor and manage plagiarism detection</p>
            </div>
          </div>

          <MetricCards />

          <Tabs defaultValue="upload" className="w-full mt-8">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md">
                <TabsTrigger
                  value="upload"
                  className="flex items-center data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Paper
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  <History className="mr-2 h-4 w-4" />
                  Scan History
                </TabsTrigger>
              </TabsList>


            </div>

            <TabsContent value="upload">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border shadow-xl">
                <UploadPaper />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border shadow-xl">
                <ScanHistory />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

