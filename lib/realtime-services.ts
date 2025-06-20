// Optimized Realtime Services with Memory Leak Prevention
import { createClient } from "@/lib/supabaseClient"
import type { 
  University, 
  Scholarship, 
  PaginatedResponse, 
  UniversityFilters, 
  ScholarshipFilters 
} from "@/types"
import type { MBASchool } from "@/types/mba-school-master"

// Create a client instance for real-time operations
const supabase = createClient()

// Connection pool to prevent subscription leaks
class SubscriptionManager {
  private static subscriptions = new Map<string, any>()
  
  static subscribe(key: string, subscription: any) {
    // Clean up existing subscription if exists
    if (this.subscriptions.has(key)) {
      this.subscriptions.get(key)?.unsubscribe()
    }
    
    this.subscriptions.set(key, subscription)
    return subscription
  }
  
  static unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(key)
    }
  }
  
  static cleanup() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe()
    })
    this.subscriptions.clear()
  }
}

// Optimize query builder to prevent memory leaks
class QueryBuilder {
  static buildQuery(table: string, params: FilterParams = {}) {
    const { search, sortBy = 'created_at', sortOrder = 'asc', filters = {} } = params
    
    let query = supabase.from(table).select('*', { count: 'exact' })
    
    // Optimize search with single OR condition
    if (search?.trim()) {
      const searchTerm = search.trim().toLowerCase()
      switch (table) {
        case 'mba_schools':
          query = query.or(`business_school.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
          break
        case 'scholarships':
          query = query.or(`name.ilike.%${searchTerm}%,provider.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`)
          break
        case 'users':
          query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          break
        default:
          query = query.ilike('name', `%${searchTerm}%`)
      }
    }
    
    // Apply filters efficiently
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query = query.eq(key, value)
      }
    })
    
    return query.order(sortBy, { ascending: sortOrder === 'asc' })
  }
  
  static applyPagination(query: any, page: number, limit: number) {
    const offset = (page - 1) * limit
    return query.range(offset, offset + limit - 1)
  }
}

// Import MBASchool type from types instead of redefining
// (This interface is now imported from @/types)

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'student'
  status: 'active' | 'inactive' | 'suspended'
  last_active: string
  phone?: string
  location?: string
  created_at?: string
  updated_at?: string
}

export interface Application {
  id: string
  user_id?: string
  university_id?: string
  student_name: string
  email: string
  school: string
  program: string
  status: 'submitted' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected' | 'waitlisted'
  submitted_date: string
  program_name?: string
  application_type?: 'undergraduate' | 'graduate' | 'mba' | 'phd'
  notes?: string
  documents?: any
  created_at?: string
  updated_at?: string
}

// Extended Application interface to match component usage
export interface ExtendedApplication extends Application {
  phone?: string
  communications?: Array<{
    id: string
    type: 'email' | 'phone' | 'meeting'
    content: string
    timestamp: string
    direction: 'inbound' | 'outbound'
  }>
  details?: {
    address?: string
    dateOfBirth?: string
    nationality?: string
    education?: Array<{
      institution: string
      degree: string
      year: string
      gpa?: string
    }>
    workExperience?: Array<{
      company: string
      position: string
      duration: string
      description?: string
    }>
    testScores?: {
      gmat?: string
      gre?: string
      toefl?: string
      ielts?: string
    }
  }
}

export interface UserActivityLog {
  id: string
  user_id?: string
  user_name: string
  action: string
  resource: string
  details?: string
  ip_address?: string
  user_agent?: string
  timestamp: string
  created_at?: string
}

export interface UserSegment {
  id: string
  name: string
  description?: string
  criteria: string
  user_count: number
  created_at?: string
  updated_at?: string
}

export interface Message {
  id: string
  user_id: string
  subject: string
  message: string
  status: 'sent' | 'delivered' | 'read'
  sent_at: string
  created_at?: string
  updated_at?: string
}

export interface SystemSettings {
  id: string
  key: string
  value: string
  category: 'general' | 'api' | 'email' | 'security' | 'features'
  description?: string
  is_public: boolean
  created_at?: string
  updated_at?: string
}

export interface SOP {
  id: string
  user_id?: string
  university_id?: string
  university: string
  program: string
  author: string
  field: string
  country: string
  status: 'active' | 'inactive'
  content?: string
  title?: string
  word_count?: number
  version?: number
  sop_status?: 'draft' | 'final' | 'submitted'
  created_at?: string
  updated_at?: string
}

// SOPs interface
export interface KeyElement {
  title: string;
  description: string;
}

export interface Sop {
  id: number;
  program: string;
  university: string;
  author: string;
  year: string;
  rating: number;
  excerpt: string;
  country: string;
  field: string;
  likes: number;
  views: number;
  content: string;
  key_elements: KeyElement[];
  featured?: boolean;
  status?: "published" | "draft" | "archived";
  created_at?: string;
  updated_at?: string;
}

export interface FilterParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

// Optimized MBA Schools Service with caching
export class MBASchoolRealtimeService {
  private static cache = new Map<string, { data: any, timestamp: number }>()
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private static getCacheKey(params: FilterParams): string {
    return JSON.stringify(params)
  }

  private static getFromCache(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private static setCache(key: string, data: any) {
    // Prevent cache from growing too large
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  static async getMBASchools(params: FilterParams = {}): Promise<PaginatedResponse<MBASchool>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'business_school', sortOrder = 'asc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('mba_schools')
        .select('*', { count: 'exact' })

      // Apply search filter using business_school (not name)
      if (search?.trim()) {
        query = query.or(`business_school.ilike.%${search}%,location.ilike.%${search}%,country.ilike.%${search}%`)
      }

      // Apply filters
      if (params.filters?.country) {
        query = query.eq('country', params.filters.country)
      }
      if (params.filters?.ranking_min) {
        query = query.gte('qs_mba_rank', params.filters.ranking_min)
      }
      if (params.filters?.ranking_max) {
        query = query.lte('qs_mba_rank', params.filters.ranking_max)
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      // Transform data to include computed fields for frontend compatibility
      const transformedData: MBASchool[] = (data || []).map((school: any): MBASchool => ({
        // Keep all original fields
        ...school,
        
        // Add computed fields for frontend compatibility
        avg_gmat: school.mean_gmat,
        avg_gpa: school.mean_gpa,
        women_percentage: school.women,
        international_percentage: school.international_students,
        
        // Application deadline aliases
        R1: school.r1_deadline,
        R2: school.r2_deadline,
        R3: school.r3_deadline,
        R4: school.r4_deadline,
        R5: school.r5_deadline,
        
        // Employment aliases
        employment_rate: school.employment_in_3_months_percent,
        
        // Process top hiring companies into array format
        top_hiring_companies_array: school.top_hiring_companies 
          ? school.top_hiring_companies.split(';').map((company: string) => company.trim()).filter((company: string) => company.length > 0)
          : [],
          
        // Default values for missing fields
        type: school.type || 'Full-time MBA',
        duration: school.duration || '2 years',
        
        // Extract country from location if not present
        country: school.country || (school.location ? school.location.split(',').pop()?.trim() : null),
        
        // Rankings (aliases)
        qs_rank: school.qs_mba_rank,
        ft_rank: school.ft_global_mba_rank,
        bloomberg_rank: school.bloomberg_mba_rank,
        
        // Combined ranking (best available)
        ranking: school.ft_global_mba_rank || school.qs_mba_rank || school.bloomberg_mba_rank || school.ranking
      }))

      const result = {
        data: transformedData,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1,
        },
        success: true,
      }

      const cacheKey = this.getCacheKey(params)
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('MBA Schools service error:', error)
      throw error
    }
  }

  static async createMBASchool(data: Partial<MBASchool>): Promise<MBASchool> {
    try {
      // No field mapping needed - database uses 'business_school' directly
      const dbData = { ...data }

      const { data: result, error } = await supabase
        .from('mba_schools')
        .insert([dbData])
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      
      // Clear cache when data changes
      this.cache.clear()
      
      // Return result directly - no field mapping needed
      return result
    } catch (error) {
      console.error('Error creating MBA school:', error)
      throw error
    }
  }

  static async updateMBASchool(id: string, data: Partial<MBASchool>): Promise<MBASchool> {
    try {
      // No field mapping needed - database uses 'business_school' directly
      const dbData = { ...data }

      const { data: result, error } = await supabase
        .from('mba_schools')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      
      // Clear cache when data changes
      this.cache.clear()
      
      // Return result directly - no field mapping needed
      return result
    } catch (error) {
      console.error('Error updating MBA school:', error)
      throw error
    }
  }

  static async deleteMBASchool(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('mba_schools')
        .delete()
        .eq('id', id)

      if (error) throw new Error(`Database error: ${error.message}`)
      
      // Clear cache when data changes
      this.cache.clear()
    } catch (error) {
      console.error('Error deleting MBA school:', error)
      throw error
    }
  }

  static subscribeToMBASchools(callback: (schools: MBASchool[]) => void) {
    const client = createClient()
    const subscription = client
      .channel('mba_schools_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'mba_schools' },
        async () => {
          // Clear cache on real-time updates
          this.cache.clear()
          
          try {
            const { data } = await client
              .from('mba_schools')
              .select('*')
              .order('ranking', { ascending: true })
              .limit(100) // Limit to prevent memory issues
            
            if (data) {
              // No transformation needed - database uses 'business_school' field directly
              callback(data)
            }
          } catch (error) {
            console.error('Subscription callback error:', error)
          }
        }
      )
      .subscribe()

    return SubscriptionManager.subscribe('mba_schools', subscription)
  }

  static cleanup() {
    this.cache.clear()
    SubscriptionManager.unsubscribe('mba_schools')
  }
}

// Scholarships Realtime Service
export class ScholarshipRealtimeService {
  static async getScholarships(params: FilterParams = {}): Promise<PaginatedResponse<Scholarship>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'deadline', sortOrder = 'asc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('scholarships')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (search?.trim()) {
        query = query.or(`name.ilike.%${search}%,provider.ilike.%${search}%,country.ilike.%${search}%`)
      }

      // Apply filters
      if (params.filters?.country) {
        query = query.eq('country', params.filters.country)
      }
      if (params.filters?.degree) {
        query = query.eq('degree', params.filters.degree)
      }
      if (params.filters?.status) {
        query = query.eq('status', params.filters.status)
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1,
        },
        success: true,
      }
    } catch (error) {
      console.error('Scholarships service error:', error)
      throw error
    }
  }

  static async createScholarship(data: Partial<Scholarship>): Promise<Scholarship> {
    try {
      const { data: result, error } = await supabase
        .from('scholarships')
        .insert([data])
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error creating scholarship:', error)
      throw error
    }
  }

  static async updateScholarship(id: string, data: Partial<Scholarship>): Promise<Scholarship> {
    try {
      const { data: result, error } = await supabase
        .from('scholarships')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error updating scholarship:', error)
      throw error
    }
  }

  static async deleteScholarship(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', id)

      if (error) throw new Error(`Database error: ${error.message}`)
    } catch (error) {
      console.error('Error deleting scholarship:', error)
      throw error
    }
  }
}

// User Management Realtime Service
export class UserRealtimeService {
  static async getUsers(params: FilterParams = {}): Promise<PaginatedResponse<User>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })

      if (search?.trim()) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,location.ilike.%${search}%`)
      }

      if (params.filters?.role) {
        query = query.eq('role', params.filters.role)
      }
      if (params.filters?.status) {
        query = query.eq('status', params.filters.status)
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1,
        },
        success: true,
      }
    } catch (error) {
      console.error('Users service error:', error)
      throw error
    }
  }

  static async createUser(data: Partial<User>): Promise<User> {
    try {
      const { data: result, error } = await supabase
        .from('users')
        .insert([data])
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const { data: result, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw new Error(`Database error: ${error.message}`)
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }
}

// Application Management Realtime Service
export class ApplicationRealtimeService {
  static async getApplications(params: FilterParams = {}): Promise<PaginatedResponse<Application>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'submitted_date', sortOrder = 'desc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('applications')
        .select(`
          *,
          universities:university_id(name, location),
          users:user_id(name, email)
        `, { count: 'exact' })

      if (search?.trim()) {
        query = query.or(`student_name.ilike.%${search}%,email.ilike.%${search}%,school.ilike.%${search}%,program.ilike.%${search}%`)
      }

      if (params.filters?.status) {
        query = query.eq('status', params.filters.status)
      }
      if (params.filters?.program) {
        query = query.eq('program', params.filters.program)
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const {
        data,
        error,
        count
      } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1,
        },
        success: true,
      }
    } catch (error) {
      console.error('Applications service error:', error)
      throw error
    }
  }

  static async createApplication(data: Partial<Application>): Promise<Application> {
    try {
      const { data: result, error } = await supabase
        .from('applications')
        .insert([data])
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error creating application:', error)
      throw error
    }
  }

  static async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    try {
      const { data: result, error } = await supabase
        .from('applications')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error updating application:', error)
      throw error
    }
  }

  static async deleteApplication(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (error) throw new Error(`Database error: ${error.message}`)
    } catch (error) {
      console.error('Error deleting application:', error)
      throw error
    }
  }

  static async updateApplicationStatus(id: string, status: Application['status']): Promise<Application> {
    try {
      const { data: result, error } = await supabase
        .from('applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error updating application status:', error)
      throw error
    }
  }
}

