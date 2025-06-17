// Dashboard-specific performance preloader
import CacheManager from './cache-manager'
import { performanceMonitor } from './performance-optimizer'

interface PreloadConfig {
  enableImagePreload: boolean
  enableComponentPreload: boolean
  enableDataPreload: boolean
  criticalDataTtl: number
  prioritizeCriticalPath: boolean
  useSkeleton: boolean
}

const DEFAULT_CONFIG: PreloadConfig = {
  enableImagePreload: true,
  enableComponentPreload: true,
  enableDataPreload: true,
  criticalDataTtl: 2 * 60 * 1000, // 2 minutes for critical data
  prioritizeCriticalPath: true,  // Prioritize critical path rendering
  useSkeleton: true              // Use skeleton loading for non-critical content
}

class DashboardPreloader {
  private static config = DEFAULT_CONFIG
  private static preloadedComponents = new Set<string>()
  private static preloadedImages = new Set<string>()
  private static criticalPathLoaded = false

  static configure(config: Partial<PreloadConfig>) {
    this.config = { ...this.config, ...config }
  }

  // Preload critical dashboard data immediately
  static async preloadCriticalData(userId?: string) {
    if (!this.config.enableDataPreload) return

    performanceMonitor.startTiming('CriticalDataPreload')

    // Split into critical vs non-critical data
    if (this.config.prioritizeCriticalPath) {
      // Load only critical path data first (user profile)
      if (userId) {
        try {
          await CacheManager.getOrFetch(
            `profile:${userId}`,
            async () => {
              const response = await fetch('/api/profile')
              if (!response.ok) throw new Error('Failed to fetch profile')
              return await response.json()
            },
            this.config.criticalDataTtl
          )
          this.criticalPathLoaded = true
        } catch (error) {
          console.warn('Critical profile data preload failed:', error)
        }
      }
      
      // Load non-critical data asynchronously after a delay
      setTimeout(() => {
        this.preloadNonCriticalData()
      }, 100)
    } else {
      // Original behavior - load everything at once
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
        this.criticalPathLoaded = true
        performanceMonitor.endTiming('CriticalDataPreload')
      } catch (error) {
        console.warn('Critical data preload failed:', error)
      }
    }
  }

  // Load non-critical data after critical path is rendered
  private static async preloadNonCriticalData() {
    performanceMonitor.startTiming('NonCriticalDataPreload')
    
    const preloadTasks = []
    
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
    
    // Preload deadlines
    preloadTasks.push(
      CacheManager.getOrFetch(
        'deadlines',
        async () => {
          const response = await fetch('/api/deadlines')
          if (!response.ok) throw new Error('Failed to fetch deadlines')
          const { data } = await response.json()
          return data
        },
        this.config.criticalDataTtl
      )
    )
    
    try {
      await Promise.allSettled(preloadTasks)
      performanceMonitor.endTiming('NonCriticalDataPreload')
    } catch (error) {
      console.warn('Non-critical data preload failed:', error)
    }
  }

  // Preload dashboard images for faster rendering
  static async preloadDashboardImages() {
    if (!this.config.enableImagePreload) return

    // Split images into critical vs non-critical
    const criticalImages = [
      '/diverse-students-learning.png'
    ]
    
    const nonCriticalImages = [
      '/scholarship-opportunities.png',
      '/campus-quad.png'
    ]

    // Load critical images immediately
    const criticalImagePromises = criticalImages
      .filter(src => !this.preloadedImages.has(src))
      .map(src => {
        this.preloadedImages.add(src)
        return this.preloadImage(src)
      })

    try {
      await Promise.allSettled(criticalImagePromises)
    } catch (error) {
      console.warn('Critical image preload failed:', error)
    }
    
    // Defer non-critical images
    setTimeout(() => {
      const nonCriticalImagePromises = nonCriticalImages
        .filter(src => !this.preloadedImages.has(src))
        .map(src => {
          this.preloadedImages.add(src)
          return this.preloadImage(src)
        })
      
      Promise.allSettled(nonCriticalImagePromises).catch(error => {
        console.warn('Non-critical image preload failed:', error)
      })
    }, 200)
  }

  // Preload heavy components in the background
  static preloadDashboardComponents() {
    if (!this.config.enableComponentPreload) return

    // Critical components to load immediately
    const criticalComponents = [
      'profile'
    ]
    
    // Non-critical components to load after delay
    const nonCriticalComponents = [
      'admin-panel',
      'settings-panel'
    ]

    // Load critical components immediately
    criticalComponents.forEach(component => {
      if (!this.preloadedComponents.has(component)) {
        this.preloadedComponents.add(component)
        this.preloadComponent(component)
      }
    })
    
    // Defer non-critical components
    setTimeout(() => {
      nonCriticalComponents.forEach(component => {
        if (!this.preloadedComponents.has(component)) {
          this.preloadedComponents.add(component)
          this.preloadComponent(component)
        }
      })
    }, 300)
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
        case 'profile':
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
      '/profile': ['/documents'],
      '/mba-schools': ['/mba-schools/compare', '/applications'],
      '/settings': ['/profile', '/'],
    }

    const likelyPages = nextPageMap[currentPath] || []
    
    // Stagger the prefetching to not block main thread
    likelyPages.forEach((page, index) => {
      setTimeout(() => {
        // Prefetch the page (browser will cache it)
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = page
        document.head.appendChild(link)
      }, index * 100) // Stagger by 100ms per page
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

  static getPreloadStatus() {
    return {
      criticalPathLoaded: this.criticalPathLoaded,
      preloadedComponents: Array.from(this.preloadedComponents),
      preloadedImages: Array.from(this.preloadedImages),
      config: this.config
    }
  }

  static clearPreloadCache() {
    this.preloadedComponents.clear()
    this.preloadedImages.clear()
    this.criticalPathLoaded = false
    CacheManager.clear()
  }
}

export default DashboardPreloader 