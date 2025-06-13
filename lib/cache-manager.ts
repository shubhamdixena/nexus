// Unified Cache Manager for Application-wide Caching
import { createClient } from '@/lib/supabaseClient'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
  staleWhileRevalidate: boolean // Serve stale data while fetching fresh
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  staleWhileRevalidate: true
}

class CacheManager {
  private static cache = new Map<string, CacheEntry<any>>()
  private static pendingRequests = new Map<string, Promise<any>>()
  private static config: CacheConfig = DEFAULT_CONFIG

  static configure(config: Partial<CacheConfig>) {
    this.config = { ...this.config, ...config }
  }

  static getCacheKey(prefix: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((sorted, key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          sorted[key] = params[key]
        }
        return sorted
      }, {} as Record<string, any>)
    
    return `${prefix}:${JSON.stringify(sortedParams)}`
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    
    // Return data if still valid
    if (now < entry.expiresAt) {
      return entry.data
    }

    // If stale-while-revalidate is enabled, return stale data
    if (this.config.staleWhileRevalidate && now < entry.expiresAt + this.config.ttl) {
      return entry.data
    }

    // Remove expired entry
    this.cache.delete(key)
    return null
  }

  static set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl
    const now = Date.now()

    // Cleanup old entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.cleanupExpired()
      
      // If still full, remove oldest entries
      if (this.cache.size >= this.config.maxSize) {
        const entries = Array.from(this.cache.entries())
        const sortedByTimestamp = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
        const toRemove = sortedByTimestamp.slice(0, Math.floor(this.config.maxSize * 0.2))
        
        toRemove.forEach(([key]) => this.cache.delete(key))
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })
  }

  static async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>,
    customTtl?: number
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
        this.set(key, data, customTtl)
        return data
      })
      .finally(() => {
        this.pendingRequests.delete(key)
      })

    this.pendingRequests.set(key, request)
    return request
  }

  static invalidate(pattern: string | RegExp): void {
    const keys = Array.from(this.cache.keys())
    
    if (typeof pattern === 'string') {
      // Exact match or prefix match
      keys.forEach(key => {
        if (key === pattern || key.startsWith(pattern + ':')) {
          this.cache.delete(key)
        }
      })
    } else {
      // Regex pattern
      keys.forEach(key => {
        if (pattern.test(key)) {
          this.cache.delete(key)
        }
      })
    }
  }

  static clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  static cleanupExpired(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    
    entries.forEach(([key, entry]) => {
      if (now > entry.expiresAt + this.config.ttl) { // Grace period for stale-while-revalidate
        this.cache.delete(key)
      }
    })
  }

  static getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.values())
    
    return {
      totalEntries: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      validEntries: entries.filter(entry => now < entry.expiresAt).length,
      expiredEntries: entries.filter(entry => now >= entry.expiresAt).length,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    }
  }
}

// Export singleton instance
export default CacheManager

// Cache key generators for different data types
export const CacheKeys = {
  profile: (userId?: string) => CacheManager.getCacheKey('profile', { userId }),
  stats: () => CacheManager.getCacheKey('stats'),
  mbaSchools: (params: any) => CacheManager.getCacheKey('mba_schools', params),
  universities: (params: any) => CacheManager.getCacheKey('universities', params),
  scholarships: (params: any) => CacheManager.getCacheKey('scholarships', params),
  applications: (params: any) => CacheManager.getCacheKey('applications', params),
  users: (params: any) => CacheManager.getCacheKey('users', params),
  sops: (params: any) => CacheManager.getCacheKey('sops', params),
  systemSettings: (category?: string) => CacheManager.getCacheKey('system_settings', { category }),
  bookmarks: (userId: string, type: string) => CacheManager.getCacheKey('bookmarks', { userId, type }),
  deadlines: (userId: string, start?: string, end?: string) => CacheManager.getCacheKey('deadlines', { userId, start, end })
}

// Cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    CacheManager.cleanupExpired()
  }, 60000) // Cleanup every minute
} 