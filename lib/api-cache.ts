// Server-side API caching for faster responses
import { NextResponse } from 'next/server'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheConfig {
  ttl: number // Time to live in milliseconds
  staleWhileRevalidate?: boolean
}

class ApiCache {
  private static cache = new Map<string, CacheEntry<any>>()
  private static pendingRequests = new Map<string, Promise<any>>()

  // Generate cache key for API endpoints
  static generateKey(endpoint: string, userId?: string, params?: Record<string, any>): string {
    const baseKey = `api:${endpoint}`
    const userKey = userId ? `:user:${userId}` : ''
    const paramsKey = params ? `:${JSON.stringify(params)}` : ''
    return `${baseKey}${userKey}${paramsKey}`
  }

  // Get cached data or return null
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    
    // Return if still valid
    if (now < entry.expiresAt) {
      return entry.data
    }

    // Remove expired entry
    this.cache.delete(key)
    return null
  }

  // Set cache data
  static set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })
  }

  // Cache or fetch pattern for API responses
  static async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig = { ttl: 5 * 60 * 1000 }
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Check if request is already pending (deduplication)
    const pending = this.pendingRequests.get(key)
    if (pending) {
      return pending as Promise<T>
    }

    // Make new request
    const request = fetchFn()
      .then(data => {
        this.set(key, data, config.ttl)
        return data
      })
      .finally(() => {
        this.pendingRequests.delete(key)
      })

    this.pendingRequests.set(key, request)
    return request
  }

  // Cached JSON response helper
  static async cachedResponse<T>(
    key: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig = { ttl: 5 * 60 * 1000 }
  ): Promise<NextResponse> {
    try {
      const data = await this.getOrFetch(key, fetchFn, config)
      
      // Add cache headers
      const response = NextResponse.json(data)
      response.headers.set('Cache-Control', `public, max-age=${Math.floor(config.ttl / 1000)}, stale-while-revalidate=${Math.floor(config.ttl / 2000)}`)
      response.headers.set('X-Cache-Status', 'HIT')
      
      return response
    } catch (error) {
      console.error('Cached response error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  // Invalidate cache by pattern
  static invalidate(pattern: string | RegExp): void {
    const keys = Array.from(this.cache.keys())
    
    if (typeof pattern === 'string') {
      keys.forEach(key => {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      })
    } else {
      keys.forEach(key => {
        if (pattern.test(key)) {
          this.cache.delete(key)
        }
      })
    }
  }

  // Clear all cache
  static clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  // Get cache stats
  static getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.values())
    
    return {
      totalEntries: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      validEntries: entries.filter(entry => now < entry.expiresAt).length,
      expiredEntries: entries.filter(entry => now >= entry.expiresAt).length,
    }
  }

  // Cleanup expired entries
  static cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt + (5 * 60 * 1000)) { // Grace period
        expiredKeys.push(key)
      }
    })
    
    expiredKeys.forEach(key => this.cache.delete(key))
  }
}

// Optimized database query helper
export async function optimizedDbQuery<T>(
  supabase: any,
  queryBuilder: (supabase: any) => any,
  cacheKey: string,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  return ApiCache.getOrFetch(
    cacheKey,
    async () => {
      const { data, error } = await queryBuilder(supabase)
      if (error) throw new Error(`Database error: ${error.message}`)
      return data
    },
    { ttl }
  )
}

// Parallel query executor for multiple database calls
export async function executeParallelQueries(
  queries: Array<{
    key: string
    query: () => Promise<any>
    ttl?: number
  }>
): Promise<Record<string, any>> {
  const results = await Promise.allSettled(
    queries.map(async ({ key, query, ttl }) => ({
      key,
      data: await ApiCache.getOrFetch(key, query, { ttl: ttl || 5 * 60 * 1000 })
    }))
  )

  const successResults: Record<string, any> = {}
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successResults[result.value.key] = result.value.data
    } else {
      console.error(`Query ${queries[index].key} failed:`, result.reason)
      successResults[queries[index].key] = null
    }
  })

  return successResults
}

// Cleanup interval for server environments
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    ApiCache.cleanup()
  }, 5 * 60 * 1000) // Cleanup every 5 minutes
}

export default ApiCache 