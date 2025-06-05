"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"

function AuthButtonContent() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </Button>
    )
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/auth/login">Sign In</Link>
      </Button>
    )
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      // Clear client-side storage first
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()

        // Clear all cookies including Supabase auth cookies
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=")
          const name = eqPos > -1 ? c.substr(0, eqPos) : c
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
        })
      }

      // Sign out from Supabase
      await signOut()

      // Use router.push instead of window.location.href to allow middleware to handle the redirect properly
      router.push("/auth/login")
      router.refresh() // Force a refresh to clear any cached state
    } catch (error) {
      console.error("Logout error:", error)
      // Even on error, redirect to login
      router.push("/auth/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.user_metadata?.avatar_url || ""}
              alt={user.user_metadata?.name || user.email || ""}
            />
            <AvatarFallback>
              {user.user_metadata?.name?.charAt(0) ||
                user.email?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.name || user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.user_metadata?.role && (
              <p className="text-xs leading-none text-muted-foreground capitalize">
                Role: {user.user_metadata.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault()
            handleLogout()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UserAuthButton() {
  return (
    <ClientOnly
      fallback={
        <Button variant="ghost" size="sm" disabled>
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        </Button>
      }
    >
      <AuthButtonContent />
    </ClientOnly>
  )
}
