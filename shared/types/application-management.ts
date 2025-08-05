/**
 * Types for Application Management System
 * 
 * These types correspond to the database tables for managing MBA applications:
 * - user_application_progress
 * - user_application_essays  
 * - user_application_lors
 */

// Base Application Progress interface
export interface ApplicationProgress {
  id: string
  user_id: string
  mba_school_id: string
  
  // Application status
  application_status: ApplicationStatus
  
  // Progress tracking (auto-calculated)
  overall_completion_percentage: number
  essays_completion_percentage: number
  lors_completion_percentage: number
  
  // User notes and tracking
  notes?: string | null
  priority_level: number // 1-5
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Application Status enum
export type ApplicationStatus = 
  | 'not_started'
  | 'account_created'
  | 'essays_in_progress'
  | 'essays_completed'
  | 'review_in_progress'
  | 'ready_to_submit'
  | 'submitted'
  | 'interview_invited'
  | 'interview_completed'
  | 'decision_pending'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'

// Application Essay interface
export interface ApplicationEssay {
  id: string
  user_id: string
  application_progress_id: string
  
  // Essay identification
  essay_title: string
  essay_prompt?: string | null
  
  // Essay content and versions
  content: string
  word_count: number // Auto-calculated
  character_count: number // Auto-calculated
  version_number: number
  
  // Essay requirements
  max_word_limit?: number | null
  min_word_limit?: number | null
  is_required: boolean
  
  // Essay status and workflow
  status: EssayStatus
  
  // Review and feedback
  feedback?: string | null
  reviewer_notes?: string | null
  last_reviewed_date?: string | null
  
  // Submission tracking
  submitted_to_school: boolean
  submission_date?: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Essay Types - Removed in favor of free-form essay titles

// Essay Status
export type EssayStatus = 
  | 'draft'
  | 'in_review'
  | 'review_completed'
  | 'final'
  | 'submitted'
  | 'needs_revision'

// Letter of Recommendation interface
export interface LetterOfRecommendation {
  id: string
  user_id: string
  application_progress_id: string
  
  // Recommender information
  recommender_name: string
  recommender_title?: string | null
  recommender_organization?: string | null
  recommender_email?: string | null
  recommender_phone?: string | null
  
  // Relationship details
  relationship_to_applicant: RelationshipType
  relationship_duration?: string | null // e.g., "2 years", "6 months"
  work_context?: string | null
  
  // LOR requirements and status
  lor_type: LORType
  is_required: boolean
  
  // Status tracking
  status: LORStatus
  
  // Communication tracking
  request_sent_date?: string | null
  reminder_sent_dates?: string[] | null
  agreed_date?: string | null
  deadline_date?: string | null
  completion_date?: string | null
  
  // LOR content (if applicable)
  content?: string | null
  is_confidential: boolean
  
  // Submission details
  submission_method?: SubmissionMethod | null
  submitted_to_school: boolean
  submission_date?: string | null
  
