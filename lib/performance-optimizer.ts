// Performance Optimization Utilities
import { useCallback, useRef, useEffect, useMemo, useState } from 'react'

// Simple debounce implementation to avoid lodash dependency
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null
  
  const debouncedFn = ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T & { cancel: () => void }
  
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  return debouncedFn
}

// Debounce hook for better performance
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  )

  useEffect(() => {
    return () => {
      debouncedFn.cancel()
    }
  }, [debouncedFn])

  return debouncedFn as T
}

// Throttle hook for scroll/resize events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, options])

  return isIntersecting
}

// Preload images for faster rendering
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Batch DOM updates to prevent layout thrashing
export class BatchUpdater {
  private updates: (() => void)[] = []
  private isScheduled = false

  add(update: () => void) {
    this.updates.push(update)
    if (!this.isScheduled) {
      this.isScheduled = true
      requestAnimationFrame(() => {
        this.updates.forEach(update => update())
        this.updates = []
        this.isScheduled = false
      })
    }
  }
}

// Optimize CSS animations by using transform instead of layout properties
export const fastAnimationStyles = {
  fadeIn: {
    opacity: 0,
    transform: 'translateY(10px)',
    transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
  },
  fadeInActive: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  slideIn: {
    transform: 'translateX(-100%)',
    transition: 'transform 0.2s ease-out',
  },
  slideInActive: {
    transform: 'translateX(0)',
  }
}

// Memory-efficient event listener management
export class EventManager {
  private listeners = new Map<string, Set<EventListener>>()

  add(element: Element, event: string, listener: EventListener, options?: AddEventListenerOptions) {
    element.addEventListener(event, listener, options)
    
    const key = `${element.tagName}-${event}`
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(listener)
  }

  removeAll() {
    this.listeners.forEach((listeners, key) => {
      listeners.forEach(listener => {
        // Note: We'd need element reference to properly remove
        // This is a simplified cleanup
        listeners.clear()
      })
    })
    this.listeners.clear()
  }
}

// Component-level performance monitoring
export const performanceMonitor = {
  startTiming: (label: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${label}-start`)
    }
  },

  endTiming: (label: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${label}-end`)
      performance.measure(label, `${label}-start`, `${label}-end`)
      
      const measures = performance.getEntriesByName(label)
      if (measures.length > 0) {
        console.log(`${label}: ${measures[0].duration.toFixed(2)}ms`)
      }
    }
  }
}

// Optimized state updates for large lists
export function useOptimizedState<T>(
  initialState: T,
  updateStrategy: 'immediate' | 'batched' | 'debounced' = 'immediate',
  delay = 100
) {
  const [state, setState] = useState<T>(initialState)
  const pendingUpdates = useRef<Partial<T>[]>([])

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.current.length > 0) {
      setState((currentState: T) => {
        let newState = { ...currentState }
        pendingUpdates.current.forEach(update => {
          newState = { ...newState, ...update }
        })
        return newState
      })
      pendingUpdates.current = []
    }
  }, [])

  const debouncedFlush = useMemo(
    () => debounce(flushUpdates, delay),
    [flushUpdates, delay]
  )

  const updateState = useCallback((update: Partial<T>) => {
    switch (updateStrategy) {
      case 'immediate':
        setState((current: T) => ({ ...current, ...update }))
        break
      case 'batched':
        pendingUpdates.current.push(update)
        requestAnimationFrame(flushUpdates)
        break
      case 'debounced':
        pendingUpdates.current.push(update)
        debouncedFlush()
        break
    }
  }, [updateStrategy, flushUpdates, debouncedFlush])

  return [state, updateState] as const
}

// Export performance utilities
export default {
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  preloadImage,
  BatchUpdater,
  fastAnimationStyles,
  EventManager,
  performanceMonitor,
  useOptimizedState
} 