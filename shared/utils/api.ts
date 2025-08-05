// Shared API utilities for both web and mobile
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Helper function to make API calls with authentication
export async function apiCall<T = any>(
  endpoint: string, 
  options: RequestInit = {},
  authToken?: string
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Common API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: '/auth',
  
  // Profile
  PROFILE: '/profile',
  PROFILE_SECTION: '/profile/section',
  PROFILE_COMPLETE: '/profile/complete',
  
  // Schools
  MBA_SCHOOLS: '/mba-schools',
  SCHOOL_TARGETS: '/school-targets',
  
  // Scholarships
  SCHOLARSHIPS: '/scholarships',
  
  // Applications
  APPLICATIONS: '/applications',
  APPLICATION_PROGRESS: '/application-progress',
  APPLICATION_ESSAYS: '/application-essays',
  
  // Stats and analytics
  STATS: '/stats',
} as const

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]
