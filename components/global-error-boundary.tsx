"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error
    reset: () => void
    goHome: () => void
  }>
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Global Error Boundary caught an error:", error, errorInfo)
    
    // Log to external service if needed
    this.logErrorToService(error, errorInfo)
    
    this.setState({
      hasError: true,
      error,
      errorInfo,
    })
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Here you could send errors to external services like Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
    }
    
    // For now, just log to console
    console.error("Error details:", errorData)
  }

  render() {
    if (this.state.hasError) {
      const CustomFallback = this.props.fallback
      
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error!}
            reset={() => this.setState({ hasError: false })}
            goHome={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/"
              }
            }}
          />
        )
      }

      return <DefaultErrorFallback error={this.state.error!} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  const router = useRouter()

  const handleReset = () => {
    // Reload the page
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-gray-600">
            We encountered an unexpected error. Please try refreshing the page or
            go back to the home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && (
            <div className="rounded-md bg-red-50 p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Error Details (Development Mode)
              </h4>
              <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && (
                  <>
                    {"\n\nStack trace:\n"}
                    {error.stack}
                  </>
                )}
              </pre>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleReset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  )
}

// Hook for programmatic error reporting
export function useErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error reported from ${context || "unknown context"}:`, error)
    
    // Here you could send to external error reporting service
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
    }
    
    // Log for now, could integrate with Sentry, etc.
    console.error("Reported error:", errorData)
  }, [])

  return { reportError }
}