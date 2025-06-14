"use client"

// Prevent static generation
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function ClearSessionPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [isCleared, setIsCleared] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const clearSession = async () => {
    setIsClearing(true)
    setError("")

    try {
      const supabase = createClient()
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear all cookies manually
      if (typeof window !== 'undefined') {
        // Get all cookies
        const cookies = document.cookie.split(';')
        
        // Clear each cookie
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          
          // Clear for current domain
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`
        })
        
        // Clear localStorage and sessionStorage
        localStorage.clear()
        sessionStorage.clear()
      }
      
      setIsCleared(true)
      setIsClearing(false)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login?message=Session cleared successfully')
      }, 2000)
      
    } catch (err: any) {
      console.error("Error clearing session:", err)
      setError("Failed to clear session. Please try manually clearing your browser data.")
      setIsClearing(false)
    }
  }

  // Auto-clear on page load
  useEffect(() => {
    clearSession()
  }, [])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Clearing Session</CardTitle>
            <CardDescription className="text-center">
              Removing corrupted authentication data...
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isCleared && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Session cleared successfully! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}
            
            {isClearing && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">
                  Clearing cookies and session data...
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This will clear:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>All authentication cookies</li>
                <li>Local storage data</li>
                <li>Session storage data</li>
                <li>Supabase session tokens</li>
              </ul>
            </div>
            
            {!isClearing && !isCleared && (
              <Button onClick={clearSession} className="w-full">
                Clear Session Manually
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}