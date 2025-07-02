// Independent entity types - Universities and MBA Schools are separate

export interface University {
  id: string
  university_name: string
  location: string
  country: string
  ranking?: string | null          // General university ranking
  programs?: string[] | null       // Basic program overview
  website?: string | null
  description?: string | null
  logo_url?: string | null
  established_year?: number | null
  student_count?: number | null
  acceptance_rate?: number | null
  tuition_fees?: string | null
  created_at: string
  updated_at: string
  
  // University-specific fields for general exploration
  campus_size?: string | null
  research_focus?: string[] | null
  notable_faculty?: string | null
  undergraduate_programs?: string[] | null
  graduate_programs?: string[] | null
}

// Import the master MBA School type definition
import type { MBASchool as MasterMBASchool } from './mba-school-master'

// Use the master definition for independent entities
export interface MBASchool extends MasterMBASchool {
  // Add any independent entity specific fields if needed
  // This ensures complete compatibility with all database fields
}

// Independent application types
export interface UniversityApplication {
  id: string
  user_id: string
  university_id: string              // References universities table
  program_name: string
  application_type: 'undergraduate' | 'graduate' | 'phd'
  status: string
  submitted_date?: string | null
  deadline?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface MBAApplication {
  id: string
  user_id: string
  mba_school_id: string             // References mba_schools table
  program_name: string
  application_type: 'full-time' | 'part-time' | 'executive' | 'online'
  status: string
  submitted_date?: string | null
  deadline?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

// Search and filter types
export interface UniversityFilters {
  country?: string
  ranking?: string
  program_type?: string
  tuition_range?: string
}

export interface MBASchoolFilters {
  country?: string
  classification?: string           // M7, T15, Top 30
  type?: string                    // Full-time, Part-time, etc.
  gmat_range?: string
  tuition_range?: string
  ranking_min?: number
  ranking_max?: number
}

// Analytics types for independent tracking
export interface UniversityStats {
  total_universities: number
  universities_by_country: Record<string, number>
  popular_programs: string[]
}

export interface MBASchoolStats {
  total_mba_schools: number
  m7_count: number
  t15_count: number
  top30_count: number
  schools_by_country: Record<string, number>
  average_gmat: number
  average_tuition: number
} 