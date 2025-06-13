// Dashboard-specific performance preloader
import CacheManager from './cache-manager'
import { performanceMonitor } from './performance-optimizer'

interface PreloadConfig {
  enableImagePreload: boolean
  enableComponentPreload: boolean
  enableDataPreload: boolean
  criticalDataTtl: number
}

const DEFAULT_CONFIG: PreloadConfig = {
  enableImagePreload: true,
  enableComponentPreload: true,
  enableDataPreload: true,
  criticalDataTtl: 2 * 60 * 1000 // 2 minutes for critical data
}

class DashboardPreloader {
  private static config = DEFAULT_CONFIG
  private static preloadedComponents = new Set<string>()
  private static preloadedImages = new Set<string>()

  static configure(config: Partial<PreloadConfig>) {
    this.config = { ...this.config, ...config }
  }

  // Preload critical dashboard data immediately
  static async preloadCriticalData(userId?: string) {
    if (!this.config.enableDataPreload) return

    performanceMonitor.startTiming('CriticalDataPreload')

    const preloadTasks = []

    // Preload user profile if authenticated
    if (userId) {
      preloadTasks.push(
        CacheManager.getOrFetch(
          `profile:${userId}`,
          async () => {
            const response = await fetch('/api/profile')
            if (!response.ok) throw new Error('Failed to fetch profile')
            return await response.json()
          },
          this.config.criticalDataTtl
        )
      )
    }

    // Preload dashboard stats
    preloadTasks.push(
      CacheManager.getOrFetch(
        'stats',
        async () => {
          const response = await fetch('/api/stats')
          if (!response.ok) throw new Error('Failed to fetch stats')
          const { data } = await response.json()
          return data
        },
        this.config.criticalDataTtl
      )
    )

    try {
      await Promise.allSettled(preloadTasks)
      performanceMonitor.endTiming('CriticalDataPreload')
    } catch (error) {
      console.warn('Critical data preload failed:', error)
    }
  }

  // Preload dashboard images for faster rendering
  static async preloadDashboardImages() {
    if (!this.config.enableImagePreload) return

    const criticalImages = [
      '/diverse-students-learning.png',
      '/scholarship-opportunities.png',
      '/campus-quad.png'
    ]

    const imagePromises = criticalImages
      .filter(src => !this.preloadedImages.has(src))
      .map(src => {
        this.preloadedImages.add(src)
        return this.preloadImage(src)
      })

    try {
      await Promise.allSettled(imagePromises)
    } catch (error) {
      console.warn('Image preload failed:', error)
    }
  }

  // Preload heavy components in the background
  static preloadDashboardComponents() {
    if (!this.config.enableComponentPreload) return

    const componentsToPreload = [
      'admin-panel',
      'settings-panel',
      'profile-setup'
    ]

    componentsToPreload.forEach(component => {
      if (!this.preloadedComponents.has(component)) {
        this.preloadedComponents.add(component)
        this.preloadComponent(component)
      }
    })
  }

  // Preload a single component
  private static async preloadComponent(componentName: string) {
    try {
      switch (componentName) {
        case 'admin-panel':
          await import('../components/admin-panel')
          break
        case 'settings-panel':
          await import('../components/settings-panel')
          break
        case 'profile-setup':
          await import('../components/comprehensive-profile-setup')
          break
      }
    } catch (error) {
      console.warn(`Failed to preload component ${componentName}:`, error)
    }
  }

  // Optimized image preloading
  private static preloadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      const timeout = setTimeout(() => {
        resolve() // Don't fail the whole preload for slow images
      }, 3000) // 3 second timeout

      img.onload = () => {
        clearTimeout(timeout)
        resolve()
      }
      
      img.onerror = () => {
        clearTimeout(timeout)
        resolve() // Don't fail for missing images
      }
      
      img.src = src
    })
  }

  // Smart preloading based on user activity
  static smartPreload(userId?: string, currentPath = '/') {
    // Always preload critical data
    this.preloadCriticalData(userId)

    // Preload based on current route
    if (currentPath === '/') {
      this.preloadDashboardImages()
    }

    if (currentPath.includes('/settings') || userId) {
      this.preloadDashboardComponents()
    }

    // Preload next likely pages based on usage patterns
    this.preloadLikelyNextPages(currentPath)
  }

  // Preload likely next pages based on current page
  private static preloadLikelyNextPages(currentPath: string) {
    const nextPageMap: Record<string, string[]> = {
      '/': ['/profile', '/mba-schools', '/timeline'],
      '/profile': ['/profile-setup', '/documents'],
      '/mba-schools': ['/mba-schools/compare', '/applications'],
      '/settings': ['/profile', '/'],
    }

    const likelyPages = nextPageMap[currentPath] || []
    
    likelyPages.forEach(page => {
      // Prefetch the page (browser will cache it)
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = page
      document.head.appendChild(link)
    })
  }

  // Enhanced data preloading for specific sections
  static async preloadSectionData(section: string, userId?: string) {
    const sectionPreloaders: Record<string, () => Promise<any>> = {
      dashboard: () => this.preloadCriticalData(userId),
      profile: () => this.preloadProfileData(userId),
      mbaSchools: () => this.preloadMBASchoolsData(),
      settings: () => this.preloadSettingsData()
    }

    const preloader = sectionPreloaders[section]
    if (preloader) {
      try {
        await preloader()
      } catch (error) {
        console.warn(`Failed to preload ${section} data:`, error)
      }
    }
  }

  private static async preloadProfileData(userId?: string) {
    if (!userId) return

    await Promise.allSettled([
      CacheManager.getOrFetch(
        `bookmarks:${userId}:mba_schools`,
        async () => {
          const { bookmarkService } = await import('./bookmark-service')
          return await bookmarkService.getBookmarkedItemIds('mba_schools' as any)
        },
        10 * 60 * 1000
      ),
      CacheManager.getOrFetch(
        `deadlines:${userId}`,
        async () => {
          const response = await fetch('/api/deadlines')
          if (!response.ok) throw new Error('Failed to fetch deadlines')
          const { deadlines } = await response.json()
          return deadlines
        },
        5 * 60 * 1000
      )
    ])
  }

  private static async preloadMBASchoolsData() {
    const { OptimizedMBASchoolService } = await import('./optimized-realtime-services')
    await OptimizedMBASchoolService.getMBASchools({ page: 1, limit: 6 })
  }

  private static async preloadSettingsData() {
    // Preload system settings for admin users
    try {
      const { OptimizedSystemSettingsService } = await import('./optimized-realtime-services')
      await OptimizedSystemSettingsService.getSettingsByCategory()
    } catch (error) {
      // Not admin or no access
    }
  }

  // Get preload status for debugging
  static getPreloadStatus() {
    return {
      preloadedComponents: Array.from(this.preloadedComponents),
      preloadedImages: Array.from(this.preloadedImages),
      cacheStats: CacheManager.getStats()
    }
  }

  // Clear preload cache
  static clearPreloadCache() {
    this.preloadedComponents.clear()
    this.preloadedImages.clear()
  }
}

export default DashboardPreloader 