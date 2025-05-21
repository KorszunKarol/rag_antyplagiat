"use client"

import Link from "next/link"
import { FileText } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { RetroGrid } from "@/components/retro-grid"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-gray-900 relative overflow-hidden flex flex-col">
      <header className="border-b bg-[#f8f9fa]/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#f8f9fa]/60 dark:supports-[backdrop-filter]:bg-gray-900/60 sticky top-0 z-50">
        <div className="flex h-16 items-center px-0 mx-auto w-full">
          <Link href="/" className="flex items-center gap-3 pl-4 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white p-2 rounded-lg shadow-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div className="font-bold text-xl tracking-tight">PlagiarismGuard</div>
          </Link>
          <nav className="ml-auto flex items-center gap-4 pr-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow relative">
        {/* Aurora Background Effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className={cn(
              `absolute inset-0 overflow-hidden
              [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
              [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
              [background-image:var(--white-gradient),var(--aurora)]
              dark:[background-image:var(--dark-gradient),var(--aurora)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              filter blur-[10px] invert dark:invert-0
              after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
              after:dark:[background-image:var(--dark-gradient),var(--aurora)]
              after:[background-size:200%,_100%]
              after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
              pointer-events-none opacity-50 will-change-transform
              [mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>

        {/* RetroGrid */}
        <RetroGrid className="z-10" />

        {/* Main Content */}
        <div className="relative z-20 container mx-auto max-w-7xl grid items-center gap-6 px-4 py-12 md:py-24 lg:py-32 xl:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mx-auto max-w-[800px] space-y-4 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Advanced Plagiarism Detection for Scientific Research
            </h1>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
              Ensure academic integrity with our powerful AI-driven plagiarism detection system designed specifically
              for scientific papers.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex justify-center gap-4 pt-4"
            >
              <Link href="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