// Advanced User Management Services
export class AdvancedUserRealtimeService {
  static async getUserActivityLogs(params: FilterParams = {}): Promise<PaginatedResponse<UserActivityLog>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'timestamp', sortOrder = 'desc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('user_activity_logs')
        .select('*', { count: 'exact' })

      if (search?.trim()) {
        query = query.or(`user_name.ilike.%${search}%,action.ilike.%${search}%,resource.ilike.%${search}%`)
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1,
        },
        success: true,
      }
    } catch (error) {
      console.error('User activity logs service error:', error)
      throw error
    }
  }

  static async getUserSegments(): Promise<UserSegment[]> {
    try {
      const { data, error } = await supabase
        .from('user_segments')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw new Error(`Database error: ${error.message}`)
      return data || []
    } catch (error) {
      console.error('User segments service error:', error)
      throw error
    }
  }

  static async getMessages(params: FilterParams = {}): Promise<PaginatedResponse<Message>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'desc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('messages')
        .select(`
          *,
          user_segments:segment_id(name, description)
        `, { count: 'exact' })

      if (search?.trim()) {
        query = query.ilike('title', `%${search}%`)
      }

      if (params.filters?.status) {
        query = query.eq('status', params.filters.status)
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1,
        },
        success: true,
      }
    } catch (error) {
      console.error('Messages service error:', error)
      throw error
    }
  }
}

