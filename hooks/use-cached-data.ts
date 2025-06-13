import { useState, useEffect, useCallback } from 'react'
import CacheManager from '@/lib/cache-manager'

interface UseCachedDataOptions<T> {
  cacheKey: string
  fetchFn: () => Promise<T>
  cacheTtl?: number
  dependencies?: any[]
  enabled?: boolean
}

interface UseCachedDataReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  clearCache: () => void
}

export function useCachedData<T = any>({
  cacheKey,
  fetchFn,
  cacheTtl = 5 * 60 * 1000, // 5 minutes default
  dependencies = [],
  enabled = true
}: UseCachedDataOptions<T>): UseCachedDataReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)

      let result: T

      if (forceRefresh) {
        // Force refresh - bypass cache
        CacheManager.invalidate(cacheKey)
        result = await fetchFn()
        CacheManager.set(cacheKey, result, cacheTtl)
      } else {
        // Use cache-or-fetch strategy
        result = await CacheManager.getOrFetch(cacheKey, fetchFn, cacheTtl)
      }

      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error(`Error loading data for key ${cacheKey}:`, err)
    } finally {
      setLoading(false)
    }
  }, [cacheKey, fetchFn, cacheTtl, enabled])

  const refetch = useCallback(async () => {
    await loadData(true)
  }, [loadData])

  const clearCache = useCallback(() => {
    CacheManager.invalidate(cacheKey)
    setData(null)
  }, [cacheKey])

  useEffect(() => {
    if (enabled) {
      // First check if we have cached data
      const cached = CacheManager.get<T>(cacheKey)
      if (cached) {
        setData(cached)
        setLoading(false)
      } else {
        loadData()
      }
    }
  }, [enabled, ...dependencies])

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  }
}

// Specialized hooks for common data patterns
export function useProfile(userId?: string) {
  return useCachedData({
    cacheKey: `profile:${userId || 'current'}`,
    fetchFn: async () => {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      return await response.json()
    },
    cacheTtl: 10 * 60 * 1000, // 10 minutes
    dependencies: [userId],
    enabled: !!userId
  })
}

export function useStats() {
  return useCachedData({
    cacheKey: 'stats',
    fetchFn: async () => {
      const response = await fetch('/api/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const { data } = await response.json()
      return data
    },
    cacheTtl: 30 * 60 * 1000, // 30 minutes
  })
}

export function useMBASchools(params: any = {}) {
  const cacheKey = `mba_schools:${JSON.stringify(params)}`
  
  return useCachedData({
    cacheKey,
    fetchFn: async () => {
      const { OptimizedMBASchoolService } = await import('@/lib/optimized-realtime-services')
      return await OptimizedMBASchoolService.getMBASchools(params)
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
    dependencies: [JSON.stringify(params)]
  })
}

export function useBookmarks(userId: string, itemType: string) {
  return useCachedData({
    cacheKey: `bookmarks:${userId}:${itemType}`,
    fetchFn: async () => {
      const { bookmarkService } = await import('@/lib/bookmark-service')
      return await bookmarkService.getBookmarkedItemIds(itemType as any)
    },
    cacheTtl: 20 * 60 * 1000, // 20 minutes
    dependencies: [userId, itemType],
    enabled: !!userId
  })
}

export function useDeadlines(userId: string, start?: string, end?: string) {
  const params = { start, end }
  const cacheKey = `deadlines:${userId}:${JSON.stringify(params)}`
  
  return useCachedData({
    cacheKey,
    fetchFn: async () => {
      const queryParams = new URLSearchParams()
      if (start) queryParams.append('start', start)
      if (end) queryParams.append('end', end)
      
      const response = await fetch(`/api/deadlines?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch deadlines')
      const { deadlines } = await response.json()
      return deadlines
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
    dependencies: [userId, start, end],
    enabled: !!userId
  })
} 