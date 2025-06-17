"use client"

import React, { Suspense, useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePerformanceTracking } from "@/components/performance-monitor"

interface OptimizedDashboardWrapperProps {
  children: React.ReactNode
  componentName?: string
  priority?: 'high' | 'medium' | 'low'
  fallback?: React.ReactNode
  delay?: number // Optional delay in ms for non-critical components
}

export function OptimizedDashboardWrapper({
  children,
  componentName = 'unnamed-component',
  priority = 'medium',
  fallback,
  delay = 0
}: OptimizedDashboardWrapperProps) {
  const [isVisible, setIsVisible] = useState(priority === 'high')
  const { trackApiCall } = usePerformanceTracking(componentName)
  
  useEffect(() => {
    // High priority components load immediately
    if (priority === 'high') {
      return
    }
    
    // Medium and low priority components load with delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay || (priority === 'medium' ? 100 : 300))
    
    return () => clearTimeout(timer)
  }, [priority, delay])
  
  // Default fallback if none provided
  const defaultFallback = (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
  
  // Use custom fallback or default
  const fallbackContent = fallback || defaultFallback
  
  return (
    <Suspense fallback={fallbackContent}>
      {isVisible ? children : fallbackContent}
    </Suspense>
  )
}

// Section-specific optimized wrappers
export function OptimizedDeadlinesSection({ children }: { children: React.ReactNode }) {
  return (
    <OptimizedDashboardWrapper 
      componentName="deadlines-section"
      priority="high"
      fallback={
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      }
    >
      {children}
    </OptimizedDashboardWrapper>
  )
}

export function OptimizedSchoolsSection({ children }: { children: React.ReactNode }) {
  return (
    <OptimizedDashboardWrapper 
      componentName="schools-section"
      priority="medium"
      delay={150}
      fallback={
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      }
    >
      {children}
    </OptimizedDashboardWrapper>
  )
}

export function OptimizedActivitySection({ children }: { children: React.ReactNode }) {
  return (
    <OptimizedDashboardWrapper 
      componentName="activity-section"
      priority="low"
      delay={250}
      fallback={
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      }
    >
      {children}
    </OptimizedDashboardWrapper>
  )
}

export function OptimizedProfileSection({ children }: { children: React.ReactNode }) {
  return (
    <OptimizedDashboardWrapper 
      componentName="profile-section"
      priority="medium"
      delay={200}
    >
      {children}
    </OptimizedDashboardWrapper>
  )
}

export function OptimizedStatsSection({ children }: { children: React.ReactNode }) {
  return (
    <OptimizedDashboardWrapper 
      componentName="stats-section"
      priority="low"
      delay={300}
    >
      {children}
    </OptimizedDashboardWrapper>
  )
} 