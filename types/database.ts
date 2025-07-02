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
      data_correction_reports: {
        Row: {
          additional_notes: string | null
          admin_notes: string | null
          created_at: string
          current_value: string | null
          data_id: string | null
          data_table: string | null
          data_type: string
          description: string
          evidence_urls: string[] | null
          field_name: string | null
          id: string
          implementation_notes: string | null
          issue_type: string
          priority: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          suggested_value: string | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          current_value?: string | null
          data_id?: string | null
          data_table?: string | null
          data_type: string
          description: string
          evidence_urls?: string[] | null
          field_name?: string | null
          id?: string
          implementation_notes?: string | null
          issue_type: string
          priority?: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_value?: string | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          current_value?: string | null
          data_id?: string | null
          data_table?: string | null
          data_type?: string
          description?: string
          evidence_urls?: string[] | null
          field_name?: string | null
          id?: string
          implementation_notes?: string | null
          issue_type?: string
          priority?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      data_correction_analytics: {
        Row: {
          data_table: string | null
          data_type: string
          field_name: string | null
          id: string
          issue_type: string
          last_reported: string
          report_count: number
        }
        Insert: {
          data_table?: string | null
          data_type: string
          field_name?: string | null
          id?: string
          issue_type: string
          last_reported?: string
          report_count?: number
        }
        Update: {
          data_table?: string | null
          data_type?: string
          field_name?: string | null
          id?: string
          issue_type?: string
          last_reported?: string
          report_count?: number
        }
        Relationships: []
      }
      data_correction_history: {
        Row: {
          action: string
          correction_id: string
          created_at: string
          id: string
          new_status: string | null
          notes: string | null
          old_status: string | null
          performed_by: string
        }
        Insert: {
          action: string
          correction_id: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          performed_by: string
        }
        Update: {
          action?: string
          correction_id?: string
          created_at?: string
          id?: string
          new_status?: string | null
          notes?: string | null
          old_status?: string | null
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_correction_history_correction_id_fkey"
            columns: ["correction_id"]
            isOneToOne: false
            referencedRelation: "data_correction_reports"
            referencedColumns: ["id"]
          },
        ]
      }
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
          university_name: string
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
          university_name: string
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
          university_name?: string
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
          // Primary fields
          id: string
          number?: number | null
          business_school?: string | null  // Primary name field (no 'name' field)
          description?: string | null
          location?: string | null
          country?: string | null
          website?: string | null
          
          // Class demographics
          class_size?: number | null
          women?: number | null
          women_percentage?: number | null
          international_students?: string | null
          international_students_percentage?: number | null
          
          // Test scores and academic requirements (standardized field names)
          mean_gmat?: number | null  // Primary GMAT field (no avg_gmat)
          mean_gpa?: number | null   // Primary GPA field (no avg_gpa)
          avg_gre?: number | null
          avg_work_exp_years?: number | null
          
          // Financial information
          avg_starting_salary?: string | null
          tuition_total?: string | null
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
          
          // Program details
          core_curriculum?: string | null
          program_duration?: string | null
          credits_required?: string | null
          key_features?: string | null
          stem_designation?: boolean | null
          
          // Additional application info
          class_profile?: string | null
          
          // Legacy fields for compatibility (DEPRECATED - these don't exist in actual DB)
          type?: string | null
          duration?: string | null
          tuition?: string | null           // DEPRECATED: use tuition_total
          total_cost?: string | null        // DEPRECATED: use tuition_total
          university_id?: string | null
          category?: string | null
          specializations?: string[] | null
          avg_work_experience?: string | null
          acceptance_rate?: number | null
          ranking?: number | null
          
          // Timestamps
          created_at: string
          updated_at: string
        }
        Insert: {
          // Primary fields
          id?: string
          number?: number | null
          business_school?: string | null  // Primary name field
          description?: string | null
          location?: string | null
          country?: string | null
          website?: string | null
          
          // Class demographics
          class_size?: number | null
          women?: number | null
          women_percentage?: number | null
          international_students?: string | null
          international_students_percentage?: number | null
          
          // Test scores and academic requirements
          mean_gmat?: number | null
          mean_gpa?: number | null
          avg_gre?: number | null
          avg_work_exp_years?: number | null
          
          // Financial information
          avg_starting_salary?: string | null
          tuition_total?: string | null
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
          
          // Program details
          core_curriculum?: string | null
          program_duration?: string | null
          credits_required?: string | null
          key_features?: string | null
          stem_designation?: boolean | null
          
          // Additional application info
          class_profile?: string | null
          
          // Legacy fields for compatibility (DEPRECATED)
          type?: string | null
          duration?: string | null
          tuition?: string | null           // DEPRECATED: use tuition_total
          total_cost?: string | null        // DEPRECATED: use tuition_total
          university_id?: string | null
          category?: string | null
          specializations?: string[] | null
          avg_work_experience?: string | null
          acceptance_rate?: number | null
          ranking?: number | null
          
          // Timestamps
          created_at?: string
          updated_at?: string
        }
        Update: {
          // Primary fields
          id?: string
          number?: number | null
          business_school?: string | null  // Primary name field
          description?: string | null
          location?: string | null
          country?: string | null
          website?: string | null
          
          // Class demographics
          class_size?: number | null
          women?: number | null
          women_percentage?: number | null
          international_students?: string | null
          international_students_percentage?: number | null
          
          // Test scores and academic requirements
          mean_gmat?: number | null
          mean_gpa?: number | null
          avg_gre?: number | null
          avg_work_exp_years?: number | null
          
          // Financial information
          avg_starting_salary?: string | null
          tuition_total?: string | null
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
          
          // Program details
          core_curriculum?: string | null
          program_duration?: string | null
          credits_required?: string | null
          key_features?: string | null
          stem_designation?: boolean | null
          
          // Additional application info
          class_profile?: string | null
          
          // Legacy fields for compatibility
          type?: string | null
          duration?: string | null
          tuition?: string | null
          total_cost?: string | null
          university_id?: string | null
          category?: string | null
          specializations?: string[] | null
          avg_work_experience?: string | null
          acceptance_rate?: number | null
          ranking?: number | null
          
          // Timestamps
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
      user_school_targets: {
        Row: {
          id: string
          user_id: string
          school_id: string
          school_type: string
          target_category: string
          ranking_preference: string | null
          program_of_interest: string | null
          application_round: string | null
          notes: string | null
          priority_score: number | null
          application_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          school_id: string
          school_type?: string
          target_category: string
          ranking_preference?: string | null
          program_of_interest?: string | null
          application_round?: string | null
          notes?: string | null
          priority_score?: number | null
          application_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          school_id?: string
          school_type?: string
          target_category?: string
          ranking_preference?: string | null
          program_of_interest?: string | null
          application_round?: string | null
          notes?: string | null
          priority_score?: number | null
          application_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_school_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_school_targets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "mba_schools"
            referencedColumns: ["id"]
          }
        ]
      }
      user_application_progress: {
        Row: {
          id: string
          user_id: string
          mba_school_id: string
          application_status: string
          overall_completion_percentage: number
          essays_completion_percentage: number
          lors_completion_percentage: number
          notes: string | null
          priority_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mba_school_id: string
          application_status?: string
          overall_completion_percentage?: number
          essays_completion_percentage?: number
          lors_completion_percentage?: number
          notes?: string | null
          priority_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mba_school_id?: string
          application_status?: string
          overall_completion_percentage?: number
          essays_completion_percentage?: number
          lors_completion_percentage?: number
          notes?: string | null
          priority_level?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_application_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_application_progress_mba_school_id_fkey"
            columns: ["mba_school_id"]
            isOneToOne: false
            referencedRelation: "mba_schools"
            referencedColumns: ["id"]
          }
        ]
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