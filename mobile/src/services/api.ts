import { supabase } from '../utils/supabase'

// API Base URL - you'll need to replace this with your actual deployed URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' // For development
  : 'https://your-app.vercel.app' // For production

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Profile API calls
  async getProfile() {
    return this.makeRequest('/profile')
  }

  async updateProfile(data: any) {
    return this.makeRequest('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // MBA Schools API calls
  async getMBASchools(params?: {
    page?: number
    limit?: number
    search?: string
    country?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.country) searchParams.append('country', params.country)
    
    const query = searchParams.toString()
    return this.makeRequest(`/mba-schools${query ? `?${query}` : ''}`)
  }

  async getMBASchool(id: string) {
    return this.makeRequest(`/mba-schools/${id}`)
  }

  // School Targets API calls
  async getSchoolTargets() {
    return this.makeRequest('/school-targets')
  }

  async addSchoolTarget(data: {
    school_id: string
    target_category?: string
    program_of_interest?: string
    application_round?: string
    priority_score?: number
  }) {
    return this.makeRequest('/school-targets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async removeSchoolTarget(id: string) {
    return this.makeRequest(`/school-targets/${id}`, {
      method: 'DELETE',
    })
  }

  // Scholarships API calls
  async getScholarships(params?: {
    page?: number
    limit?: number
    search?: string
    type?: string
    country?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.type) searchParams.append('type', params.type)
    if (params?.country) searchParams.append('country', params.country)
    
    const query = searchParams.toString()
    return this.makeRequest(`/scholarships${query ? `?${query}` : ''}`)
  }

  async getScholarship(id: string) {
    return this.makeRequest(`/scholarships/${id}`)
  }
}

export const apiService = new ApiService()
