"use client"

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Basic performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            // Log page load performance
            console.log(`Page loaded in ${entry.loadEventEnd - entry.loadEventStart}ms`)
          }
        }
      })
      
      try {
        observer.observe({ entryTypes: ['navigation'] })
      } catch (error) {
        // Fallback for browsers that don't support this
        console.log('Performance monitoring not supported')
      }
      
      return () => observer.disconnect()
    }
  }, [])

  // This component doesn't render anything
  return null
}