  // Notes and communication history
  notes?: string | null
  communication_history?: CommunicationEntry[] | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Relationship Types
export type RelationshipType = 
  | 'supervisor'
  | 'manager'
  | 'professor'
  | 'colleague'
  | 'mentor'
  | 'client'
  | 'direct_report'
  | 'other'

// LOR Types
export type LORType = 
  | 'academic'
  | 'professional'
  | 'personal'
  | 'standard'

// LOR Status
export type LORStatus = 
  | 'pending_request'
  | 'request_sent'
  | 'agreed'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'submitted_to_school'
  | 'expired'

// Submission Methods
export type SubmissionMethod = 
  | 'online_portal'
  | 'email'
  | 'mail'
  | 'hand_delivered'

// Communication History Entry
export interface CommunicationEntry {
  date: string
  type: 'email' | 'phone' | 'in_person' | 'message'
  content: string
  direction: 'sent' | 'received'
}

// Extended interfaces with related data for UI
export interface ApplicationProgressWithSchool extends ApplicationProgress {
  school_name?: string
  school_location?: string
  school?: {
    id: string
    business_school: string
    location: string
    country: string
  }
}

export interface ApplicationDashboardData extends ApplicationProgressWithSchool {
  total_essays: number
  completed_essays: number
  total_lors: number
  completed_lors: number
  essays?: ApplicationEssay[]
  lors?: LetterOfRecommendation[]
}

// Form data interfaces for creating/updating
export interface CreateApplicationProgressData {
  mba_school_id: string
  application_status?: ApplicationStatus
  notes?: string
  priority_level?: number
}

export interface UpdateApplicationProgressData extends Partial<CreateApplicationProgressData> {
  overall_completion_percentage?: number
  essays_completion_percentage?: number
  lors_completion_percentage?: number
}

export interface CreateEssayData {
  application_progress_id: string
  essay_title: string
  essay_prompt?: string
  content?: string
  max_word_limit?: number
  min_word_limit?: number
  is_required?: boolean
}

export interface UpdateEssayData extends Partial<CreateEssayData> {
  status?: EssayStatus
  feedback?: string
  reviewer_notes?: string
  submitted_to_school?: boolean
}

export interface CreateLORData {
  application_progress_id: string
  recommender_name: string
  recommender_title?: string
  recommender_organization?: string
  recommender_email?: string
  recommender_phone?: string
  relationship_to_applicant: RelationshipType
  relationship_duration?: string
  work_context?: string
  lor_type?: LORType
  is_required?: boolean
  deadline_date?: string
}

export interface UpdateLORData extends Partial<CreateLORData> {
  status?: LORStatus
  request_sent_date?: string
  agreed_date?: string
  completion_date?: string
  content?: string
  submission_method?: SubmissionMethod
  submitted_to_school?: boolean
  notes?: string
}

// API Response types
export interface ApplicationProgressResponse {
  data: ApplicationProgress[]
  success: boolean
  message?: string
}

export interface ApplicationDashboardResponse {
  data: ApplicationDashboardData[]
  success: boolean
  message?: string
}

export interface EssayResponse {
  data: ApplicationEssay[]
  success: boolean
  message?: string
}

export interface LORResponse {
  data: LetterOfRecommendation[]
  success: boolean
  message?: string
}

// Utility types for filtering and sorting
export interface ApplicationFilters {
  status?: ApplicationStatus[]
  priority_level?: number[]
}

export interface EssayFilters {
  status?: EssayStatus[]
  is_required?: boolean
  word_count_range?: {
    min?: number
    max?: number
  }
}

export interface LORFilters {
  status?: LORStatus[]
  relationship_type?: RelationshipType[]
  lor_type?: LORType[]
  is_required?: boolean
}

// Constants for UI
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  'not_started': 'Not Started',
  'account_created': 'Account Created',
  'essays_in_progress': 'Essays in Progress',
  'essays_completed': 'Essays Completed',
  'review_in_progress': 'Review in Progress',
  'ready_to_submit': 'Ready to Submit',
  'submitted': 'Submitted',
  'interview_invited': 'Interview Invited',
  'interview_completed': 'Interview Completed',
  'decision_pending': 'Decision Pending',
  'accepted': 'Accepted',
  'waitlisted': 'Waitlisted',
  'rejected': 'Rejected'
}

// ESSAY_TYPE_LABELS removed as we now use custom essay titles

export const ESSAY_STATUS_LABELS: Record<EssayStatus, string> = {
  'draft': 'Draft',
  'in_review': 'In Review',
  'review_completed': 'Review Completed',
  'final': 'Final',
  'submitted': 'Submitted',
  'needs_revision': 'Needs Revision'
}

export const LOR_STATUS_LABELS: Record<LORStatus, string> = {
  'pending_request': 'Pending Request',
  'request_sent': 'Request Sent',
  'agreed': 'Agreed',
  'declined': 'Declined',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'submitted_to_school': 'Submitted to School',
  'expired': 'Expired'
}

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  'supervisor': 'Supervisor',
  'manager': 'Manager',
  'professor': 'Professor',
  'colleague': 'Colleague',
  'mentor': 'Mentor',
  'client': 'Client',
  'direct_report': 'Direct Report',
  'other': 'Other'
} 