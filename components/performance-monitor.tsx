"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Zap, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface PerformanceMetrics {
  loadTime: number
  apiCalls: number
  cacheHits: number
  errors: number
  lastUpdated: Date
  componentTimes: Record<string, number>
  slowestComponents: Array<{name: string, time: number}>
}

interface PerformanceMonitorProps {
  showDetails?: boolean
  className?: string
}

interface ApiCallResult {
  time: number
  success: boolean
}

interface ApiCallTracker {
  end: () => number
}

// Global performance tracking
const componentLoadTimes: Record<string, number> = {}
const apiCallTimes: Record<string, number> = {}

// Track component render time
export function trackComponentRender(componentName: string, startTime: number): number {
  const renderTime = performance.now() - startTime
  componentLoadTimes[componentName] = renderTime
  return renderTime
}

// Track API call time
export function trackApiCall(endpoint: string, startTime: number, success: boolean = true): ApiCallResult {
  const callTime = performance.now() - startTime
  apiCallTimes[endpoint] = callTime
  return { time: callTime, success }
}

export function PerformanceMonitor({ showDetails = false, className = "" }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    errors: 0,
    lastUpdated: new Date(),
    componentTimes: {},
    slowestComponents: []
  })
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Only show in development or for admin users
    const isDev = process.env.NODE_ENV === 'development'
    const isAdmin = localStorage.getItem('user_role') === 'admin'
    const showPerformance = localStorage.getItem('show_performance') === 'true'
    setIsVisible(isDev || isAdmin || showPerformance)

    if (!isVisible) return

    const startTime = performance.now()
    let apiCallCount = 0
    let errorCount = 0
    let cacheHitCount = 0

    // Monitor fetch requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const urlString = typeof args[0] === 'string' 
        ? args[0] 
        : args[0] instanceof URL 
          ? args[0].toString()
          : args[0].url
      const fetchStartTime = performance.now()
      apiCallCount++
      
      try {
        const response = await originalFetch(...args)
        
        // Check if response came from cache
        const fromCache = response.headers.get('x-from-cache') === 'true'
        if (fromCache) cacheHitCount++
        
        // Track API call time
        trackApiCall(urlString, fetchStartTime, response.ok)
        
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
      
      // Get top 5 slowest components
      const componentEntries = Object.entries(componentLoadTimes)
      const slowestComponents = componentEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, time]) => ({ name, time }))
      
      setMetrics({
        loadTime: Math.round(loadTime),
        apiCalls: apiCallCount,
        cacheHits: cacheHitCount,
        errors: errorCount,
        lastUpdated: new Date(),
        componentTimes: {...componentLoadTimes},
        slowestComponents
      })
    }

    // Update metrics after initial load
    const timer = setTimeout(updateMetrics, 1000)

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000)

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
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <Card className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-lg">
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
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full mt-2 h-6 text-xs">
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  )}
                  {isExpanded ? "Hide Details" : "Show Details"}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t text-xs space-y-2">
                  <div className="font-medium">Slowest Components:</div>
                  {metrics.slowestComponents.length > 0 ? (
                    <ul className="space-y-1">
                      {metrics.slowestComponents.map(({ name, time }, index) => (
                        <li key={index} className="flex justify-between">
                          <span className="truncate">{name}</span>
                          <span>{Math.round(time)}ms</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted-foreground">No component data</div>
                  )}
                  
                  <div className="flex justify-between mt-2">
                    <span>Cache Hits:</span>
                    <span>{metrics.cacheHits}</span>
                  </div>
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
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

        {/* Component Performance */}
        <div className="pt-2 border-t">
          <h4 className="font-medium mb-2">Slowest Components</h4>
          {metrics.slowestComponents.length > 0 ? (
            <div className="space-y-2">
              {metrics.slowestComponents.map(({ name, time }, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[70%]">{name}</span>
                  <div className="flex items-center">
                    <Progress 
                      value={Math.min((time / 1000) * 100, 100)} 
                      className="h-2 w-16 mr-2"
                    />
                    <span className="font-mono">{Math.round(time)}ms</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No component data available</div>
          )}
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
export function usePerformanceTracking(componentName?: string) {
  const [metrics, setMetrics] = useState({
    startTime: performance.now(),
    apiCalls: 0,
    errors: 0,
    renderTime: 0
  })

  useEffect(() => {
    if (componentName) {
      const renderTime = trackComponentRender(componentName, metrics.startTime)
      setMetrics(prev => ({
        ...prev,
        renderTime
      }))
    }
  }, [componentName])

  // Create a new API call tracker without recursive reference
  const createApiCallTracker = (endpoint: string, success: boolean = true): ApiCallTracker => {
    const callStartTime = performance.now()
    
    return {
      end: (): number => {
        // Calculate time directly instead of recursively calling trackApiCall
        const callTime = performance.now() - callStartTime
        
        // Store in the global tracking
        apiCallTimes[endpoint] = callTime
        
        // Update local metrics
        setMetrics(prev => ({
          ...prev,
          apiCalls: prev.apiCalls + 1,
          errors: success ? prev.errors : prev.errors + 1
        }))
        
        return callTime
      }
    }
  }

  const getLoadTime = () => {
    return Math.round(performance.now() - metrics.startTime)
  }

  return {
    trackApiCall: createApiCallTracker,
    getLoadTime,
    metrics
  }
} 