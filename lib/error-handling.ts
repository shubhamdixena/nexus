import { NextResponse } from "next/server"

// Error types for different scenarios
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR", 
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  RATE_LIMIT = "RATE_LIMIT_ERROR",
  DATABASE = "DATABASE_ERROR",
  EXTERNAL_API = "EXTERNAL_API_ERROR",
  NETWORK = "NETWORK_ERROR",
  INTERNAL = "INTERNAL_ERROR",
  USER_INPUT = "USER_INPUT_ERROR",
}

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  CRITICAL = "critical",
}

// Standardized error interface
export interface AppError extends Error {
  type: ErrorType
  severity: ErrorSeverity
  code?: string
  statusCode?: number
  context?: Record<string, any>
  userMessage?: string
  timestamp?: string
  requestId?: string
}

// Create standardized error
export function createError(
  message: string,
  type: ErrorType,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  options: {
    code?: string
    statusCode?: number
    context?: Record<string, any>
    userMessage?: string
    cause?: Error
  } = {}
): AppError {
  const error = new Error(message) as AppError
  
  error.type = type
  error.severity = severity
  error.code = options.code
  error.statusCode = options.statusCode || getDefaultStatusCode(type)
  error.context = options.context
  error.userMessage = options.userMessage || getUserFriendlyMessage(type)
  error.timestamp = new Date().toISOString()
  error.requestId = generateRequestId()
  
  if (options.cause) {
    error.cause = options.cause
  }
  
  return error
}

// Get default status codes for error types
function getDefaultStatusCode(type: ErrorType): number {
  switch (type) {
    case ErrorType.VALIDATION:
    case ErrorType.USER_INPUT:
      return 400
    case ErrorType.AUTHENTICATION:
      return 401
    case ErrorType.AUTHORIZATION:
      return 403
    case ErrorType.NOT_FOUND:
      return 404
    case ErrorType.RATE_LIMIT:
      return 429
    case ErrorType.DATABASE:
    case ErrorType.EXTERNAL_API:
    case ErrorType.INTERNAL:
      return 500
    case ErrorType.NETWORK:
      return 503
    default:
      return 500
  }
}

// Get user-friendly error messages
function getUserFriendlyMessage(type: ErrorType): string {
  switch (type) {
    case ErrorType.VALIDATION:
    case ErrorType.USER_INPUT:
      return "Please check your input and try again."
    case ErrorType.AUTHENTICATION:
      return "Please sign in to continue."
    case ErrorType.AUTHORIZATION:
      return "You don't have permission to access this resource."
    case ErrorType.NOT_FOUND:
      return "The requested resource was not found."
    case ErrorType.RATE_LIMIT:
      return "Too many requests. Please try again later."
    case ErrorType.DATABASE:
      return "We're having trouble accessing your data. Please try again."
    case ErrorType.EXTERNAL_API:
      return "An external service is temporarily unavailable."
    case ErrorType.NETWORK:
      return "Network connection issue. Please check your internet connection."
    case ErrorType.INTERNAL:
    default:
      return "Something went wrong. We're working to fix it."
  }
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Error logging utility
export function logError(error: AppError | Error, context?: Record<string, any>) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...(error as AppError).type && { type: (error as AppError).type },
    ...(error as AppError).severity && { severity: (error as AppError).severity },
    ...(error as AppError).code && { code: (error as AppError).code },
    ...(error as AppError).requestId && { requestId: (error as AppError).requestId },
    ...(error as AppError).context && { errorContext: (error as AppError).context },
    timestamp: new Date().toISOString(),
    ...context,
  }

  // Log based on severity
  const severity = (error as AppError).severity || ErrorSeverity.MEDIUM
  
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      console.error("🚨 CRITICAL ERROR:", errorData)
      break
    case ErrorSeverity.HIGH:
      console.error("❌ HIGH SEVERITY ERROR:", errorData)
      break
    case ErrorSeverity.MEDIUM:
      console.warn("⚠️ MEDIUM SEVERITY ERROR:", errorData)
      break
    case ErrorSeverity.LOW:
      console.log("ℹ️ LOW SEVERITY ERROR:", errorData)
      break
  }

  // Send to external monitoring service
  if (typeof window !== "undefined") {
    sendToMonitoring(errorData)
  }
}

// Send error to monitoring service
function sendToMonitoring(errorData: any) {
  // Integration point for services like Sentry, LogRocket, etc.
  // Example implementations:
  
  // Sentry:
  // if (window.Sentry) {
  //   window.Sentry.captureException(new Error(errorData.message), {
  //     extra: errorData,
  //     level: errorData.severity === ErrorSeverity.CRITICAL ? 'fatal' : 'error'
  //   })
  // }
  
  // LogRocket:
  // if (window.LogRocket) {
  //   window.LogRocket.captureException(new Error(errorData.message))
  // }
  
  console.log("📊 Error reported to monitoring:", errorData)
}

// API error response utility
export function createErrorResponse(error: AppError | Error, requestId?: string) {
  const appError = error as AppError
  
  const response = {
    success: false,
    error: {
      message: appError.userMessage || "Something went wrong",
      code: appError.code || "UNKNOWN_ERROR",
      type: appError.type || ErrorType.INTERNAL,
      requestId: appError.requestId || requestId || generateRequestId(),
      timestamp: new Date().toISOString(),
    },
    // Include stack trace only in development
    ...(process.env.NODE_ENV === "development" && {
      debug: {
        message: error.message,
        stack: error.stack,
        context: appError.context,
      }
    })
  }

  const statusCode = appError.statusCode || 500
  
  // Log the error
  logError(appError, { api: true, statusCode })
  
  return NextResponse.json(response, { status: statusCode })
}

// Async error wrapper for API routes
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error("API Error:", error)
      
      // Convert unknown errors to AppError
      if (!(error as AppError).type) {
        const appError = createError(
          error instanceof Error ? error.message : "Unknown error occurred",
          ErrorType.INTERNAL,
          ErrorSeverity.HIGH,
          {
            cause: error instanceof Error ? error : undefined,
            context: { args: args.slice(0, 2) } // Avoid logging sensitive data
          }
        )
        return createErrorResponse(appError)
      }
      
      return createErrorResponse(error as AppError)
    }
  }
}

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    const appError = createError(
      error.message,
      ErrorType.INTERNAL,
      ErrorSeverity.MEDIUM,
      {
        context: { component: context, url: window.location.href },
        cause: error
      }
    )
    
    logError(appError)
    
    // You can add toast notifications here
    // toast.error(appError.userMessage)
  }
  
  const handleAsyncError = async <T>(
    promise: Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await promise
    } catch (error) {
      handleError(error as Error, context)
      return null
    }
  }
  
  return { handleError, handleAsyncError }
}

// Retry mechanism for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      logError(
        createError(
          `Retry attempt ${attempt}/${maxRetries} failed`,
          ErrorType.INTERNAL,
          ErrorSeverity.LOW,
          {
            context: { attempt, maxRetries, operation: context },
            cause: lastError
          }
        )
      )
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw createError(
    `Operation failed after ${maxRetries} attempts`,
    ErrorType.INTERNAL,
    ErrorSeverity.HIGH,
    {
      context: { maxRetries, operation: context },
      cause: lastError!
    }
  )
} 