// SOPs Realtime Service
export class SOPRealtimeService {
  static async getSOPs(params: FilterParams = {}): Promise<PaginatedResponse<SOP>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'desc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('sops')
        .select(`
          *,
          universities:university_id(name, location),
          users:user_id(name, email)
        `, { count: 'exact' })

      // Apply search filter
      if (search?.trim()) {
        query = query.or(`title.ilike.%${search}%,university.ilike.%${search}%,program.ilike.%${search}%,author.ilike.%${search}%,field.ilike.%${search}%,country.ilike.%${search}%`)
      }

      // Apply filters
      if (params.filters?.university) {
        query = query.eq('university', params.filters.university)
      }
      if (params.filters?.program) {
        query = query.eq('program', params.filters.program)
      }
      if (params.filters?.field) {
        query = query.eq('field', params.filters.field)
      }
      if (params.filters?.country) {
        query = query.eq('country', params.filters.country)
      }
      if (params.filters?.status) {
        query = query.eq('status', params.filters.status)
      }
      if (params.filters?.sop_status) {
        query = query.eq('sop_status', params.filters.sop_status)
      }

      // Apply sorting and pagination
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1,
        },
        success: true,
      }
    } catch (error) {
      console.error('SOPs service error:', error)
      throw error
    }
  }

  static async createSOP(data: Partial<SOP>): Promise<SOP> {
    try {
      const sopData = {
        ...data,
        word_count: data.content ? data.content.split(' ').length : 0,
        version: 1,
        sop_status: data.sop_status || 'draft'
      }

      const { data: result, error } = await supabase
        .from('sops')
        .insert([sopData])
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error creating SOP:', error)
      throw error
    }
  }

  static async updateSOP(id: string, data: Partial<SOP>): Promise<SOP> {
    try {
      const updateData = {
        ...data,
        ...(data.content && { word_count: data.content.split(' ').length })
      }

      const { data: result, error } = await supabase
        .from('sops')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error updating SOP:', error)
      throw error
    }
  }

  static async deleteSOP(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sops')
        .delete()
        .eq('id', id)

      if (error) throw new Error(`Database error: ${error.message}`)
    } catch (error) {
      console.error('Error deleting SOP:', error)
      throw error
    }
  }

  static async updateSOPStatus(id: string, status: SOP['status']): Promise<SOP> {
    try {
      const { data: result, error } = await supabase
        .from('sops')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error updating SOP status:', error)
      throw error
    }
  }

  static async bulkUpdateSOPStatus(ids: string[], status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sops')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids)

      if (error) throw new Error(`Database error: ${error.message}`)
    } catch (error) {
      console.error('Error bulk updating SOP status:', error)
      throw error
    }
  }

  static subscribeToSOPs(callback: (sops: SOP[]) => void) {
    const client = createClient()
    const subscription = client
      .channel('sops_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sops' },
        async () => {
          try {
            const { data } = await client
              .from('sops')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(100)
            
            if (data) callback(data)
          } catch (error) {
            console.error('SOP subscription callback error:', error)
          }
        }
      )
      .subscribe()

    return SubscriptionManager.subscribe('sops', subscription)
  }
}

