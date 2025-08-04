import type React from "react"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/global-error-boundary"
import { EnhancedToaster } from "@/components/enhanced-notifications"
import { ReactQueryProvider } from "@/components/react-query-provider"
import "@/app/globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            >
              <AuthProvider>
                {children}
                <EnhancedToaster />
              </AuthProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

export const metadata = {
  generator: 'v0.dev'
};
