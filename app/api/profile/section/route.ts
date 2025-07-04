import { NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from "next/server"

export async function PATCH(request: NextRequest) {
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
    
    const { section, data } = await request.json()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get existing profile data for sections that need it
    let existingProfile = null
    if (section === 'experience') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('test_scores')
        .eq('id', user.id)
        .single()
      existingProfile = profile
    }

    // Map form data to database columns based on section
    const mappedData = mapSectionDataToDatabase(section, data, existingProfile)

    // Update the profile section
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        ...mappedData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile', details: error.message },
        { status: 500 }
      )
    }

    // Calculate completion percentage
    const completionData = calculateProfileCompletion(profile)
    const isComplete = completionData.percentage >= 80

    // Update completion status if needed
    if (profile.profile_completion_percentage !== completionData.percentage) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: completionData.percentage,
          profile_completed: isComplete
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Completion update error:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        profile_completion_percentage: completionData.percentage,
        profile_completed: isComplete
      },
      completion: completionData
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function mapSectionDataToDatabase(section: string, data: any, existingProfile?: any) {
  switch (section) {
    case 'personal':
      return {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || null,
        date_of_birth: data.dateOfBirth || null,
        nationality: data.nationality,
        bio: data.bio || null,
        linkedin_url: data.linkedinUrl || null,
      }
    
    case 'education':
      return {
        highest_degree: data.highestDegree,
        field_of_study: data.fieldOfStudy,
        university: data.university,
        graduation_year: data.graduationYear ? parseInt(data.graduationYear) : null,
        gpa: data.gpa ? parseFloat(data.gpa) : null,
      }
    
    case 'experience':
      return {
        // Store work experience in test_scores JSONB field
        test_scores: {
          ...(existingProfile?.test_scores || {}),
          work_experience: {
            role: data.currentRole,
            company: data.currentCompany,
            start_date: data.startDate || null,
            end_date: data.endDate || null,
          }
        }
      }
    
    case 'scores':
      return {
        test_scores: {
          // GRE scores
          gre_verbal: data.greVerbal || null,
          gre_quantitative: data.greQuantitative || null,
          gre_analytical_writing: data.greAnalyticalWriting || null,
          gre_date: data.greDate || null,
          
          // GMAT scores
          gmat_verbal: data.gmatVerbal || null,
          gmat_quantitative: data.gmatQuantitative || null,
          gmat_integrated_reasoning: data.gmatIntegratedReasoning || null,
          gmat_awa: data.gmatAWA || null,
          gmat_date: data.gmatDate || null,
          
          // TOEFL scores
          toefl_reading: data.toeflReading || null,
          toefl_listening: data.toeflListening || null,
          toefl_speaking: data.toeflSpeaking || null,
          toefl_writing: data.toeflWriting || null,
          toefl_date: data.toeflDate || null,
          
          // IELTS scores
          ielts: data.ielts || null,
          ielts_date: data.ieltsDate || null,
        }
      }
    
    case 'goals':
      return {
        target_degree: data.targetDegree,
        career_level: data.careerLevel || null,
        career_objective: data.careerObjective || null,
      }
    
    case 'scholarships':
      return {
        scholarship_interest: data.scholarshipInterest || false,
        budget_range: data.budgetRange || null,
        financial_aid_needed: data.financialAidNeeded || false,
      }
    
    case 'preferences':
      return {
        budget_range: data.budgetRange,
        start_date: data.startDate,
        scholarship_interest: data.scholarshipInterest || false,
        accommodation_preference: data.accommodationPreference,
        communication_preferences: data.communicationPreferences || [],
        study_mode: data.studyMode || null,
        location_preference: data.locationPreference || null,
      }
    
    default:
      return {}
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