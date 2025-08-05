/**
 * School Targets Type Definitions
 * 
 * This file defines the complete type system for school targets,
 * ensuring consistency between database, API, and UI layers.
 */

// Core database schema (matches user_school_targets table)
export interface UserSchoolTargetDB {
  id: string
  user_id: string
  school_id: string
  target_category: 'target' | 'safety' | 'reach'
  program_of_interest?: string
  application_round?: string
  notes?: string
  priority_score: number
  created_at: string
  updated_at: string
}

// MBA School data (from mba_schools table)
export interface MBASchoolData {
  id: string
  business_school: string
  location: string
  country?: string
  website?: string
  qs_mba_rank?: number
  ft_global_mba_rank?: number
  bloomberg_mba_rank?: number
  mean_gmat?: number
  mean_gpa?: number
  avg_starting_salary?: string
  tuition_total?: string
  class_size?: number
  r1_deadline?: string
  r2_deadline?: string
  r3_deadline?: string
  application_deadlines?: string
}

// Combined data from API (what we actually work with)
export interface SchoolTarget {
  // From user_school_targets
  id: string
  school_id: string
  target_category: 'target' | 'safety' | 'reach'
  program_of_interest?: string
  application_round?: string
  notes?: string
  priority_score: number
  created_at: string
  updated_at: string
  
  // From mba_schools (joined data)
  school_name: string
  location: string
  country?: string
  website?: string
  qs_mba_rank?: number
  ft_global_mba_rank?: number
  bloomberg_mba_rank?: number
  mean_gmat?: number
  mean_gpa?: number
  avg_starting_salary?: string
  tuition_total?: string
  class_size?: number
  
  // Computed fields for UI
  ranking_tier: 'top-10' | 'top-25' | 'top-50' | 'top-100' | 'unranked'
  deadline?: string // Computed from application_round + school deadlines
  days_until_deadline?: number
  application_status?: ApplicationStatus
}

// Application status (if we have application tracking)
export type ApplicationStatus = 
  | 'not_started'
  | 'in_progress' 
  | 'application_submitted'
  | 'interview_invited'
  | 'interview_completed'
  | 'waitlisted'
  | 'accepted'
  | 'rejected'
  | 'deferred'

// For school selection/search
export interface MBASchoolOption {
  id: string
  name: string
  location: string
  country?: string
  qs_mba_rank?: number
  ft_global_mba_rank?: number
  bloomberg_mba_rank?: number
  website?: string
}

// API request/response types
export interface CreateSchoolTargetRequest {
  school_id: string
  target_category?: 'target' | 'safety' | 'reach'
  program_of_interest?: string
  application_round?: string
  notes?: string
  priority_score?: number
}

export interface UpdateSchoolTargetRequest {
  id: string
  target_category?: 'target' | 'safety' | 'reach'
  program_of_interest?: string
  application_round?: string
  notes?: string
  priority_score?: number
}

export interface SchoolTargetsResponse {
  targets: SchoolTarget[]
  total_count: number
}

export interface SchoolTargetResponse {
  target: SchoolTarget
}

// Component props types
export interface SchoolTargetSelectorProps {
  value?: SchoolTarget[]
  onChange?: (targets: SchoolTarget[]) => void
  userId: string
  maxTargets?: number
  allowedCategories?: Array<'target' | 'safety' | 'reach'>
  readonly?: boolean
}

export interface SchoolTargetCardProps {
  target: SchoolTarget
  onEdit?: (target: SchoolTarget) => void
  onDelete?: (targetId: string) => void
  onUpdateStatus?: (targetId: string, status: ApplicationStatus) => void
  readonly?: boolean
  showApplicationStatus?: boolean
}

// Filter and sort options
export interface SchoolTargetFilters {
  category?: Array<'target' | 'safety' | 'reach'>
  ranking_tier?: Array<'top-10' | 'top-25' | 'top-50' | 'top-100' | 'unranked'>
  application_round?: string[]
  priority_min?: number
  priority_max?: number
  has_deadline?: boolean
  application_status?: ApplicationStatus[]
}

export interface SchoolTargetSortOptions {
  field: 'priority_score' | 'deadline' | 'school_name' | 'ranking' | 'created_at'
  direction: 'asc' | 'desc'
}

// Loading and error states
export interface SchoolTargetsState {
  targets: SchoolTarget[]
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

// Utility types
export type SchoolTargetUpdate = Partial<Omit<SchoolTarget, 'id' | 'user_id' | 'school_id' | 'created_at'>>
export type NewSchoolTarget = Omit<SchoolTarget, 'id' | 'created_at' | 'updated_at' | 'ranking_tier' | 'deadline' | 'days_until_deadline'>
