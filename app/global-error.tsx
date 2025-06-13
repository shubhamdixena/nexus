"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global Error:", error)
    
    // Report critical errors to monitoring service
    if (typeof window !== "undefined") {
      reportCriticalError(error, {
        context: "global-error",
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        timestamp: new Date().toISOString(),
      })
    }
  }, [error])

  const handleReset = () => {
    reset()
  }

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Application Error
              </CardTitle>
              <CardDescription className="text-gray-600">
                We're experiencing technical difficulties. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleReset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={handleReload} variant="outline" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                Error ID: {error.digest || "Unknown"}
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}

function reportCriticalError(error: Error, context: Record<string, any>) {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    severity: "critical",
    ...context,
  }
  
  console.error("Critical Error Report:", errorReport)
  
  // Send to external monitoring service
  // Example: Sentry, LogRocket, etc.
} 