"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import ActivityLogger from '@/lib/activity-logger'

interface UseActivityTrackerOptions {
  trackPageViews?: boolean
  trackClicks?: boolean
  trackFormSubmissions?: boolean
  trackScrolling?: boolean
  debounceMs?: number
}

export function useActivityTracker(options: UseActivityTrackerOptions = {}) {
  const {
    trackPageViews = true,
    trackClicks = false,
    trackFormSubmissions = true,
    trackScrolling = false,
    debounceMs = 1000
  } = options

  const pathname = usePathname()
  const lastScrollTime = useRef(0)
  const scrollTimeout = useRef<NodeJS.Timeout>()

  // Track page views automatically
  useEffect(() => {
    if (!trackPageViews) return

    const pageName = getPageName(pathname)
    ActivityLogger.trackPageVisit(pageName, pathname)
  }, [pathname, trackPageViews])

  // Track clicks on important elements
  useEffect(() => {
    if (!trackClicks) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target) return

      // Track clicks on buttons, links, and important elements
      if (target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.closest('[data-track-click]') ||
          target.closest('.card') ||
          target.closest('[role="button"]')) {
        
        const elementText = target.textContent?.trim() || target.getAttribute('aria-label') || 'Unknown element'
        const context = target.closest('[data-track-context]')?.getAttribute('data-track-context') || undefined
        
        ActivityLogger.trackClick(elementText, context)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [trackClicks])

  // Track form submissions
  useEffect(() => {
    if (!trackFormSubmissions) return

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement
      if (!form) return

      const formName = form.getAttribute('data-form-name') || 
                      form.getAttribute('name') || 
                      form.id || 
                      'Unknown form'

      // Track successful submission (we'll track failures in form components)
      ActivityLogger.trackFormSubmission(formName, true)
    }

    document.addEventListener('submit', handleSubmit)
    return () => document.removeEventListener('submit', handleSubmit)
  }, [trackFormSubmissions])

  // Track scrolling behavior (debounced)
  useEffect(() => {
    if (!trackScrolling) return

    const handleScroll = () => {
      const now = Date.now()
      if (now - lastScrollTime.current < debounceMs) return

      lastScrollTime.current = now

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      scrollTimeout.current = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        )

        if (scrollPercentage > 0 && scrollPercentage % 25 === 0) {
          ActivityLogger.logActivity({
            action: 'Scrolled',
            resource: 'Page',
            details: `${scrollPercentage}% of ${getPageName(pathname)}`
          })
        }
      }, 500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [trackScrolling, debounceMs, pathname])

  // Helper function to get readable page names
  function getPageName(path: string): string {
    const pathMap: Record<string, string> = {
      '/': 'Dashboard',
      '/profile': 'Profile',
      '/mba-schools': 'MBA Schools',
      '/universities': 'Universities',
      '/scholarships': 'Scholarships',
      '/applications': 'Applications',
      '/calendar': 'Calendar',
      '/documents': 'Documents',
      '/settings': 'Settings',
      '/timeline': 'Timeline',
      '/knowledge-base': 'Knowledge Base',
      '/documentation': 'Documentation'
    }

    // Handle dynamic routes
    if (path.startsWith('/mba-schools/')) {
      if (path.includes('/compare')) return 'MBA School Comparison'
      return 'MBA School Details'
    }
    if (path.startsWith('/universities/')) return 'University Details'
    if (path.startsWith('/scholarships/')) return 'Scholarship Details'
    if (path.startsWith('/auth/')) return 'Authentication'

    return pathMap[path] || path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return {
    trackEvent: ActivityLogger.logActivity.bind(ActivityLogger),
    trackClick: ActivityLogger.trackClick.bind(ActivityLogger),
    trackPageVisit: ActivityLogger.trackPageVisit.bind(ActivityLogger),
    trackFormSubmission: ActivityLogger.trackFormSubmission.bind(ActivityLogger),
    trackSearch: ActivityLogger.trackSearch.bind(ActivityLogger)
  }
} 