"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { UserAuthButton } from "@/components/user-auth-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Menu, Search, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:max-w-none">
            <DashboardSidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">NEXUS</span>
          </Link>
        </div>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-8 md:w-[200px] lg:w-[300px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <UserAuthButton />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <DashboardSidebar />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
