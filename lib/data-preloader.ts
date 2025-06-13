// Data Preloader Service for Initial App Loading
import { createClient } from '@/lib/supabaseClient'
import CacheManager, { CacheKeys } from '@/lib/cache-manager'
import type { User } from '@supabase/supabase-js'

interface PreloadConfig {
  profile: boolean
  stats: boolean
  recentMBASchools: boolean
  userBookmarks: boolean
  upcomingDeadlines: boolean
}

const DEFAULT_PRELOAD_CONFIG: PreloadConfig = {
  profile: true,
  stats: true,
  recentMBASchools: true,
  userBookmarks: true,
  upcomingDeadlines: true
}

class DataPreloader {
  private static isPreloading = false
  private static preloadConfig = DEFAULT_PRELOAD_CONFIG
  
  static configure(config: Partial<PreloadConfig>) {
    this.preloadConfig = { ...this.preloadConfig, ...config }
  }

  static async preloadUserData(user: User, config?: Partial<PreloadConfig>): Promise<void> {
    if (this.isPreloading) return
    
    this.isPreloading = true
    const activeConfig = { ...this.preloadConfig, ...config }
    
    console.log('🚀 Starting data preload for user:', user.email)
    const startTime = Date.now()
    
    try {
      const preloadPromises: Promise<any>[] = []
      
      // 1. Preload user profile
      if (activeConfig.profile) {
        preloadPromises.push(this.preloadProfile(user.id))
      }
      
      // 2. Preload app statistics
      if (activeConfig.stats) {
        preloadPromises.push(this.preloadStats())
      }
      
      // 3. Preload recent MBA schools (for quick access)
      if (activeConfig.recentMBASchools) {
        preloadPromises.push(this.preloadRecentMBASchools())
      }
      
      // 4. Preload user bookmarks
      if (activeConfig.userBookmarks) {
        preloadPromises.push(this.preloadUserBookmarks(user.id))
      }
      
      // 5. Preload upcoming deadlines
      if (activeConfig.upcomingDeadlines) {
        preloadPromises.push(this.preloadUpcomingDeadlines(user.id))
      }
      
      // Execute all preloads in parallel
      await Promise.allSettled(preloadPromises)
      
      const endTime = Date.now()
      console.log(`✅ Data preload completed in ${endTime - startTime}ms`)
      
    } catch (error) {
      console.error('❌ Error during data preload:', error)
    } finally {
      this.isPreloading = false
    }
  }

