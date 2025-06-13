# Error Handling Guide

This guide explains how to use the comprehensive error handling system implemented in the application, following industry standards like Facebook/Meta.

## Overview

The error handling system provides:
- **Graceful degradation**: App continues functioning when errors occur
- **User-friendly messages**: No technical jargon exposed to users
- **Centralized logging**: All errors are properly logged and can be sent to monitoring services
- **Multiple recovery options**: Users can retry, go back, or navigate to safety
- **Development support**: Detailed error information in development mode

## Components

### 1. Next.js Error Boundaries

#### `app/error.tsx`
Handles client-side errors in pages and components.

#### `app/global-error.tsx`
Handles errors in the root layout and critical application errors.

#### `app/not-found.tsx`
Custom 404 page with helpful navigation options.

### 2. Error Handling Utilities

#### `lib/error-handling.ts`
Centralized error handling utilities with:
- Standardized error types and severity levels
- API error response formatting
- Error logging and reporting
- Retry mechanisms

### 3. React Components

#### `components/error-fallback.tsx`
Reusable error fallback components with different variants:
- `default`: Standard error display
- `compact`: Minimal error display for small spaces
- `minimal`: Text-only error display
- `page`: Full-page error display

#### `components/global-error-boundary.tsx`
React error boundary wrapper using the new error handling system.

### 4. React Hooks

#### `hooks/use-error-handling.ts`
Custom hooks for consistent client-side error handling:
- `useErrorHandling`: General error handling
- `useApiErrorHandling`: API-specific error handling
- `useFormErrorHandling`: Form submission error handling
- `useAuthErrorHandling`: Authentication error handling

## Usage Examples

### API Routes

```typescript
import { withErrorHandling, createError, ErrorType, ErrorSeverity } from '@/lib/error-handling'

export const GET = withErrorHandling(async (request: Request) => {
  // Your API logic here
  
  if (!user) {
    throw createError(
      "User authentication required",
      ErrorType.AUTHENTICATION,
      ErrorSeverity.LOW,
      {
        code: "UNAUTHORIZED",
        userMessage: "Please sign in to continue"
      }
    )
  }
  
  // More logic...
})
```

### React Components

```typescript
import { useApiErrorHandling } from '@/hooks/use-error-handling'
import { ErrorFallback } from '@/components/error-fallback'

function MyComponent() {
  const { withErrorHandling, isError, error } = useApiErrorHandling()
  
  const fetchData = withErrorHandling(async () => {
    const response = await fetch('/api/data')
    if (!response.ok) throw new Error('Failed to fetch data')
    return response.json()
  })
  
  if (isError) {
    return <ErrorFallback error={error!} variant="compact" />
  }
  
  return (
    <div>
      <button onClick={fetchData}>Load Data</button>
    </div>
  )
}
```

This error handling system ensures your application provides a professional, user-friendly experience even when things go wrong, following industry standards used by companies like Facebook and Meta.