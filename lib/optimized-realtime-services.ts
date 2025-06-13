// Optimized Realtime Services with Unified Caching
import { createClient } from "@/lib/supabaseClient"
import CacheManager, { CacheKeys } from '@/lib/cache-manager'
import type { 
  University, 
  Scholarship, 
  PaginatedResponse, 
  UniversityFilters, 
  ScholarshipFilters,
  FilterParams
} from "@/types"

// Re-export types from the original file for compatibility
export type {
  MBASchool,
  User,
  Application,
  ExtendedApplication,
  UserActivityLog,
  UserSegment,
  Message,
  SystemSettings,
  SOP,
  Sop,
  KeyElement,
  FilterParams
} from './realtime-services'

const supabase = createClient()

// Enhanced Query Builder with better caching keys
class OptimizedQueryBuilder {
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
        case 'universities':
          query = query.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`)
          break
        default:
          query = query.ilike('name', `%${searchTerm}%`)
      }
    }
    
    // Apply filters efficiently
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else {
          query = query.eq(key, value)
        }
      }
    })
    
    return query.order(sortBy, { ascending: sortOrder === 'asc' })
  }
  
  static applyPagination(query: any, page: number, limit: number) {
    const offset = (page - 1) * limit
    return query.range(offset, offset + limit - 1)
  }
}

// Optimized MBA Schools Service
export class OptimizedMBASchoolService {
  static async getMBASchools(params: FilterParams = {}): Promise<PaginatedResponse<any>> {
    const cacheKey = CacheKeys.mbaSchools(params)
    
    return CacheManager.getOrFetch(
      cacheKey,
      async () => {
        const { page = 1, limit = 10 } = params
        
        let query = OptimizedQueryBuilder.buildQuery('mba_schools', params)
        query = OptimizedQueryBuilder.applyPagination(query, page, limit)

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
      },
      5 * 60 * 1000 // 5 minutes cache
    )
  }

  static async getMBASchoolById(id: string): Promise<any> {
    const cacheKey = CacheKeys.mbaSchools({ id })
    
    return CacheManager.getOrFetch(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('mba_schools')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') return null
          throw new Error(`Database error: ${error.message}`)
        }

        return data
      },
      10 * 60 * 1000 // 10 minutes cache for individual items
    )
  }

  static async createMBASchool(data: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('mba_schools')
      .insert([data])
      .select()
      .single()

    if (error) throw new Error(`Database error: ${error.message}`)
    
    // Smart cache invalidation - only invalidate MBA school caches
    CacheManager.invalidate(/^mba_schools:/)
    
    return result
  }

  static async updateMBASchool(id: string, data: any): Promise<any> {
    const { data: result, error } = await supabase
      .from('mba_schools')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Database error: ${error.message}`)
    
    // Smart cache invalidation
    CacheManager.invalidate(/^mba_schools:/)
    
    return result
  }

  static async deleteMBASchool(id: string): Promise<void> {
    const { error } = await supabase
      .from('mba_schools')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Database error: ${error.message}`)
    
    // Smart cache invalidation
    CacheManager.invalidate(/^mba_schools:/)
  }
}

// Optimized System Settings Service (fixing the export issue)
export class OptimizedSystemSettingsService {
  static async getSettingsByCategory(category?: string): Promise<any[]> {
    const cacheKey = CacheKeys.systemSettings(category)
    
    return CacheManager.getOrFetch(
      cacheKey,
      async () => {
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
      },
      15 * 60 * 1000 // 15 minutes cache for system settings
    )
  }

  static async updateSystemSetting(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('system_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    CacheManager.invalidate(/^system_settings:/)
    return data
  }

  static async createSystemSetting(setting: any): Promise<any> {
    const { data, error } = await supabase
      .from('system_settings')
      .insert(setting)
      .select()
      .single()

    if (error) throw error
    
    CacheManager.invalidate(/^system_settings:/)
    return data
  }

  static async deleteSystemSetting(id: string): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('id', id)

    if (error) throw error
    
    CacheManager.invalidate(/^system_settings:/)
  }

  static subscribeToSystemSettings(callback: (settings: any[]) => void) {
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

    return subscription
  }

  static cleanup() {
    // Cleanup method for consistency
  }
}

// Export for immediate use - fixing the import error
export const SystemSettingsRealtimeService = OptimizedSystemSettingsService

// Re-export original services for components that haven't been migrated yet
export * from './realtime-services'