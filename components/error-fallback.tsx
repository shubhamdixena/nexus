"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, Wifi, Database } from "lucide-react"
import { useRouter } from "next/navigation"

export interface ErrorFallbackProps {
  error: Error
  reset?: () => void
  goBack?: () => void
  goHome?: () => void
  variant?: "default" | "compact" | "minimal" | "page"
  showErrorDetails?: boolean
  title?: string
  message?: string
  actionLabel?: string
}

export function ErrorFallback({
  error,
  reset,
  goBack,
  goHome,
  variant = "default",
  showErrorDetails = false,
  title,
  message,
  actionLabel = "Try Again"
}: ErrorFallbackProps) {
  const router = useRouter()

  const handleGoHome = () => {
    if (goHome) {
      goHome()
    } else {
      router.push("/")
    }
  }

  const handleGoBack = () => {
    if (goBack) {
      goBack()
    } else if (typeof window !== "undefined") {
      window.history.back()
    }
  }

  const handleReset = () => {
    if (reset) {
      reset()
    } else if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  const getErrorIcon = () => {
    const errorMessage = error.message.toLowerCase()
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return <Wifi className="h-8 w-8 text-destructive" />
    }
    if (errorMessage.includes("database") || errorMessage.includes("supabase")) {
      return <Database className="h-8 w-8 text-destructive" />
    }
    return <AlertTriangle className="h-8 w-8 text-destructive" />
  }

  const getDefaultTitle = () => {
    if (title) return title
    
    const errorMessage = error.message.toLowerCase()
    
    if (errorMessage.includes("network")) {
      return "Connection Problem"
    }
    if (errorMessage.includes("not found")) {
      return "Page Not Found"
    }
    if (errorMessage.includes("unauthorized")) {
      return "Access Denied"
    }
    return "Something went wrong"
  }

  const getDefaultMessage = () => {
    if (message) return message
    
    const errorMessage = error.message.toLowerCase()
    
    if (errorMessage.includes("network")) {
      return "Please check your internet connection and try again."
    }
    if (errorMessage.includes("not found")) {
      return "The page you're looking for doesn't exist or has been moved."
    }
    if (errorMessage.includes("unauthorized")) {
      return "You don't have permission to access this page."
    }
    return "We encountered an unexpected error. Please try again."
  }

  const isDevelopment = process.env.NODE_ENV === "development"

  if (variant === "minimal") {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="text-destructive mb-4">{getErrorIcon()}</div>
        <h3 className="text-lg font-semibold mb-2">{getDefaultTitle()}</h3>
        <p className="text-muted-foreground text-center mb-4">{getDefaultMessage()}</p>
        <Button onClick={handleReset} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 text-destructive">
              {getErrorIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold">{getDefaultTitle()}</h3>
              <p className="text-sm text-muted-foreground">{getDefaultMessage()}</p>
            </div>
            <Button onClick={handleReset} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPageVariant = variant === "page"
  const containerClass = isPageVariant 
    ? "min-h-screen flex items-center justify-center bg-background px-4" 
    : "flex items-center justify-center py-12 px-4"

  return (
    <div className={containerClass}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            {getErrorIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {getDefaultTitle()}
          </CardTitle>
          <CardDescription className="text-base">
            {getDefaultMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(isDevelopment || showErrorDetails) && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="h-4 w-4 text-destructive" />
                <h4 className="text-sm font-medium text-destructive">
                  Error Details {isDevelopment && "(Development Mode)"}
                </h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Message:</p>
                  <p className="text-sm text-destructive">{error.message}</p>
                </div>
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
            <Button onClick={handleReset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
            {goBack && (
              <Button onClick={handleGoBack} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
          
          {!isDevelopment && (
            <div className="text-center text-sm text-muted-foreground">
              If this problem persists, please contact our support team.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized error fallbacks for common scenarios
export function NetworkErrorFallback({ reset }: { reset: () => void }) {
  return (
    <ErrorFallback
      error={new Error("Network connection failed")}
      reset={reset}
      title="Connection Problem"
      message="Please check your internet connection and try again."
      actionLabel="Retry"
      variant="compact"
    />
  )
}

export function NotFoundErrorFallback({ goHome }: { goHome?: () => void }) {
  return (
    <ErrorFallback
      error={new Error("Resource not found")}
      goHome={goHome}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      actionLabel="Go Home"
      variant="page"
    />
  )
}

export function UnauthorizedErrorFallback({ goHome }: { goHome?: () => void }) {
  return (
    <ErrorFallback
      error={new Error("Unauthorized access")}
      goHome={goHome}
      title="Access Denied"
      message="You don't have permission to access this page. Please sign in."
      actionLabel="Sign In"
      variant="page"
    />
  )
} 