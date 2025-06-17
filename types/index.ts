export * from './database'
export type { Database } from './database'

// Common types used throughout the application
export interface User {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  role?: string | null
}

// Pagination interface
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  success: boolean
}

// Filter interfaces
export interface UniversityFilters {
  country?: string
  program?: string
  ranking?: string
  type?: string
}

export interface ScholarshipFilters {
  type?: string
  country?: string
  coverage?: string
  fieldOfStudy?: string
  degreeLevel?: string
}

export interface University {
  id: string
  name: string
  location: string
  country: string
  ranking?: number | null
  type?: string | null
  description?: string | null
  website?: string | null
  programs_offered?: string[] | null
  programs?: string[] | null // Alternative field name for compatibility
  created_at: string
  updated_at: string
}

// Import from master definition
import type { MBASchool as MasterMBASchool } from './mba-school-master'

// Use the master definition
export interface MBASchool extends MasterMBASchool {}

export interface Scholarship {
  id: string
  name: string // Maps to "Scholarship Name" from CSV
  host_country: string // Maps to "Host Country" from CSV
  host_organization: string // Maps to "Host Organization" from CSV  
  level_of_study: string // Maps to "Level of Study" from CSV
  deadline: string // Maps to "Latest Deadline (Approx.)" from CSV
  eligibility_criteria: string // Maps to "Eligibility Criteria (Key Points)" from CSV - HTML formatted
  benefits: string // Maps to "Benefits (Key Points)" from CSV - HTML formatted
  fully_funded: string // Maps to "Fully Funded?" from CSV
  official_url: string // Maps to "Official URL" from CSV
  
  // Legacy fields for backward compatibility
  description?: string | null
  provider?: string | null
  amount?: string | null
  eligibility?: string | null
  application_url?: string | null
  field_of_study?: string[] | null
  degree_level?: string[] | null
  countries?: string[] | null
  status?: string | null
  created_at: string
  updated_at: string
}

// Updated Application interface to support both university and MBA school applications
export interface Application {
  id: string
  user_id: string
  // Either university_id OR mba_school_id (never both)
  university_id?: string | null
  mba_school_id?: string | null
  program_name: string
  status: string
  submitted_date?: string | null
  deadline?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  // Derived fields for admin display
  student_name?: string
  email?: string
  school?: string
  // Helper field to determine application type
  application_type?: 'university' | 'mba_school'
}

// Type guards for application types
export function isUniversityApplication(app: Application): app is Application & { university_id: string } {
  return app.university_id !== null && app.university_id !== undefined
}

export function isMBASchoolApplication(app: Application): app is Application & { mba_school_id: string } {
  return app.mba_school_id !== null && app.mba_school_id !== undefined
}

export interface Document {
  id: string
  user_id: string
  name: string
  type: string
  file_path?: string | null
  file_url?: string | null
  size?: number | null
  status: string
  uploaded_at: string
  updated_at: string
}

// Data Correction System Types
export interface DataCorrectionReport {
  id: string
  reporter_id: string
  data_type: 'university' | 'mba_school' | 'scholarship' | 'deadline' | 'test_info' | 'sop' | 'general'
  data_id?: string | null
  data_table?: string | null
  issue_type: 'incorrect_info' | 'outdated_info' | 'missing_info' | 'broken_link' | 'wrong_deadline' | 'other'
  field_name?: string | null
  current_value?: string | null
  suggested_value?: string | null
  description: string
  evidence_urls?: string[] | null
  additional_notes?: string | null
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'implemented' | 'duplicate'
  priority: 'low' | 'medium' | 'high' | 'critical'
  reviewed_by?: string | null
  reviewed_at?: string | null
  admin_notes?: string | null
  implementation_notes?: string | null
  created_at: string
  updated_at: string
  // Joined fields for display
  reporter_name?: string
  reviewer_name?: string
}

export interface DataCorrectionAnalytics {
  id: string
  data_type: string
  data_table?: string | null
  field_name?: string | null
  issue_type: string
  report_count: number
  last_reported: string
}

export interface DataCorrectionHistory {
  id: string
  correction_id: string
  action: 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'implemented' | 'reopened'
  performed_by: string
  notes?: string | null
  old_status?: string | null
  new_status?: string | null
  created_at: string
  // Joined fields
  performer_name?: string
}