import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"
import { z } from "zod"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Profile completion request schema
const ProfileCompleteRequestSchema = z.object({
  personal: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().min(1),
    bio: z.string().optional(),
    linkedinUrl: z.string().optional(),
  }),
  education: z.object({
    highestDegree: z.string().min(1),
    fieldOfStudy: z.string().min(1),
    university: z.string().min(1),
    graduationYear: z.string().min(1),
    gpa: z.string().optional(),
  }),
  goals: z.object({
    targetDegree: z.string().min(1),
    targetPrograms: z.array(z.string()).min(1),
    careerObjective: z.string().min(1),
    workExperience: z.string().min(1),
    preferredCountries: z.array(z.string()).min(1),
  }),
  preferences: z.object({
    budgetRange: z.string().min(1),
    startDate: z.string().min(1),
    scholarshipInterest: z.boolean(),
    accommodationPreference: z.string().min(1),
    communicationPreferences: z.array(z.string()).min(1),
  }),
})

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { user, error } = await getAuthenticatedUser(request)

    if (error || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Parse and validate the request body
    const body = await request.json()
    
    let validatedData
    try {
      validatedData = ProfileCompleteRequestSchema.parse(body)
    } catch (validationError) {
      return NextResponse.json({ 
        error: "Invalid profile data", 
        code: "VALIDATION_ERROR",
        details: validationError
      }, { status: 400 })
    }

    // Transform the validated data to match our database schema
    const profileData = {
      first_name: validatedData.personal.firstName,
      last_name: validatedData.personal.lastName,
      phone: validatedData.personal.phone,
      date_of_birth: validatedData.personal.dateOfBirth,
      nationality: validatedData.personal.nationality,
      highest_degree: validatedData.education.highestDegree,
      field_of_study: validatedData.education.fieldOfStudy,
      university: validatedData.education.university,
      graduation_year: parseInt(validatedData.education.graduationYear),
      gpa: validatedData.education.gpa ? parseFloat(validatedData.education.gpa) : undefined,
      target_degree: validatedData.goals.targetDegree,
      target_programs: validatedData.goals.targetPrograms,
      career_objective: validatedData.goals.careerObjective,
      work_experience_category: validatedData.goals.workExperience,
      preferred_countries: validatedData.goals.preferredCountries,
      budget_range: validatedData.preferences.budgetRange,
      start_date: validatedData.preferences.startDate,
      scholarship_interest: validatedData.preferences.scholarshipInterest,
      accommodation_preference: validatedData.preferences.accommodationPreference,
      communication_preferences: validatedData.preferences.communicationPreferences,
    }

    // Update the user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: "Failed to update profile", 
        code: "UPDATE_FAILED" 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile,
    })
  } catch (error) {
    console.error("Error completing profile:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      code: "INTERNAL_ERROR" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)

    if (error || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    const { data: completionStatus, error: statusError } = await supabase
      .from('profiles')
      .select('is_complete')
      .eq('id', user.id)
      .single()

    if (statusError) {
      throw new Error("Failed to fetch profile completion status")
    }

    return NextResponse.json({
      completion: completionStatus
    })
  } catch (error) {
    console.error("Error fetching profile completion status:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      code: "INTERNAL_ERROR" 
    }, { status: 500 })
  }
}
