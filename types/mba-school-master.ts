/**
 * Master MBA School Type Definition
 * 
 * This is the definitive interface that matches the actual database schema.
 * All other MBASchool interfaces should extend or reference this.
 * 
 * Database contains 42+ columns as of latest schema update.
 */

// Core database row interface (matches actual Supabase schema)
export interface MBASchoolRow {
  // Primary fields
  id: string
  number?: number | null
  business_school?: string | null  // Primary name field (standardized)
  description?: string | null
  location?: string | null
  country?: string | null
  website?: string | null
  
  // Class demographics
  class_size?: number | null
  women?: number | null  // Percentage of women
  women_percentage?: number | null
  international_students?: string | null
  international_students_percentage?: number | null
  
  // Test scores and academic requirements (standardized field names)
  mean_gmat?: number | null  // Primary GMAT field
  mean_gpa?: number | null   // Primary GPA field
  avg_gre?: number | null
  avg_work_exp_years?: number | null
  
  // Financial information
  avg_starting_salary?: string | null
  tuition_total?: string | null  // Primary tuition field
  application_fee?: string | null
  weighted_salary_usd?: string | null
  
  // Application deadlines and rounds
  r1_deadline?: string | null
  r2_deadline?: string | null
  r3_deadline?: string | null
  r4_deadline?: string | null
  r5_deadline?: string | null
  application_deadlines?: string | null
  gmat_gre_waiver_available?: boolean | null
  admissions_rounds?: string | null
  
  // Rankings
  qs_mba_rank?: number | null
  ft_global_mba_rank?: number | null
  bloomberg_mba_rank?: number | null
  
  // Employment statistics
  employment_in_3_months_percent?: number | null
  
  // Companies and industries
  top_hiring_companies?: string | null
  
  // Alumni information
  alumni_network_strength?: string | null
  alumnus_1?: string | null
  alumnus_2?: string | null
  alumnus_3?: string | null
  alumnus_4?: string | null
  
  // Program details (from database schema)
  core_curriculum?: string | null
  program_duration?: string | null
  credits_required?: string | null
  key_features?: string | null
  stem_designation?: boolean | null
  
  // Additional application info
  class_profile?: string | null
  
  // Timestamps
  created_at?: string
  updated_at?: string
}

// Frontend-friendly interface (computed/transformed fields)
export interface MBASchool extends MBASchoolRow {
  // Legacy field aliases for backward compatibility (DEPRECATED - will be removed)
  name?: string | null              // Alias for business_school
  avg_gmat?: number | null          // Alias for mean_gmat  
  avg_gpa?: number | null           // Alias for mean_gpa
  tuition?: string | null           // Alias for tuition_total
  
  // Application deadline aliases
  R1?: string | null        // Alias for r1_deadline
  R2?: string | null        // Alias for r2_deadline
  R3?: string | null        // Alias for r3_deadline
  R4?: string | null        // Alias for r4_deadline
  R5?: string | null        // Alias for r5_deadline
  
  // Employment aliases
  employment_rate?: number | null  // Alias for employment_in_3_months_percent
  employment_in_3_months?: string | null  // Formatted percentage string
  
  // Alumni structured data
  notable_alumni_structured?: Array<{
    name: string
    title: string
  }> | null
  
  // Company data structured
  top_hiring_companies_array?: string[] | null
  
  // Default values for missing fields
  type?: string | null      // Default: 'Full-time MBA'
  duration?: string | null  // Default: '2 years'
  status?: 'active' | 'inactive' | 'pending' | null
  
  // Combined ranking (best available)
  ranking?: number | null
  
  // DEPRECATED Legacy field compatibility (use business_school instead)
  school_name?: string | null          // DEPRECATED: use business_school
  business_school_name?: string | null // DEPRECATED: use business_school
  total_cost?: string | null           // DEPRECATED: use tuition_total
  tuition_per_year?: string | null     // DEPRECATED: use tuition_total
  
  // Additional computed fields
  international_percentage?: number | null  // Alias for international_students_percentage
  avg_work_exp?: string | null             // Formatted work experience
  
  // Classification fields (if available)
  classification?: string | null       // M7, T15, Top 30, etc.
  tier?: string | null
  category?: string | null
  
  // Program details (expanded from base)
  format?: string | null
  specializations?: string[] | null
  teaching_methodology?: string | null
  year1_courses?: string | null
  year2_courses?: string | null
  start_date?: string | null
  