// University Realtime Service
export class SystemSettingsRealtimeService {
  static async getSettingsByCategory(category?: string): Promise<SystemSettings[]> {
    try {
      let query = supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching system settings:', error)
      throw error
    }
  }

  static async updateSystemSetting(id: string, updates: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating system setting:', error)
      throw error
    }
  }

  static async createSystemSetting(setting: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .insert(setting)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating system setting:', error)
      throw error
    }
  }

  static async deleteSystemSetting(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting system setting:', error)
      throw error
    }
  }

  static subscribeToSystemSettings(callback: (settings: SystemSettings[]) => void) {
    const subscription = supabase
      .channel('system_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'system_settings' }, 
        async () => {
          try {
            const settings = await this.getSettingsByCategory()
            callback(settings)
          } catch (error) {
            console.error('Error in system settings subscription:', error)
          }
        }
      )
      .subscribe()

    return SubscriptionManager.subscribe('system_settings', subscription)
  }

  static cleanup() {
    SubscriptionManager.unsubscribe('system_settings')
  }
}

export class UniversityRealtimeService {
  static async getUniversities(params: FilterParams = {}): Promise<PaginatedResponse<University>> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('universities')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (search?.trim()) {
        query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,country.ilike.%${search}%`)
      }

      // Apply filters
      if (params.filters?.country) {
        query = query.eq('country', params.filters.country)
      }
      if (params.filters?.program) {
        query = query.contains('programs', [params.filters.program])
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page < Math.ceil((count || 0) / limit),
          hasPrev: page > 1,
        },
        success: true,
      }
    } catch (error) {
      console.error('Universities service error:', error)
      throw error
    }
  }

  static async getUniversityById(id: string): Promise<University | null> {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No data found
        }
        console.error('Error fetching university by ID:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error fetching university by ID:', error)
      return null
    }
  }

  static subscribeToUniversities(callback: (universities: University[]) => void) {
    const client = createClient()
    const subscription = client
      .channel('universities_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'universities' },
        async () => {
          try {
            const { data } = await client
              .from('universities')
              .select('*')
              .order('name', { ascending: true })
              .limit(100)
            
            if (data) callback(data)
          } catch (error) {
            console.error('University subscription callback error:', error)
          }
        }
      )
      .subscribe()

    return SubscriptionManager.subscribe('universities', subscription)
  }
}