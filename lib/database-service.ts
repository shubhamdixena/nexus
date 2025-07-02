import type { 
  University, 
  Scholarship, 
  Document, 
  PaginatedResponse, 
  UniversityFilters, 
  ScholarshipFilters 
} from "@/types"
import { createClient } from "@/lib/supabaseClient"

// Create a client instance for real-time operations
const supabase = createClient()

// Real-time University Service using direct Supabase client
export class UniversityRealtimeService {
  static async getUniversities(params: {
    page?: number
    limit?: number
    search?: string
    filters?: UniversityFilters
  } = {}): Promise<PaginatedResponse<University>> {
    try {
      const { page = 1, limit = 10, search, filters } = params
      const offset = (page - 1) * limit

      // Start building the query
      let query = supabase
        .from("universities")
        .select("*", { count: "exact" })

      // Apply search filter
      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,country.ilike.%${search}%`)
      }

      // Apply country filter
      if (filters?.country) {
        query = query.eq("country", filters.country)
      }

      // Apply program filter
      if (filters?.program) {
        query = query.contains("programs", [filters.program])
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)
      query = query.order("university_name", { ascending: true })

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching universities:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw new Error(`Database error: ${error.message}`)
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        success: true,
      }
    } catch (error) {
      console.error("University service error:", error)
      throw error
    }
  }

  static async getUniversityById(id: string): Promise<University | null> {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No data found
        }
        console.error("Error fetching university by ID:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error("Error fetching university by ID:", error)
      return null
    }
  }

  static subscribeToUniversities(callback: (universities: University[]) => void) {
    const client = createClient()
    return client
      .channel('universities_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'universities' },
        async () => {
          // Fetch updated data
          const { data } = await client
            .from('universities')
            .select('*')
            .order('university_name', { ascending: true })
          
          if (data) {
            callback(data)
          }
        }
      )
      .subscribe()
  }
}

// University Services - Use real-time service directly
export class UniversityService {
  static async getUniversities(params: {
    page?: number
    limit?: number
    search?: string
    filters?: UniversityFilters
  } = {}): Promise<PaginatedResponse<University>> {
    return UniversityRealtimeService.getUniversities(params)
  }

  static async createUniversity(data: Partial<University>): Promise<University> {
    const response = await fetch("/api/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create university")
    }
    const result = await response.json()
    return result.data
  }

  static async getUniversityById(id: string): Promise<University | null> {
    try {
      const response = await fetch(`/api/universities/${id}`)
      if (!response.ok) return null
      const result = await response.json()
      return result.data
    } catch {
      return null
    }
  }
}

// Scholarship Services
export class ScholarshipService {
  static async getScholarships(params: {
    page?: number
    limit?: number
    search?: string
    filters?: ScholarshipFilters
  } = {}): Promise<PaginatedResponse<Scholarship>> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.set("page", params.page.toString())
    if (params.limit) searchParams.set("limit", params.limit.toString())
    if (params.search) searchParams.set("search", params.search)
    if (params.filters?.type) searchParams.set("type", params.filters.type)
    if (params.filters?.country) searchParams.set("country", params.filters.country)
    if (params.filters?.coverage) searchParams.set("coverage", params.filters.coverage)

    const response = await fetch(`/api/scholarships?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch scholarships")
    }
    return response.json()
  }

  static async createScholarship(data: Partial<Scholarship>): Promise<Scholarship> {
    const response = await fetch("/api/scholarships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to create scholarship")
    }
    const result = await response.json()
    return result.data
  }
}

// Document Services
export class DocumentService {
  static async getUserDocuments(params: {
    userId: string
    page?: number
    limit?: number
    type?: string
    status?: string
  }): Promise<PaginatedResponse<Document>> {
    const searchParams = new URLSearchParams()
    
    searchParams.set("user_id", params.userId)
    if (params.page) searchParams.set("page", params.page.toString())
    if (params.limit) searchParams.set("limit", params.limit.toString())
    if (params.type) searchParams.set("type", params.type)
    if (params.status) searchParams.set("status", params.status)

    const response = await fetch(`/api/documents?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch documents")
    }
    return response.json()
  }

  static async uploadDocument(data: {
    user_id: string
    name: string
    type: string
    file_url: string
    file_size: number
    mime_type: string
    application_id?: string
  }): Promise<Document> {
    const response = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error("Failed to upload document")
    }
    const result = await response.json()
    return result.data
  }

  static async deleteDocument(documentId: string, userId: string): Promise<void> {
    const response = await fetch(`/api/documents?id=${documentId}&user_id=${userId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete document")
    }
  }
}

// Utility Functions
export class ApiUtils {
  static handleApiError(error: any): string {
    if (error?.message) return error.message
    if (typeof error === "string") return error
    return "An unexpected error occurred"
  }

  static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

// Search and Filter Utilities
export class SearchUtils {
  static buildSearchParams(params: Record<string, any>): URLSearchParams {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()))
        } else {
          searchParams.set(key, value.toString())
        }
      }
    })
    
    return searchParams
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }
}