import { createSupabaseApiClient } from '@/lib/supabaseClient'
import { z } from 'zod'

// Initialize Supabase client using standardized approach
const supabase = createSupabaseApiClient()

// Validation schemas
export const UserProfileSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().min(2),
  highest_degree: z.string().min(1),
  field_of_study: z.string().min(2),
  university: z.string().min(2),
  graduation_year: z.number().int().min(1950).max(2030),
  gpa: z.number().optional(),
  test_scores: z.object({
    gmat: z.string().optional(),
    gre: z.string().optional(),
    toefl: z.string().optional(),
    ielts: z.string().optional(),
  }).optional(),
  target_degree: z.string().min(1),
  target_programs: z.array(z.string()).min(1),
  career_objective: z.string().min(10),
  work_experience_category: z.enum(['0-2', '3-5', '6-10', '10+']),
  preferred_countries: z.array(z.string()).min(1),
  budget_range: z.enum(['under-30k', '30k-50k', '50k-70k', '70k-100k', 'over-100k']),
  start_date: z.string().min(1),
  scholarship_interest: z.boolean(),
  accommodation_preference: z.enum(['on-campus', 'off-campus', 'no-preference']),
  communication_preferences: z.array(z.string()).min(1),
})

export const PartialUserProfileSchema = UserProfileSchema.partial()

export type UserProfileData = z.infer<typeof UserProfileSchema>
export type PartialUserProfileData = z.infer<typeof PartialUserProfileSchema>

export interface UserProfile {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  phone?: string
  date_of_birth?: string
  nationality?: string
  highest_degree?: string
  field_of_study?: string
  university?: string
  graduation_year?: number
  gpa?: number
  test_scores?: Record<string, any>
  target_degree?: string
  target_programs?: string[]
  career_objective?: string
  work_experience_category?: string
  preferred_countries?: string[]
  budget_range?: string
  start_date?: string
  scholarship_interest?: boolean
  accommodation_preference?: string
  communication_preferences?: string[]
  avatar_url?: string
  linkedin_url?: string
  bio?: string
  profile_completed: boolean
  profile_completion_percentage: number
  created_at: string
  updated_at: string
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, return null
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw new Error('Failed to fetch user profile')
  }
}

export async function createUserProfile(
  userId: string, 
  profileData: Partial<UserProfileData>
): Promise<UserProfile> {
  try {
    // Validate the data
    const validatedData = PartialUserProfileSchema.parse(profileData)
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...validatedData,
        profile_completed: false,
        profile_completion_percentage: 0,
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw new Error('Failed to create user profile')
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfileData>
): Promise<UserProfile | null> {
  try {
    console.log("updateUserProfile - Input data:", JSON.stringify(profileData, null, 2))
    console.log("updateUserProfile - User ID:", userId)

    // Validate the data
    const validatedData = PartialUserProfileSchema.parse(profileData)
    console.log("updateUserProfile - Validated data:", JSON.stringify(validatedData, null, 2))
    
    // Check if profile exists
    let existingProfile = await getUserById(userId)
    console.log("updateUserProfile - Existing profile:", existingProfile ? "Found" : "Not found")
    
    if (!existingProfile) {
      // Create new profile if it doesn't exist
      console.log("updateUserProfile - Creating new profile")
      return await createUserProfile(userId, validatedData)
    }

    // Update existing profile
    console.log("updateUserProfile - Updating existing profile")
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error("updateUserProfile - Supabase update error:", error)
      throw error
    }

    console.log("updateUserProfile - Profile updated successfully")

    // Calculate and update completion percentage
    const completionPercentage = calculateProfileCompletion(data)
    const isComplete = completionPercentage >= 80

    // Update completion status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        profile_completion_percentage: completionPercentage,
        profile_completed: isComplete
      })
      .eq('id', data.id)

    if (updateError) {
      console.error("updateUserProfile - Completion update error:", updateError)
    }

    return { 
      ...data, 
      profile_completion_percentage: completionPercentage,
      profile_completed: isComplete
    }
  } catch (error) {
    console.error('updateUserProfile - Error:', error)
    throw new Error('Failed to update user profile')
  }
}

// Helper function to calculate profile completion
function calculateProfileCompletion(profile: any): number {
  const fields = [
    'first_name', 'last_name', 'phone', 'date_of_birth', 'nationality',
    'highest_degree', 'field_of_study', 'university', 'graduation_year',
    'target_degree', 'career_objective', 'preferred_countries'
  ]
  
  const completed = fields.filter(field => profile[field] && profile[field] !== '').length
  return Math.round((completed / fields.length) * 100)
}

export async function getProfileCompletionStatus(userId: string): Promise<{
  isComplete: boolean
  percentage: number
  missingFields: string[]
}> {
  try {
    const profile = await getUserById(userId)
    
    if (!profile) {
      return {
        isComplete: false,
        percentage: 0,
        missingFields: ['All profile fields required']
      }
    }

    const requiredFields = [
      'first_name', 'last_name', 'nationality', 'highest_degree',
      'field_of_study', 'university', 'graduation_year', 'target_degree',
      'target_programs', 'career_objective', 'work_experience_category',
      'preferred_countries', 'budget_range', 'start_date',
      'accommodation_preference', 'communication_preferences'
    ]

    const missingFields = requiredFields.filter(field => {
      const value = profile[field as keyof UserProfile]
      if (Array.isArray(value)) {
        return !value || value.length === 0
      }
      return !value || (typeof value === 'string' && value.trim() === '')
    })

    const percentage = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
    
    return {
      isComplete: percentage >= 80,
      percentage,
      missingFields
    }
  } catch (error) {
    console.error('Error checking profile completion:', error)
    throw new Error('Failed to check profile completion')
  }
}

export async function markProfileAsComplete(userId: string): Promise<boolean> {
  try {
    const completionStatus = await getProfileCompletionStatus(userId)
    
    if (!completionStatus.isComplete) {
      throw new Error(`Profile incomplete. Missing fields: ${completionStatus.missingFields.join(', ')}`)
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        profile_completed: true,
        profile_completion_percentage: completionStatus.percentage,
        last_profile_update: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error marking profile as complete:', error)
    throw new Error('Failed to mark profile as complete')
  }
}
