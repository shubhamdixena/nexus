export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          application_deadline: string | null
          application_type: string | null
          created_at: string | null
          decision_date: string | null
          documents: Json | null
          documents_data: Json | null
          email: string
          id: string
          notes: string | null
          program: string
          program_name: string | null
          school: string
          status: string | null
          student_name: string
          submitted_at: string | null
          submitted_date: string | null
          university_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          application_deadline?: string | null
          application_type?: string | null
          created_at?: string | null
          decision_date?: string | null
          documents?: Json | null
          documents_data?: Json | null
          email: string
          id?: string
          notes?: string | null
          program: string
          program_name?: string | null
          school: string
          status?: string | null
          student_name: string
          submitted_at?: string | null
          submitted_date?: string | null
          university_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          application_deadline?: string | null
          application_type?: string | null
          created_at?: string | null
          decision_date?: string | null
          documents?: Json | null
          documents_data?: Json | null
          email?: string
          id?: string
          notes?: string | null
          program?: string
          program_name?: string | null
          school?: string
          status?: string | null
          student_name?: string
          submitted_at?: string | null
          submitted_date?: string | null
          university_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deadline_auto_imports: {
        Row: {
          deadlines_created: number
          id: string
          import_date: string
          source_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          deadlines_created?: number
          id?: string
          import_date?: string
          source_id: string
          source_type: string
          user_id: string
        }
        Update: {
          deadlines_created?: number
          id?: string
          import_date?: string
          source_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          deadline_date: string
          deadline_type: string
          id: string
          notes: string | null
          priority: string
          source_id: string | null
          source_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deadline_date: string
          deadline_type: string
          id?: string
          notes?: string | null
          priority?: string
          source_id?: string | null
          source_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deadline_date?: string
          deadline_type?: string
          id?: string
          notes?: string | null
          priority?: string
          source_id?: string | null
          source_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mba_schools: {
        Row: {
          acceptance_rate: string | null
          alumni_network: string | null
          application_components: string | null
          application_deadline: string | null
          application_requirements: string | null
          average_starting_salary: string | null
          avg_gmat: number | null
          avg_gpa: number | null
          avg_starting_salary: string | null
          avg_work_exp: string | null
          avg_work_experience: string | null
          campus_life: string | null
          career_services: string | null
          category: string | null
          class_profile: string | null
          class_size: number | null
          classification: string | null
          country: string
          created_at: string | null
          description: string | null
          duration: string | null
          employment_rate: number | null
          faculty_size: string | null
          format: string | null
          global_focus: string | null
          gmat_range: string | null
          housing_options: string | null
          id: string
          international_students: string | null
          interview_process: string | null
          location: string
          mba_category: string | null
          name: string
          notable_alumni: string | null
          program_duration: string | null
          ranking: number | null
          research_centers: string | null
          scholarships_available: string | null
          specializations: string[] | null
          start_date: string | null
          status: string | null
          student_clubs: string | null
          teaching_methodology: string | null
          tier: string | null
          top_hiring_companies: string | null
          top_industries: string | null
          top_recruiters: string[] | null
          total_cost: string | null
          tuition: string | null
          tuition_per_year: string | null
          type: string
          university_id: string | null
          updated_at: string | null
          website: string | null
          work_experience_requirement: string | null
          year1_courses: string | null
          year2_courses: string | null
        }
        Insert: {
          acceptance_rate?: string | null
          alumni_network?: string | null
          application_components?: string | null
          application_deadline?: string | null
          application_requirements?: string | null
          average_starting_salary?: string | null
          avg_gmat?: number | null
          avg_gpa?: number | null
          avg_starting_salary?: string | null
          avg_work_exp?: string | null
          avg_work_experience?: string | null
          campus_life?: string | null
          career_services?: string | null
          category?: string | null
          class_profile?: string | null
          class_size?: number | null
          classification?: string | null
          country: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          employment_rate?: number | null
          faculty_size?: string | null
          format?: string | null
          global_focus?: string | null
          gmat_range?: string | null
          housing_options?: string | null
          id?: string
          international_students?: string | null
          interview_process?: string | null
          location: string
          mba_category?: string | null
          name: string
          notable_alumni?: string | null
          program_duration?: string | null
          ranking?: number | null
          research_centers?: string | null
          scholarships_available?: string | null
          specializations?: string[] | null
          start_date?: string | null
          status?: string | null
          student_clubs?: string | null
          teaching_methodology?: string | null
          tier?: string | null
          top_hiring_companies?: string | null
          top_industries?: string | null
          top_recruiters?: string[] | null
          total_cost?: string | null
          tuition?: string | null
          tuition_per_year?: string | null
          type?: string
          university_id?: string | null
          updated_at?: string | null
          website?: string | null
          work_experience_requirement?: string | null
          year1_courses?: string | null
          year2_courses?: string | null
        }
        Update: {
          acceptance_rate?: string | null
          alumni_network?: string | null
          application_components?: string | null
          application_deadline?: string | null
          application_requirements?: string | null
          average_starting_salary?: string | null
          avg_gmat?: number | null
          avg_gpa?: number | null
          avg_starting_salary?: string | null
          avg_work_exp?: string | null
          avg_work_experience?: string | null
          campus_life?: string | null
          career_services?: string | null
          category?: string | null
          class_profile?: string | null
          class_size?: number | null
          classification?: string | null
          country?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          employment_rate?: number | null
          faculty_size?: string | null
          format?: string | null
          global_focus?: string | null
          gmat_range?: string | null
          housing_options?: string | null
          id?: string
          international_students?: string | null
          interview_process?: string | null
          location?: string
          mba_category?: string | null
          name?: string
          notable_alumni?: string | null
          program_duration?: string | null
          ranking?: number | null
          research_centers?: string | null
          scholarships_available?: string | null
          specializations?: string[] | null
          start_date?: string | null
          status?: string | null
          student_clubs?: string | null
          teaching_methodology?: string | null
          tier?: string | null
          top_hiring_companies?: string | null
          top_industries?: string | null
          top_recruiters?: string[] | null
          total_cost?: string | null
          tuition?: string | null
          tuition_per_year?: string | null
          type?: string
          university_id?: string | null
          updated_at?: string | null
          website?: string | null
          work_experience_requirement?: string | null
          year1_courses?: string | null
          year2_courses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mba_schools_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: string
          application_url: string | null
          apply_url: string | null
          country: string
          coverage: string | null
          created_at: string | null
          deadline: string | null
          degree: string | null
          description: string | null
          eligibility_criteria: string | null
          field: string | null
          id: string
          min_gmat_score: number | null
          min_gpa: number | null
          name: string | null
          official_url: string | null
          organization: string
          provider: string | null
          renewable: boolean | null
          requirements: string[] | null
          scholarship_type: string | null
          status: string | null
          target_countries: string[] | null
          target_programs: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: string
          application_url?: string | null
          apply_url?: string | null
          country: string
          coverage?: string | null
          created_at?: string | null
          deadline?: string | null
          degree?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          field?: string | null
          id?: string
          min_gmat_score?: number | null
          min_gpa?: number | null
          name?: string | null
          official_url?: string | null
          organization: string
          provider?: string | null
          renewable?: boolean | null
          requirements?: string[] | null
          scholarship_type?: string | null
          status?: string | null
          target_countries?: string[] | null
          target_programs?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: string
          application_url?: string | null
          apply_url?: string | null
          country?: string
          coverage?: string | null
          created_at?: string | null
          deadline?: string | null
          degree?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          field?: string | null
          id?: string
          min_gmat_score?: number | null
          min_gpa?: number | null
          name?: string | null
          official_url?: string | null
          organization?: string
          provider?: string | null
          renewable?: boolean | null
          requirements?: string[] | null
          scholarship_type?: string | null
          status?: string | null
          target_countries?: string[] | null
          target_programs?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          acceptance_rate: number | null
          country: string
          created_at: string | null
          description: string | null
          established_year: number | null
          id: string
          location: string
          logo_url: string | null
          name: string
          programs: string[] | null
          ranking: string | null
          status: string | null
          student_count: number | null
          tuition_fees: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          country: string
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          id?: string
          location: string
          logo_url?: string | null
          name: string
          programs?: string[] | null
          ranking?: string | null
          status?: string | null
          student_count?: number | null
          tuition_fees?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          country?: string
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          id?: string
          location?: string
          logo_url?: string | null
          name?: string
          programs?: string[] | null
          ranking?: string | null
          status?: string | null
          student_count?: number | null
          tuition_fees?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_populate_scholarship_deadlines: {
        Args: {
          p_user_id: string
          p_scholarship_id: string
          p_scholarship_name: string
          p_deadline_date?: string
        }
        Returns: number
      }
      auto_populate_school_deadlines: {
        Args: { p_user_id: string; p_school_id: string; p_school_name: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

// Deadline-specific types for convenience
export type Deadline = Tables<'deadlines'>
export type DeadlineInsert = TablesInsert<'deadlines'>
export type DeadlineUpdate = TablesUpdate<'deadlines'>

export type DeadlineType = 'application' | 'scholarship' | 'test' | 'reminder' | 'interview'
export type DeadlinePriority = 'high' | 'medium' | 'low'
export type DeadlineSourceType = 'manual' | 'school_bookmark' | 'scholarship_save' | 'auto_test'