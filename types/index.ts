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
  created_at: string
  updated_at: string
}

export interface MBASchool {
  id: string
  name: string
  location: string
  country: string
  ranking?: number | null
  type?: string | null
  duration?: string | null
  tuition?: string | null
  total_cost?: string | null
  description?: string | null
  website?: string | null
  application_deadline?: string | null
  class_size?: number | null
  average_gmat?: number | null
  gmat_range?: string | null
  average_gpa?: number | null
  acceptance_rate?: number | null
  employment_rate?: number | null
  average_salary?: string | null
  status?: string | null
  created_at: string
  updated_at: string
}

export interface Scholarship {
  id: string
  name: string
  description?: string | null
  provider?: string | null
  amount?: string | null
  eligibility?: string | null
  deadline?: string | null
  application_url?: string | null
  field_of_study?: string[] | null
  degree_level?: string[] | null
  countries?: string[] | null
  benefits?: string | null
  status?: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
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