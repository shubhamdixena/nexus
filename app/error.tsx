"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { useRouter } from "next/navigation"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to monitoring service
    console.error("Page Error:", error)
    
    // You can integrate with error reporting services here
    // e.g., Sentry, LogRocket, Bugsnag, etc.
    if (typeof window !== "undefined") {
      // Report to external service
      reportError(error, {
        context: "page-error",
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        timestamp: new Date().toISOString(),
      })
    }
  }, [error])

  const handleGoHome = () => {
    router.push("/")
  }

  const handleReset = () => {
    reset()
  }

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Oops! Something went wrong
          </CardTitle>
          <CardDescription className="text-lg">
            We encountered an unexpected error. Our team has been notified and we're working to fix it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDevelopment && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="h-4 w-4 text-destructive" />
                <h4 className="text-sm font-medium text-destructive">
                  Error Details (Development Mode)
                </h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Message:</p>
                  <p className="text-sm text-destructive">{error.message}</p>
                </div>
                {error.digest && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Error ID:</p>
                    <p className="text-sm font-mono text-destructive">{error.digest}</p>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Stack trace:</p>
                    <pre className="text-xs text-destructive whitespace-pre-wrap break-words max-h-32 overflow-y-auto bg-background p-2 rounded border">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleReset} className="flex-1" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={handleReload} variant="outline" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            If this problem persists, please contact our support team.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error reporting function (you can integrate with your preferred service)
function reportError(error: Error, context: Record<string, any>) {
  // Integration point for error reporting services
  // Examples: Sentry, LogRocket, Bugsnag, etc.
  
  const errorReport = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  }
  
  // For now, log to console
  console.error("Error Report:", errorReport)
  
  // Example Sentry integration:
  // if (typeof window !== "undefined" && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context })
  // }
} 