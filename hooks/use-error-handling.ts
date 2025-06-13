"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ErrorHandlingState {
  isError: boolean
  error: Error | null
  errorMessage: string | null
}

export interface ErrorHandlingOptions {
  showToast?: boolean
  redirectOnError?: string
  logError?: boolean
  retryCount?: number
  context?: string
}

export function useErrorHandling(options: ErrorHandlingOptions = {}) {
  const {
    showToast = true,
    redirectOnError,
    logError = true,
    retryCount = 3,
    context = "unknown"
  } = options
  
  const [errorState, setErrorState] = useState<ErrorHandlingState>({
    isError: false,
    error: null,
    errorMessage: null
  })
  
  const router = useRouter()

  const clearError = useCallback(() => {
    setErrorState({
      isError: false,
      error: null,
      errorMessage: null
    })
  }, [])

  const handleError = useCallback((error: Error | string, customMessage?: string) => {
    const errorObj = typeof error === "string" ? new Error(error) : error
    const userMessage = customMessage || getUserFriendlyMessage(errorObj)
    
    setErrorState({
      isError: true,
      error: errorObj,
      errorMessage: userMessage
    })

    if (logError) {
      console.error(`Error in ${context}:`, errorObj)
    }

    if (showToast) {
      toast.error(userMessage)
    }

    if (redirectOnError) {
      setTimeout(() => {
        router.push(redirectOnError)
      }, 2000)
    }
  }, [showToast, redirectOnError, logError, context, router])

  const withErrorHandling = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R> | R) => {
      return async (...args: T): Promise<R | null> => {
        try {
          clearError()
          const result = await fn(...args)
          return result
        } catch (error) {
          handleError(error as Error)
          return null
        }
      }
    },
    [handleError, clearError]
  )

  const withRetry = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R | null> => {
        let lastError: Error
        
        for (let attempt = 1; attempt <= retryCount; attempt++) {
          try {
            clearError()
            const result = await fn(...args)
            return result
          } catch (error) {
            lastError = error as Error
            
            if (attempt < retryCount) {
              console.log(`Retry attempt ${attempt}/${retryCount} for ${context}`)
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            }
          }
        }
        
        handleError(lastError!, `Failed after ${retryCount} attempts`)
        return null
      }
    },
    [retryCount, context, handleError, clearError]
  )

  const reportError = useCallback((error: Error, additionalContext?: Record<string, any>) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      url: typeof window !== "undefined" ? window.location.href : "",
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      ...additionalContext
    }

    // Log to console
    console.error("Error Report:", errorReport)

    // Here you can integrate with error reporting services
    // Example: Sentry, LogRocket, Bugsnag, etc.
    
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorReport })
    // }
  }, [context])

  return {
    // State
    ...errorState,
    
    // Actions
    handleError,
    clearError,
    reportError,
    
    // Utilities
    withErrorHandling,
    withRetry
  }
}

// Get user-friendly error messages
function getUserFriendlyMessage(error: Error): string {
  const message = error.message.toLowerCase()
  
  if (message.includes("network") || message.includes("fetch failed")) {
    return "Network connection problem. Please check your internet and try again."
  }
  
  if (message.includes("unauthorized") || message.includes("401")) {
    return "You need to sign in to continue."
  }
  
  if (message.includes("forbidden") || message.includes("403")) {
    return "You don't have permission to perform this action."
  }
  
  if (message.includes("not found") || message.includes("404")) {
    return "The requested resource was not found."
  }
  
  if (message.includes("timeout")) {
    return "The request took too long. Please try again."
  }
  
  if (message.includes("validation") || message.includes("invalid")) {
    return "Please check your input and try again."
  }
  
  if (message.includes("database") || message.includes("supabase")) {
    return "We're having trouble accessing your data. Please try again."
  }
  
  // Default fallback
  return "Something went wrong. Please try again."
}

// Specialized hooks for different scenarios
export function useApiErrorHandling() {
  return useErrorHandling({
    showToast: true,
    logError: true,
    context: "api-request"
  })
}

export function useFormErrorHandling() {
  return useErrorHandling({
    showToast: true,
    logError: false,
    context: "form-submission"
  })
}

export function useNavigationErrorHandling() {
  return useErrorHandling({
    showToast: false,
    logError: true,
    redirectOnError: "/",
    context: "navigation"
  })
}

export function useAuthErrorHandling() {
  return useErrorHandling({
    showToast: true,
    logError: true,
    redirectOnError: "/auth/signin",
    context: "authentication"
  })
} 