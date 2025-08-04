/**
 * React Query Provider
 * 
 * Sets up React Query for the entire application with proper configuration
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep inactive data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
            // Retry failed requests 2 times
            retry: 2,
            // Don't refetch on reconnect unless data is stale
            refetchOnReconnect: 'always',
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
