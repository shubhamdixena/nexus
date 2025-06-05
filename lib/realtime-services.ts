// Optimized Realtime Services with Memory Leak Prevention
import { supabase } from "@/lib/supabaseClient"
import type { 
  University, 
  Scholarship, 
  PaginatedResponse, 
  UniversityFilters, 
  ScholarshipFilters 
} from "@/types"

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
          query = query.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`)
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

// Types for the services (add these to your types file if needed)
export interface MBASchool {
  id: string
  university_id?: string
  name: string
  type: string
  location: string
  country: string
  ranking: number
  category: string
  duration: string
  tuition: string
  total_cost: string
  status: 'active' | 'inactive' | 'pending'
  description: string
  application_deadline: string
  class_size: number
  avg_gmat: number
  gmat_range: string
  avg_gpa: number
  acceptance_rate: string
  employment_rate: number
  avg_starting_salary: string
  top_industries: string
  start_date: string
  format: string
  year1_courses: string
  year2_courses: string
  teaching_methodology: string
  global_focus: string
  faculty_size: string
  research_centers: string
  application_requirements: string
  work_experience_requirement: string
  application_components: string
  class_profile: string
  international_students: string
  alumni_network: string
  campus_life: string
  website: string
  notable_alumni: string
  career_services: string
  student_clubs: string
  housing_options: string
  scholarships_available: string
  interview_process: string
  top_hiring_companies: string
  specializations: string[]
  top_recruiters: string[]
  program_duration: string
  tuition_per_year: string
  created_at?: string
  updated_at?: string
}

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
      this.cache.delete(firstKey)
    }
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  static async getMBASchools(params: FilterParams = {}): Promise<PaginatedResponse<MBASchool>> {
    const cacheKey = this.getCacheKey(params)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const { page = 1, limit = 10 } = params
      
      let query = QueryBuilder.buildQuery('mba_schools', params)
      query = QueryBuilder.applyPagination(query, page, limit)

      const { data, error, count } = await query

      if (error) throw new Error(`Database error: ${error.message}`)

      const result = {
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

      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      console.error('MBA Schools service error:', error)
      throw error
    }
  }

  static async createMBASchool(data: Partial<MBASchool>): Promise<MBASchool> {
    try {
      const { data: result, error } = await supabase
        .from('mba_schools')
        .insert([data])
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      
      // Clear cache when data changes
      this.cache.clear()
      
      return result
    } catch (error) {
      console.error('Error creating MBA school:', error)
      throw error
    }
  }

  static async updateMBASchool(id: string, data: Partial<MBASchool>): Promise<MBASchool> {
    try {
      const { data: result, error } = await supabase
        .from('mba_schools')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      
      // Clear cache when data changes
      this.cache.clear()
      
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
    const subscription = supabase
      .channel('mba_schools_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'mba_schools' },
        async () => {
          // Clear cache on real-time updates
          this.cache.clear()
          
          try {
            const { data } = await supabase
              .from('mba_schools')
              .select('*')
              .order('ranking', { ascending: true })
              .limit(100) // Limit to prevent memory issues
            
            if (data) callback(data)
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
}

// System Settings Realtime Service
export class SystemSettingsRealtimeService {
  static async getSystemSettings(params: FilterParams = {}): Promise<PaginatedResponse<SystemSettings>> {
    try {
      const { page = 1, limit = 50, search, sortBy = 'category', sortOrder = 'asc' } = params
      const offset = (page - 1) * limit

      let query = supabase
        .from('system_settings')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (search?.trim()) {
        query = query.or(`key.ilike.%${search}%,description.ilike.%${search}%,value.ilike.%${search}%`)
      }

      // Apply filters
      if (params.filters?.category) {
        query = query.eq('category', params.filters.category)
      }
      if (params.filters?.is_public !== undefined) {
        query = query.eq('is_public', params.filters.is_public)
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
      console.error('System settings service error:', error)
      throw error
    }
  }

  static async getSettingsByCategory(): Promise<Record<string, SystemSettings[]>> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true })

      if (error) throw new Error(`Database error: ${error.message}`)

      // Group settings by category
      const settingsByCategory: Record<string, SystemSettings[]> = {}
      data?.forEach(setting => {
        if (!settingsByCategory[setting.category]) {
          settingsByCategory[setting.category] = []
        }
        settingsByCategory[setting.category].push(setting)
      })

      return settingsByCategory
    } catch (error) {
      console.error('Error getting settings by category:', error)
      throw error
    }
  }

  static async createSystemSetting(data: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const { data: result, error } = await supabase
        .from('system_settings')
        .insert([data])
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error creating system setting:', error)
      throw error
    }
  }

  static async updateSystemSetting(id: string, data: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const { data: result, error } = await supabase
        .from('system_settings')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error updating system setting:', error)
      throw error
    }
  }

  static async deleteSystemSetting(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id)

      if (error) throw new Error(`Database error: ${error.message}`)
    } catch (error) {
      console.error('Error deleting system setting:', error)
      throw error
    }
  }

  static async getSettingByKey(key: string): Promise<SystemSettings | null> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', key)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Database error: ${error.message}`)
      }

      return data || null
    } catch (error) {
      console.error('Error getting setting by key:', error)
      throw error
    }
  }

  static async updateSettingByKey(key: string, value: string): Promise<SystemSettings> {
    try {
      const { data: result, error } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single()

      if (error) throw new Error(`Database error: ${error.message}`)
      return result
    } catch (error) {
      console.error('Error updating setting by key:', error)
      throw error
    }
  }

  static subscribeToSystemSettings(callback: (settings: SystemSettings[]) => void) {
    return supabase
      .channel('system_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'system_settings' },
        async () => {
          const { data } = await supabase
            .from('system_settings')
            .select('*')
            .order('category', { ascending: true })
            .order('key', { ascending: true })
          
          if (data) callback(data)
        }
      )
      .subscribe()
  }
}

// Re-export the existing UniversityRealtimeService from database-service
export { UniversityRealtimeService } from './database-service'