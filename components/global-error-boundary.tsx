"use client"

import * as React from "react"
import { ErrorFallback } from "@/components/error-fallback"
import { logError } from "@/lib/error-handling"

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
    // Use our centralized error logging
    logError(error, {
      component: "GlobalErrorBoundary",
      componentStack: errorInfo.componentStack,
      url: typeof window !== "undefined" ? window.location.href : "",
    })
    
    this.setState({
      hasError: true,
      error,
      errorInfo,
    })
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

      return (
        <ErrorFallback
          error={this.state.error!}
          reset={() => this.setState({ hasError: false })}
          goHome={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/"
            }
          }}
          variant="page"
          showErrorDetails={process.env.NODE_ENV === "development"}
        />
      )
    }

    return this.props.children
  }
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  )
}

// Hook for programmatic error reporting (use the new error handling system instead)
export function useErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    logError(error, { 
      component: context || "unknown", 
      reportedProgrammatically: true 
    })
  }, [])

  return { reportError }
}