  // Career and network (expanded)
  acceptance_rate?: number | null
  salary_increase?: number | null
  top_industries?: string | null
  career_services?: string | null
  alumni_network?: string | null
  alumni_support?: string | null
  notable_alumni?: string | null
  
  // Campus and experience
  global_focus?: string | null
  campus_life?: string | null
  faculty_size?: string | null
  research_centers?: string | null
  student_clubs?: string | null
  housing_options?: string | null
  scholarships_available?: string | null
  interview_process?: string | null
  
  // Application requirements
  work_experience_requirement?: string | null
  application_requirements?: string | null
  application_deadline?: string | null
  gmat_range?: string | null
  
  // Rankings (aliases)
  qs_rank?: number | null
  ft_rank?: number | null
  bloomberg_rank?: number | null
}

// API response types
export interface MBASchoolAPIResponse {
  data: MBASchool
  success: boolean
  message?: string
}

export interface MBASchoolListAPIResponse {
  data: MBASchool[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  success: boolean
  message?: string
}

// Form/validation types (using standardized field names)
export interface MBASchoolFormData {
  business_school: string  // Changed from 'name' to match database
  description?: string
  location?: string
  country?: string
  type?: string
  duration?: string
  tuition_total?: string   // Changed from 'tuition' to match database
  website?: string
  
  // Academic requirements (using standardized field names)
  class_size?: number
  mean_gmat?: number       // Changed from 'avg_gmat' to match database
  mean_gpa?: number        // Changed from 'avg_gpa' to match database
  avg_gre?: number
  avg_work_exp_years?: number
  
  // Application info
  application_deadline?: string
  application_fee?: string
  gmat_gre_waiver_available?: boolean
  
  // Rankings
  ranking?: number
  qs_mba_rank?: number
  ft_global_mba_rank?: number
  bloomberg_mba_rank?: number
  
  // Career outcomes
  avg_starting_salary?: string
  employment_rate?: number  // Maps to employment_in_3_months_percent
  top_hiring_companies?: string
  
  // Status
  status?: 'active' | 'inactive' | 'pending'
}

// Filter and search types
export interface MBASchoolFilters {
  status?: string
  type?: string
  country?: string
  ranking_min?: number
  ranking_max?: number
  gmat_min?: number
  gmat_max?: number
  tuition_range?: string
  employment_rate_min?: number
  classification?: string
}

// Import/export types
export interface MBASchoolImportRow {
  'School Name'?: string
  'Business School'?: string
  'Description'?: string
  'Location'?: string
  'Class Size'?: string | number
  'Women'?: string | number
  'Mean GMAT'?: string | number
  'Mean GPA'?: string | number
  'Avg GRE'?: string | number
  'Avg Work Exp (Years)'?: string | number
  'Avg Starting Salary'?: string
  'Tuition (Total)'?: string
  'Application Deadlines'?: string
  'Application Fee'?: string
  'GMAT/GRE Waiver Available'?: string | boolean
  'Class Profile'?: string
  'Admissions Rounds'?: string
  'QS MBA Rank'?: string | number
  'FT Global MBA Rank'?: string | number
  'Bloomberg MBA Rank'?: string | number
  'Employment in 3 Months (%)'?: string | number
  'Weighted Salary ($)'?: string
  'Top Hiring Companies'?: string
  'Alumni Network Strength'?: string
  'Notable Alumni'?: string
  [key: string]: any  // Allow for additional CSV columns
}

// Statistics and analytics
export interface MBASchoolStats {
  total_schools: number
  average_gmat: number
  average_gpa: number
  average_tuition: number
  average_employment_rate: number
  schools_by_country: Record<string, number>
  schools_by_ranking_tier: Record<string, number>
  top_hiring_companies: Record<string, number>
}

// Database operations
export interface MBASchoolCreateInput extends Omit<MBASchoolRow, 'id' | 'created_at' | 'updated_at'> {}
export interface MBASchoolUpdateInput extends Partial<Omit<MBASchoolRow, 'id' | 'created_at'>> {}

// Type guards
export function isMBASchoolRow(obj: any): obj is MBASchoolRow {
  return obj && typeof obj.id === 'string'
}

export function isMBASchool(obj: any): obj is MBASchool {
  return obj && typeof obj.id === 'string'
} 