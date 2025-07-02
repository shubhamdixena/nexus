"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/hooks/use-permissions"
import { ClientOnly } from "@/components/client-only"
import {
  BarChart3,
  BookOpen,
  Calendar,
  CalendarDays,
  FileText,
  GraduationCap,
  Home,
  Settings,
  User,
  ClipboardList,
} from "lucide-react"

const links = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Application Manager", href: "/applications", icon: ClipboardList },
  { name: "Universities", href: "/universities", icon: GraduationCap },
  { name: "MBA Schools", href: "/mba-schools", icon: BookOpen },
  { name: "Scholarships", href: "/scholarships", icon: BarChart3 },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "NEXUS Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Knowledge Base", href: "/knowledge-base", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings, admin: true }, // Only show to admins
]

function SidebarContent() {
  const pathname = usePathname()
  const { isAdmin, loading } = usePermissions()

  // Show loading skeleton while permissions are being fetched
  if (loading) {
    return (
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {links.filter(link => !link.admin).map((link) => {
          const LinkIcon = link.icon
          return (
            <div
              key={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground"
            >
              <LinkIcon className="h-4 w-4" />
              {link.name}
            </div>
          )
        })}
      </nav>
    )
  }

  // Filter links based on admin status
  const visibleLinks = links.filter(link => {
    if (link.admin) {
      return isAdmin
    }
    return true
  })

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {visibleLinks.map((link) => {
        const LinkIcon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === link.href && "bg-muted text-foreground",
            )}
          >
            <LinkIcon className="h-4 w-4" />
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardSidebar() {
  return (
    <div className="flex h-full w-full flex-col bg-muted/40">
      <div className="flex-1 overflow-auto py-2">
        <ClientOnly>
          <SidebarContent />
        </ClientOnly>
      </div>
    </div>
  )
}
