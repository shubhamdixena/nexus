/**
 * School Targets Data Layer
 * 
 * Centralized data management using React Query for school targets.
 * This replaces multiple fetch points with a single source of truth.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  SchoolTarget, 
  SchoolTargetsResponse, 
  SchoolTargetResponse,
  CreateSchoolTargetRequest,
  UpdateSchoolTargetRequest,
  MBASchoolOption,
  SchoolTargetFilters,
  SchoolTargetSortOptions 
} from '@/types/school-targets'

// Query Keys
export const schoolTargetKeys = {
  all: ['school-targets'] as const,
  lists: () => [...schoolTargetKeys.all, 'list'] as const,
  list: (userId: string, filters?: SchoolTargetFilters) => 
    [...schoolTargetKeys.lists(), userId, filters] as const,
  details: () => [...schoolTargetKeys.all, 'detail'] as const,
  detail: (id: string) => [...schoolTargetKeys.details(), id] as const,
}

export const schoolKeys = {
  all: ['schools'] as const,
  lists: () => [...schoolKeys.all, 'list'] as const,
  list: (filters?: any) => [...schoolKeys.lists(), filters] as const,
}

// API Functions
class SchoolTargetsAPI {
  static async getTargets(userId: string, filters?: SchoolTargetFilters): Promise<SchoolTargetsResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }
    
    const url = `/api/school-targets${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch school targets: ${response.statusText}`)
    }
    
    return response.json()
  }

  static async createTarget(data: CreateSchoolTargetRequest): Promise<SchoolTargetResponse> {
    const response = await fetch('/api/school-targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to create target: ${response.statusText}`)
    }
    
    return response.json()
  }

  static async updateTarget(data: UpdateSchoolTargetRequest): Promise<SchoolTargetResponse> {
    const response = await fetch('/api/school-targets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to update target: ${response.statusText}`)
    }
    
    return response.json()
  }

  static async deleteTarget(targetId: string): Promise<void> {
    const response = await fetch(`/api/school-targets?id=${targetId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Failed to delete target: ${response.statusText}`)
    }
  }

  static async getSchools(search?: string): Promise<MBASchoolOption[]> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    params.append('limit', '100') // Get more results for search
    
    const url = `/api/mba-schools${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch schools: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Transform the MBA schools data to match MBASchoolOption interface
    const schools = (data.data || []).map((school: any): MBASchoolOption => ({
      id: school.id,
      name: school.business_school || school.name || 'Unknown School',
      location: school.location || 'Unknown Location',
      country: school.country,
      qs_mba_rank: school.qs_mba_rank,
      ft_global_mba_rank: school.ft_global_mba_rank,
      bloomberg_mba_rank: school.bloomberg_mba_rank,
      website: school.website
    }))
    
    return schools
  }
}

// React Query Hooks
export function useSchoolTargets(
  userId: string, 
  filters?: SchoolTargetFilters,
  options?: { enabled?: boolean }
) {
  return useQuery<SchoolTargetsResponse, Error>({
    queryKey: schoolTargetKeys.list(userId, filters),
    queryFn: () => SchoolTargetsAPI.getTargets(userId, filters),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export function useCreateSchoolTarget(userId: string) {
  const queryClient = useQueryClient()
  
  return useMutation<SchoolTargetResponse, Error, CreateSchoolTargetRequest>({
    mutationFn: SchoolTargetsAPI.createTarget,
    onMutate: async (newTarget: CreateSchoolTargetRequest) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: schoolTargetKeys.lists() })
      
      // Snapshot previous value
      const previousTargets = queryClient.getQueryData(schoolTargetKeys.list(userId))
      
      // Optimistically update to the new value
      queryClient.setQueryData(schoolTargetKeys.list(userId), (old: SchoolTargetsResponse | undefined) => {
        if (!old) return old
        
        const optimisticTarget: SchoolTarget = {
          id: `temp-${Date.now()}`,
          school_id: newTarget.school_id,
          target_category: newTarget.target_category || 'target',
          program_of_interest: newTarget.program_of_interest,
          application_round: newTarget.application_round,
          notes: newTarget.notes,
          priority_score: newTarget.priority_score || 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          school_name: 'Loading...',
          location: 'Loading...',
          ranking_tier: 'unranked',
        }
        
        return {
          ...old,
          targets: [...old.targets, optimisticTarget],
          total_count: old.total_count + 1,
        }
      })
      
      return { previousTargets }
    },
    onError: (err: Error, newTarget: CreateSchoolTargetRequest, context: any) => {
      // Rollback on error
      if (context?.previousTargets) {
        queryClient.setQueryData(schoolTargetKeys.list(userId), context.previousTargets)
      }
    },
    onSuccess: () => {
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: schoolTargetKeys.lists() })
    },
  })
}

export function useUpdateSchoolTarget(userId: string) {
  const queryClient = useQueryClient()
  
  return useMutation<SchoolTargetResponse, Error, UpdateSchoolTargetRequest>({
    mutationFn: SchoolTargetsAPI.updateTarget,
    onMutate: async (updatedTarget: UpdateSchoolTargetRequest) => {
      await queryClient.cancelQueries({ queryKey: schoolTargetKeys.lists() })
      
      const previousTargets = queryClient.getQueryData(schoolTargetKeys.list(userId))
      
      queryClient.setQueryData(schoolTargetKeys.list(userId), (old: SchoolTargetsResponse | undefined) => {
        if (!old) return old
        
        return {
          ...old,
          targets: old.targets.map(target => 
            target.id === updatedTarget.id 
              ? { ...target, ...updatedTarget, updated_at: new Date().toISOString() }
              : target
          ),
        }
      })
      
      return { previousTargets }
    },
    onError: (err: Error, updatedTarget: UpdateSchoolTargetRequest, context: any) => {
      if (context?.previousTargets) {
        queryClient.setQueryData(schoolTargetKeys.list(userId), context.previousTargets)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolTargetKeys.lists() })
    },
  })
}

export function useDeleteSchoolTarget(userId: string) {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: SchoolTargetsAPI.deleteTarget,
    onMutate: async (targetId: string) => {
      await queryClient.cancelQueries({ queryKey: schoolTargetKeys.lists() })
      
      const previousTargets = queryClient.getQueryData(schoolTargetKeys.list(userId))
      
      queryClient.setQueryData(schoolTargetKeys.list(userId), (old: SchoolTargetsResponse | undefined) => {
        if (!old) return old
        
        return {
          ...old,
          targets: old.targets.filter(target => target.id !== targetId),
          total_count: Math.max(0, old.total_count - 1),
        }
      })
      
      return { previousTargets }
    },
    onError: (err: Error, targetId: string, context: any) => {
      if (context?.previousTargets) {
        queryClient.setQueryData(schoolTargetKeys.list(userId), context.previousTargets)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolTargetKeys.lists() })
    },
  })
}

export function useSchools(search?: string) {
  return useQuery<MBASchoolOption[], Error>({
    queryKey: schoolKeys.list({ search }),
    queryFn: () => SchoolTargetsAPI.getSchools(search),
    enabled: !search || search.length >= 2, // Only enable if no search or search is at least 2 characters
    staleTime: 30 * 60 * 1000, // 30 minutes - schools don't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  })
}

// Utility hooks
export function useSchoolTargetStats(userId: string) {
  const { data } = useSchoolTargets(userId)
  
  if (!data?.targets) {
    return {
      total: 0,
      byCategory: { target: 0, safety: 0, reach: 0 },
      byRanking: { 'top-10': 0, 'top-25': 0, 'top-50': 0, 'top-100': 0, 'unranked': 0 },
      avgPriority: 0,
      upcomingDeadlines: 0,
    }
  }
  
  const targets = data.targets
  const total = targets.length
  
  const byCategory = targets.reduce((acc: Record<string, number>, target: SchoolTarget) => {
    acc[target.target_category] = (acc[target.target_category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const byRanking = targets.reduce((acc: Record<string, number>, target: SchoolTarget) => {
    acc[target.ranking_tier] = (acc[target.ranking_tier] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const avgPriority = total > 0 
    ? targets.reduce((sum: number, target: SchoolTarget) => sum + target.priority_score, 0) / total 
    : 0
  
  const upcomingDeadlines = targets.filter((target: SchoolTarget) => 
    target.days_until_deadline !== undefined && 
    target.days_until_deadline <= 30 && 
    target.days_until_deadline >= 0
  ).length
  
  return {
    total,
    byCategory: { target: 0, safety: 0, reach: 0, ...byCategory },
    byRanking: { 'top-10': 0, 'top-25': 0, 'top-50': 0, 'top-100': 0, 'unranked': 0, ...byRanking },
    avgPriority: Math.round(avgPriority * 10) / 10,
    upcomingDeadlines,
  }
}
