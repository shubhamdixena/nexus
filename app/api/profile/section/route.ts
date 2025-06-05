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

    // Map form data to database columns based on section
    const mappedData = mapSectionDataToDatabase(section, data)

    // Update the profile section
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(mappedData)
      .eq('id', user.id)
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
    const completionPercentage = calculateProfileCompletion(profile)
    const isComplete = completionPercentage >= 80

    // Update completion status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        profile_completion_percentage: completionPercentage,
        profile_completed: isComplete
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Completion update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        profile_completion_percentage: completionPercentage,
        profile_completed: isComplete
      },
      missing_sections: getMissingSections(profile)
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function mapSectionDataToDatabase(section: string, data: any) {
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
    
    case 'scores':
      return {
        test_scores: {
          gmat: data.gmat || null,
          gre: data.gre || null,
          toefl: data.toefl || null,
          ielts: data.ielts || null,
          gmatDate: data.gmatDate || null,
          greDate: data.greDate || null,
          toeflDate: data.toeflDate || null,
          ieltsDate: data.ieltsDate || null,
        }
      }
    
    case 'goals':
      return {
        target_degree: data.targetDegree,
        target_programs: data.targetPrograms || [],
        career_objective: data.careerObjective,
        work_experience_category: data.workExperience,
        preferred_countries: data.preferredCountries || [],
        industry_interests: data.industryInterests || [],
        career_level: data.careerLevel || null,
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
      return data
  }
}

function calculateProfileCompletion(profile: any) {
  const fields = [
    'first_name', 'last_name', 'phone', 'date_of_birth', 'nationality',
    'highest_degree', 'field_of_study', 'university', 'graduation_year',
    'target_degree', 'career_objective', 'preferred_countries'
  ]
  
  const completed = fields.filter(field => profile[field] && profile[field] !== '').length
  return Math.round((completed / fields.length) * 100)
}

function getMissingSections(profile: any) {
  const sections = []
  
  if (!profile.first_name || !profile.last_name) {
    sections.push('Personal Information')
  }
  if (!profile.highest_degree || !profile.field_of_study) {
    sections.push('Educational Background')
  }
  if (!profile.target_degree || !profile.career_objective) {
    sections.push('Academic Goals')
  }
  if (!profile.preferred_countries || profile.preferred_countries.length === 0) {
    sections.push('Program Preferences')
  }
  
  return sections
}