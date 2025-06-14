"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Zap, AlertTriangle, CheckCircle } from "lucide-react"

interface PerformanceMetrics {
  loadTime: number
  apiCalls: number
  cacheHits: number
  errors: number
  lastUpdated: Date
}

interface PerformanceMonitorProps {
  showDetails?: boolean
  className?: string
}

export function PerformanceMonitor({ showDetails = false, className = "" }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    errors: 0,
    lastUpdated: new Date()
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or for admin users
    const isDev = process.env.NODE_ENV === 'development'
    const isAdmin = localStorage.getItem('user_role') === 'admin'
    setIsVisible(isDev || isAdmin)

    if (!isVisible) return

    const startTime = performance.now()
    let apiCallCount = 0
    let errorCount = 0

    // Monitor fetch requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      apiCallCount++
      try {
        const response = await originalFetch(...args)
        if (!response.ok) errorCount++
        return response
      } catch (error) {
        errorCount++
        throw error
      }
    }

    // Monitor page load completion
    const updateMetrics = () => {
      const loadTime = performance.now() - startTime
      setMetrics({
        loadTime: Math.round(loadTime),
        apiCalls: apiCallCount,
        cacheHits: 0, // TODO: Implement cache hit tracking
        errors: errorCount,
        lastUpdated: new Date()
      })
    }

    // Update metrics after initial load
    const timer = setTimeout(updateMetrics, 2000)

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 10000)

    return () => {
      window.fetch = originalFetch
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [isVisible])

  if (!isVisible) return null

  const getLoadTimeStatus = (time: number) => {
    if (time < 1000) return { status: 'excellent', color: 'bg-green-500', icon: CheckCircle }
    if (time < 2000) return { status: 'good', color: 'bg-blue-500', icon: Zap }
    if (time < 3000) return { status: 'fair', color: 'bg-yellow-500', icon: Clock }
    return { status: 'poor', color: 'bg-red-500', icon: AlertTriangle }
  }

  const loadTimeStatus = getLoadTimeStatus(metrics.loadTime)

  if (!showDetails) {
    // Compact view
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-64 bg-white/95 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <loadTimeStatus.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Load Time</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {metrics.loadTime}ms
              </Badge>
            </div>
            <div className="mt-2">
              <Progress 
                value={Math.min((metrics.loadTime / 3000) * 100, 100)} 
                className="h-1"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{metrics.apiCalls} API calls</span>
              <span>{metrics.errors} errors</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Detailed view
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Real-time application performance monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Load Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${loadTimeStatus.color}`} />
            <span className="font-medium">Page Load Time</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-lg">{metrics.loadTime}ms</div>
            <div className="text-xs text-muted-foreground capitalize">
              {loadTimeStatus.status}
            </div>
          </div>
        </div>

        {/* API Calls */}
        <div className="flex items-center justify-between">
          <span className="font-medium">API Calls</span>
          <Badge variant="outline">{metrics.apiCalls}</Badge>
        </div>

        {/* Cache Hits */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Cache Hits</span>
          <Badge variant="outline">{metrics.cacheHits}</Badge>
        </div>

        {/* Errors */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Errors</span>
          <Badge variant={metrics.errors > 0 ? "destructive" : "outline"}>
            {metrics.errors}
          </Badge>
        </div>

        {/* Performance Score */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Performance Score</span>
            <span className="text-lg font-mono">
              {Math.max(0, 100 - Math.floor(metrics.loadTime / 30) - metrics.errors * 10)}
            </span>
          </div>
          <Progress 
            value={Math.max(0, 100 - Math.floor(metrics.loadTime / 30) - metrics.errors * 10)} 
            className="h-2"
          />
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {metrics.lastUpdated.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for performance tracking
export function usePerformanceTracking() {
  const [metrics, setMetrics] = useState({
    startTime: performance.now(),
    apiCalls: 0,
    errors: 0
  })

  const trackApiCall = (success: boolean = true) => {
    setMetrics(prev => ({
      ...prev,
      apiCalls: prev.apiCalls + 1,
      errors: success ? prev.errors : prev.errors + 1
    }))
  }

  const getLoadTime = () => {
    return Math.round(performance.now() - metrics.startTime)
  }

  return {
    trackApiCall,
    getLoadTime,
    metrics
  }
} 