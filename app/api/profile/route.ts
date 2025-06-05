import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116 is "not found"
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: "Database error", 
        code: "DATABASE_ERROR" 
      }, { status: 500 })
    }

    // Calculate completion status
    const completionStatus = calculateProfileCompletion(profile)

    return NextResponse.json({
      profile,
      completion: completionStatus
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      code: "INTERNAL_ERROR" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const { data, error } = await supabase
      .from("profiles")
      .insert([{
        id: user.id,
        email: user.email,
        ...body,
        profile_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creating profile:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create profile", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Profile created successfully",
    })
  } catch (error) {
    console.error("Create profile error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    const body = await request.json()
    console.log("PATCH /api/profile - Request body:", JSON.stringify(body, null, 2))
    
    // Map incoming data to database fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Handle different data structures from the old form vs new modal
    if (body.step && body.data) {
      // Old format from profile setup form
      const { step, data } = body
      
      switch (step) {
        case "personal":
          Object.assign(updateData, {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            date_of_birth: data.dateOfBirth || null,
            nationality: data.nationality,
          })
          break
        case "education":
          Object.assign(updateData, {
            highest_degree: data.highestDegree,
            field_of_study: data.fieldOfStudy,
            university: data.university,
            graduation_year: data.graduationYear ? parseInt(data.graduationYear) : null,
            gpa: data.gpa ? parseFloat(data.gpa) : null,
            test_scores: data.testScores || null,
          })
          break
        case "career":
          Object.assign(updateData, {
            target_degree: data.targetDegree,
            target_programs: data.targetPrograms,
            career_objective: data.careerObjective,
            work_experience_category: data.workExperience,
            preferred_countries: data.preferredCountries,
          })
          break
        case "preferences":
          Object.assign(updateData, {
            budget_range: data.budgetRange,
            start_date: data.startDate,
            scholarship_interest: data.scholarshipInterest,
            accommodation_preference: data.accommodationPreference,
            communication_preferences: data.communicationPreferences,
          })
          break
      }
    } else {
      // Direct update format
      if (body.first_name !== undefined) updateData.first_name = body.first_name
      if (body.last_name !== undefined) updateData.last_name = body.last_name
      if (body.phone !== undefined) updateData.phone = body.phone
      if (body.date_of_birth !== undefined) updateData.date_of_birth = body.date_of_birth
      if (body.nationality !== undefined) updateData.nationality = body.nationality
      if (body.bio !== undefined) updateData.bio = body.bio
      if (body.linkedin_url !== undefined) updateData.linkedin_url = body.linkedin_url
      if (body.highest_degree !== undefined) updateData.highest_degree = body.highest_degree
      if (body.field_of_study !== undefined) updateData.field_of_study = body.field_of_study
      if (body.university !== undefined) updateData.university = body.university
      if (body.graduation_year !== undefined) updateData.graduation_year = body.graduation_year
      if (body.gpa !== undefined) updateData.gpa = body.gpa
      if (body.test_scores !== undefined) updateData.test_scores = body.test_scores
      if (body.target_degree !== undefined) updateData.target_degree = body.target_degree
      if (body.target_programs !== undefined) updateData.target_programs = body.target_programs
      if (body.career_objective !== undefined) updateData.career_objective = body.career_objective
      if (body.work_experience_category !== undefined) updateData.work_experience_category = body.work_experience_category
      if (body.preferred_countries !== undefined) updateData.preferred_countries = body.preferred_countries
      if (body.industry_interests !== undefined) updateData.industry_interests = body.industry_interests
      if (body.career_level !== undefined) updateData.career_level = body.career_level
      if (body.budget_range !== undefined) updateData.budget_range = body.budget_range
      if (body.start_date !== undefined) updateData.start_date = body.start_date
      if (body.scholarship_interest !== undefined) updateData.scholarship_interest = body.scholarship_interest
      if (body.accommodation_preference !== undefined) updateData.accommodation_preference = body.accommodation_preference
      if (body.communication_preferences !== undefined) updateData.communication_preferences = body.communication_preferences
      if (body.study_mode !== undefined) updateData.study_mode = body.study_mode
      if (body.location_preference !== undefined) updateData.location_preference = body.location_preference
    }

    // Update profile using upsert
    const { data: result, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        ...updateData,
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        error: "Failed to update profile", 
        code: "UPDATE_FAILED" 
      }, { status: 500 })
    }

    // Calculate completion percentage
    const completionData = calculateProfileCompletion(result)

    // Update completion percentage
    await supabase
      .from("profiles")
      .update({
        profile_completion_percentage: completionData.percentage,
        profile_completed: completionData.percentage >= 80, // Consider profile complete at 80%
      })
      .eq("id", user.id)

    return NextResponse.json({
      success: true,
      profile: { ...result, ...completionData },
      completion: completionData
    })

  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      code: "INTERNAL_ERROR",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function calculateProfileCompletion(profile: any) {
  if (!profile) {
    return {
      percentage: 0,
      completed_fields: 0,
      total_fields: 0,
      missing_sections: ["personal", "education", "goals", "preferences"]
    }
  }

  const fields = [
    // Personal information (30%)
    profile.first_name,
    profile.last_name,
    profile.nationality,
    
    // Education (25%)
    profile.highest_degree,
    profile.field_of_study,
    profile.university,
    profile.graduation_year,
    
    // Career goals (25%)
    profile.target_degree,
    profile.target_programs?.length > 0,
    profile.career_objective,
    profile.work_experience_category,
    profile.preferred_countries?.length > 0,
    
    // Preferences (20%)
    profile.budget_range,
    profile.start_date,
    profile.accommodation_preference,
    profile.communication_preferences?.length > 0,
  ]

  const completedFields = fields.filter(field => {
    if (typeof field === 'boolean') return field
    if (Array.isArray(field)) return field.length > 0
    return field && field.toString().trim() !== ''
  }).length

  const percentage = Math.round((completedFields / fields.length) * 100)

  return {
    percentage,
    completed_fields: completedFields,
    total_fields: fields.length,
    missing_sections: getMissingSections(profile)
  }
}

function getMissingSections(profile: any) {
  const missing = []

  // Check personal info
  if (!profile.first_name || !profile.last_name || !profile.nationality) {
    missing.push("personal")
  }

  // Check education
  if (!profile.highest_degree || !profile.field_of_study || !profile.university || !profile.graduation_year) {
    missing.push("education")
  }

  // Check career goals
  if (!profile.target_degree || !profile.target_programs?.length || !profile.career_objective || 
      !profile.work_experience_category || !profile.preferred_countries?.length) {
    missing.push("goals")
  }

  // Check preferences
  if (!profile.budget_range || !profile.start_date || !profile.accommodation_preference || 
      !profile.communication_preferences?.length) {
    missing.push("preferences")
  }

  return missing
}