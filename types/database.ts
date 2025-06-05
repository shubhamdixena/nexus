export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          date_of_birth: string | null
          nationality: string | null
          bio: string | null
          linkedin_url: string | null
          avatar_url: string | null
          highest_degree: string | null
          field_of_study: string | null
          university: string | null
          graduation_year: number | null
          gpa: number | null
          test_scores: Json | null
          target_degree: string | null
          target_programs: string[] | null
          career_objective: string | null
          work_experience_category: string | null
          preferred_countries: string[] | null
          industry_interests: string[] | null
          career_level: string | null
          budget_range: string | null
          start_date: string | null
          scholarship_interest: boolean | null
          accommodation_preference: string | null
          communication_preferences: string[] | null
          profile_completed: boolean
          profile_completion_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          bio?: string | null
          linkedin_url?: string | null
          avatar_url?: string | null
          highest_degree?: string | null
          field_of_study?: string | null
          university?: string | null
          graduation_year?: number | null
          gpa?: number | null
          test_scores?: Json | null
          target_degree?: string | null
          target_programs?: string[] | null
          career_objective?: string | null
          work_experience_category?: string | null
          preferred_countries?: string[] | null
          industry_interests?: string[] | null
          career_level?: string | null
          budget_range?: string | null
          start_date?: string | null
          scholarship_interest?: boolean | null
          accommodation_preference?: string | null
          communication_preferences?: string[] | null
          profile_completed?: boolean
          profile_completion_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          bio?: string | null
          linkedin_url?: string | null
          avatar_url?: string | null
          highest_degree?: string | null
          field_of_study?: string | null
          university?: string | null
          graduation_year?: number | null
          gpa?: number | null
          test_scores?: Json | null
          target_degree?: string | null
          target_programs?: string[] | null
          career_objective?: string | null
          work_experience_category?: string | null
          preferred_countries?: string[] | null
          industry_interests?: string[] | null
          career_level?: string | null
          budget_range?: string | null
          start_date?: string | null
          scholarship_interest?: boolean | null
          accommodation_preference?: string | null
          communication_preferences?: string[] | null
          profile_completed?: boolean
          profile_completion_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          status: string
          phone: string | null
          location: string | null
          last_active: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: string
          status?: string
          phone?: string | null
          location?: string | null
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          status?: string
          phone?: string | null
          location?: string | null
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      universities: {
        Row: {
          id: string
          name: string
          location: string
          country: string
          ranking: string | null
          programs: string[] | null
          website: string | null
          description: string | null
          logo_url: string | null
          established_year: number | null
          student_count: number | null
          acceptance_rate: number | null
          tuition_fees: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          country: string
          ranking?: string | null
          programs?: string[] | null
          website?: string | null
          description?: string | null
          logo_url?: string | null
          established_year?: number | null
          student_count?: number | null
          acceptance_rate?: number | null
          tuition_fees?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          country?: string
          ranking?: string | null
          programs?: string[] | null
          website?: string | null
          description?: string | null
          logo_url?: string | null
          established_year?: number | null
          student_count?: number | null
          acceptance_rate?: number | null
          tuition_fees?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mba_schools: {
        Row: {
          id: string
          name: string
          type: string
          location: string
          country: string
          ranking: number | null
          duration: string | null
          tuition: string | null
          total_cost: string | null
          description: string | null
          website: string | null
          university_id: string | null
          category: string | null
          specializations: string[] | null
          program_duration: string | null
          avg_gmat: number | null
          avg_work_experience: string | null
          acceptance_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          location: string
          country: string
          ranking?: number | null
          duration?: string | null
          tuition?: string | null
          total_cost?: string | null
          description?: string | null
          website?: string | null
          university_id?: string | null
          category?: string | null
          specializations?: string[] | null
          program_duration?: string | null
          avg_gmat?: number | null
          avg_work_experience?: string | null
          acceptance_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          location?: string
          country?: string
          ranking?: number | null
          duration?: string | null
          tuition?: string | null
          total_cost?: string | null
          description?: string | null
          website?: string | null
          university_id?: string | null
          category?: string | null
          specializations?: string[] | null
          program_duration?: string | null
          avg_gmat?: number | null
          avg_work_experience?: string | null
          acceptance_rate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      scholarships: {
        Row: {
          id: string
          title: string
          organization: string
          country: string
          amount: string
          deadline: string | null
          degree: string | null
          field: string | null
          status: string
          apply_url: string | null
          official_url: string | null
          scholarship_type: string | null
          eligibility_criteria: string | null
          application_process: string | null
          coverage_details: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          organization: string
          country: string
          amount: string
          deadline?: string | null
          degree?: string | null
          field?: string | null
          status?: string
          apply_url?: string | null
          official_url?: string | null
          scholarship_type?: string | null
          eligibility_criteria?: string | null
          application_process?: string | null
          coverage_details?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          organization?: string
          country?: string
          amount?: string
          deadline?: string | null
          degree?: string | null
          field?: string | null
          status?: string
          apply_url?: string | null
          official_url?: string | null
          scholarship_type?: string | null
          eligibility_criteria?: string | null
          application_process?: string | null
          coverage_details?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string | null
          university_id: string | null
          student_name: string
          email: string
          school: string
          program: string
          status: string
          submitted_date: string
          program_name: string | null
          application_type: string | null
          application_deadline: string | null
          submitted_at: string | null
          decision_date: string | null
          notes: string | null
          documents_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          university_id?: string | null
          student_name: string
          email: string
          school: string
          program: string
          status?: string
          submitted_date?: string
          program_name?: string | null
          application_type?: string | null
          application_deadline?: string | null
          submitted_at?: string | null
          decision_date?: string | null
          notes?: string | null
          documents_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          university_id?: string | null
          student_name?: string
          email?: string
          school?: string
          program?: string
          status?: string
          submitted_date?: string
          program_name?: string | null
          application_type?: string | null
          application_deadline?: string | null
          submitted_at?: string | null
          decision_date?: string | null
          notes?: string | null
          documents_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      sops: {
        Row: {
          id: string
          university: string
          program: string
          author: string
          field: string
          country: string
          status: string
          content: string | null
          user_id: string | null
          university_id: string | null
          title: string | null
          word_count: number | null
          version: number
          feedback: string | null
          sop_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          university: string
          program: string
          author: string
          field: string
          country: string
          status?: string
          content?: string | null
          user_id?: string | null
          university_id?: string | null
          title?: string | null
          word_count?: number | null
          version?: number
          feedback?: string | null
          sop_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          university?: string
          program?: string
          author?: string
          field?: string
          country?: string
          status?: string
          content?: string | null
          user_id?: string | null
          university_id?: string | null
          title?: string | null
          word_count?: number | null
          version?: number
          feedback?: string | null
          sop_status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}