  private static async preloadProfile(userId: string): Promise<void> {
    const cacheKey = CacheKeys.profile(userId)
    
    await CacheManager.getOrFetch(
      cacheKey,
      async () => {
        const response = await fetch('/api/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const { profile, completion } = await response.json()
        return { profile, completion }
      },
      10 * 60 * 1000 // 10 minutes cache for profile
    )
  }

  private static async preloadStats(): Promise<void> {
    const cacheKey = CacheKeys.stats()
    
    await CacheManager.getOrFetch(
      cacheKey,
      async () => {
        const response = await fetch('/api/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const { data } = await response.json()
        return data
      },
      30 * 60 * 1000 // 30 minutes cache for stats
    )
  }

  private static async preloadRecentMBASchools(): Promise<void> {
    const params = { page: 1, limit: 20, sortBy: 'ranking', sortOrder: 'asc' }
    const cacheKey = CacheKeys.mbaSchools(params)
    
    await CacheManager.getOrFetch(
      cacheKey,
      async () => {
        const supabase = createClient()
        const { data, error, count } = await supabase
          .from('mba_schools')
          .select('*', { count: 'exact' })
          .order('ranking', { ascending: true })
          .range(0, 19)
        
        if (error) throw error
        
        return {
          data: data || [],
          pagination: {
            page: 1,
            limit: 20,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / 20),
            hasNext: (count || 0) > 20,
            hasPrev: false
          },
          success: true
        }
      },
      15 * 60 * 1000 // 15 minutes cache
    )
  }

  private static async preloadUserBookmarks(userId: string): Promise<void> {
    const bookmarkTypes = ['mba_school', 'university', 'scholarship']
    
    const preloadPromises = bookmarkTypes.map(async (type) => {
      const cacheKey = CacheKeys.bookmarks(userId, type)
      
      return CacheManager.getOrFetch(
        cacheKey,
        async () => {
          const supabase = createClient()
          const { data, error } = await supabase
            .from('bookmarks')
            .select('item_id')
            .eq('user_id', userId)
            .eq('item_type', type)
          
          if (error) throw error
          
          return data?.map(bookmark => bookmark.item_id) || []
        },
        20 * 60 * 1000 // 20 minutes cache
      )
    })
    
    await Promise.allSettled(preloadPromises)
  }

  private static async preloadUpcomingDeadlines(userId: string): Promise<void> {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    
    const params = {
      start: today.toISOString().split('T')[0],
      end: nextMonth.toISOString().split('T')[0]
    }
    const cacheKey = CacheKeys.deadlines(userId, params.start, params.end)
    
    await CacheManager.getOrFetch(
      cacheKey,
      async () => {
        const response = await fetch(`/api/deadlines?start=${params.start}&end=${params.end}`)
        if (!response.ok) throw new Error('Failed to fetch deadlines')
        const { deadlines } = await response.json()
        return deadlines
      },
      5 * 60 * 1000 // 5 minutes cache for deadlines
    )
  }

  // Preload critical data for specific pages
  static async preloadPageData(page: string, user?: User): Promise<void> {
    if (!user) return
    
    switch (page) {
      case 'mba-schools':
        await this.preloadMBASchoolsPageData()
        break
      case 'universities':
        await this.preloadUniversitiesPageData()
        break
      case 'scholarships':
        await this.preloadScholarshipsPageData()
        break
      case 'profile':
        await this.preloadProfile(user.id)
        break
      case 'timeline':
        await this.preloadUpcomingDeadlines(user.id)
        break
    }
  }

  private static async preloadMBASchoolsPageData(): Promise<void> {
    // Preload first 3 pages of MBA schools
    const pages = [1, 2, 3]
    const preloadPromises = pages.map(page => {
      const params = { page, limit: 6, sortBy: 'ranking', sortOrder: 'asc' }
      const cacheKey = CacheKeys.mbaSchools(params)
      
      return CacheManager.getOrFetch(
        cacheKey,
        async () => {
          const supabase = createClient()
          const offset = (page - 1) * 6
          const { data, error, count } = await supabase
            .from('mba_schools')
            .select('*', { count: 'exact' })
            .order('ranking', { ascending: true })
            .range(offset, offset + 5)
          
          if (error) throw error
          
          return {
            data: data || [],
            pagination: {
              page,
              limit: 6,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / 6),
              hasNext: page < Math.ceil((count || 0) / 6),
              hasPrev: page > 1
            },
            success: true
          }
        }
      )
    })
    
    await Promise.allSettled(preloadPromises)
  }

  private static async preloadUniversitiesPageData(): Promise<void> {
    const params = { page: 1, limit: 12, sortBy: 'name', sortOrder: 'asc' }
    const cacheKey = CacheKeys.universities(params)
    
    await CacheManager.getOrFetch(
      cacheKey,
      async () => {
        const supabase = createClient()
        const { data, error, count } = await supabase
          .from('universities')
          .select('*', { count: 'exact' })
          .order('name', { ascending: true })
          .range(0, 11)
        
        if (error) throw error
        
        return {
          data: data || [],
          pagination: {
            page: 1,
            limit: 12,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / 12),
            hasNext: (count || 0) > 12,
            hasPrev: false
          },
          success: true
        }
      }
    )
  }

  private static async preloadScholarshipsPageData(): Promise<void> {
    const params = { page: 1, limit: 10, sortBy: 'deadline', sortOrder: 'asc' }
    const cacheKey = CacheKeys.scholarships(params)
    
    await CacheManager.getOrFetch(
      cacheKey,
      async () => {
        const supabase = createClient()
        const { data, error, count } = await supabase
          .from('scholarships')
          .select('*', { count: 'exact' })
          .order('deadline', { ascending: true })
          .range(0, 9)
        
        if (error) throw error
        
        return {
          data: data || [],
          pagination: {
            page: 1,
            limit: 10,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / 10),
            hasNext: (count || 0) > 10,
            hasPrev: false
          },
          success: true
        }
      }
    )
  }

  // Clear all preloaded data
  static clearPreloadedData(): void {
    CacheManager.clear()
    console.log('🧹 Cleared all preloaded data')
  }

  // Get preload statistics
  static getPreloadStats() {
    return {
      ...CacheManager.getStats(),
      isPreloading: this.isPreloading
    }
  }
}

export default DataPreloader 