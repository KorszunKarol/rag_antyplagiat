"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RetroGrid } from "@/components/retro-grid"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-gray-900 relative overflow-hidden flex flex-col">
      <header className="border-b bg-[#f8f9fa]/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#f8f9fa]/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-30">
        <div className="flex h-16 items-center px-0 mx-auto w-full">
          <Link href="/" className="flex items-center gap-3 pl-4 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-2 rounded-lg shadow-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div className="font-bold text-xl tracking-tight">PlagiarismGuard</div>
          </Link>
        </div>
      </header>

      <div className="flex-grow relative flex items-center justify-center">
        <RetroGrid />
        <div className="relative z-10 container mx-auto max-w-7xl flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="researcher@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 mt-6">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Register
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

