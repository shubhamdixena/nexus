import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { MBASchool } from "@/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Create client for public read access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }, // No cookies needed for public access
        },
      }
    )

    // Fetch school data including alumni columns
    const { data, error } = await supabase
      .from("mba_schools")
      .select("*, alumnus_1, alumnus_2, alumnus_3, alumnus_4")
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("Error fetching MBA school:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch MBA school", errors: error ? [error.message] : [] },
        { status: error ? 500 : 404 }
      )
    }

    // Alumni data is now in the main table columns

    // Transform data to match frontend expectations
    const transformedData = {
      // Map database fields to frontend expected fields
      id: data.id,
      name: data.name || 'Unknown School',
      description: data.description,
      location: data.location || 'USA',
      country: data.location?.includes('USA') ? 'USA' : 'USA',
      ranking: data.ft_global_mba_rank || data.qs_mba_rank || data.bloomberg_mba_rank || null,
      type: 'Full-time MBA',
      duration: '2 years',
      tuition: data.tuition_total || null,
      tuition_per_year: data.tuition_total || null,
      status: 'active',
      website: data.website || null,
      
      // Academic info
      class_size: data.class_size || null,
      women_percentage: data.women_percentage || null,
      mean_gmat: data.mean_gmat || null,
      avg_gmat: data.mean_gmat || null,
      mean_gpa: data.mean_gpa || null,
      avg_gpa: data.mean_gpa || null,
      avg_gre: data.avg_gre || null,
      avg_work_exp_years: data.avg_work_exp_years || null,
      avg_work_exp: data.avg_work_exp_years ? `${data.avg_work_exp_years} years` : null,
      
      // Application info
      application_deadline: data.application_deadlines || null,
      application_deadlines: data.application_deadlines || null,
      application_fee: data.application_fee || null,
      gmat_gre_waiver_available: data.gmat_gre_waiver_available || false,
      class_profile: data.class_profile || null,
      admissions_rounds: data.admissions_rounds || null,
      
      // Deadline rounds - check for both formats
      R1: data.r1_deadline || data.R1 || data.r1 || null,
      R2: data.r2_deadline || data.R2 || data.r2 || null,
      R3: data.r3_deadline || data.R3 || data.r3 || null,
      R4: data.r4_deadline || data.R4 || data.r4 || null,
      R5: data.r5_deadline || data.R5 || data.r5 || null,
      
      // International percentage
      international_percentage: data.international_percentage || data.international_students_percentage || null,
      
      // Rankings
      qs_rank: data.qs_mba_rank || null,
      qs_mba_rank: data.qs_mba_rank || null,
      ft_rank: data.ft_global_mba_rank || null,
      ft_global_mba_rank: data.ft_global_mba_rank || null,
      bloomberg_rank: data.bloomberg_mba_rank || null,
      bloomberg_mba_rank: data.bloomberg_mba_rank || null,
      
      // Employment & Career
      acceptance_rate: null, // Not available in current data
      employment_rate: data.employment_in_3_months_percent || null,
      employment_in_3_months: data.employment_in_3_months_percent ? `${data.employment_in_3_months_percent}%` : null,
      employment_in_3_months_percent: data.employment_in_3_months_percent || null,
      avg_starting_salary: data.avg_starting_salary || null,
      weighted_salary: data.weighted_salary || null,
      salary_increase: null, // Not available in current data
      top_industries: data.top_hiring_companies || null, // Best available mapping
      top_hiring_companies: data.top_hiring_companies || null,
      career_services: null, // Not available in current data
      
      // Alumni & Network
      alumni_network: data.alumni_network_strength || null,
      alumni_network_strength: data.alumni_network_strength || null,
      alumni_support: null, // Not available in current data
      notable_alumni: data.notable_alumni || null,
      
      // Program Details
      start_date: null, // Not available in current data
      format: 'Full-time', // Default
      specializations: null, // Not available in current data
      teaching_methodology: null, // Not available in current data
      global_focus: null, // Not available in current data
      faculty_size: null, // Not available in current data
      research_centers: null, // Not available in current data
      campus_life: null, // Not available in current data
      
      // Status & Classification
      classification: null, // Not available in current data
      tier: null, // Not available in current data
      category: null, // Not available in current data
      
      // Additional fields
      international_students_percentage: data.international_students_percentage || null,
      international_students: data.international_students_percentage ? `${data.international_students_percentage}%` : null,
      
      // Timestamps
      created_at: data.created_at,
      updated_at: data.updated_at,
      
      // Keep all original fields for compatibility
      ...data,
      
      // Process top hiring companies into array format
      top_hiring_companies_array: data.top_hiring_companies 
        ? data.top_hiring_companies.split(';').map((company: string) => company.trim()).filter((company: string) => company.length > 0)
        : [],
        
      // Create structured alumni from the main table columns
      notable_alumni_structured: [
        data.alumnus_1 && { name: data.alumnus_1.split(' (')[0], title: data.alumnus_1.includes('(') ? data.alumnus_1.split(' (')[1].replace(')', '') : '' },
        data.alumnus_2 && { name: data.alumnus_2.split(' (')[0], title: data.alumnus_2.includes('(') ? data.alumnus_2.split(' (')[1].replace(')', '') : '' },
        data.alumnus_3 && { name: data.alumnus_3.split(' (')[0], title: data.alumnus_3.includes('(') ? data.alumnus_3.split(' (')[1].replace(')', '') : '' },
        data.alumnus_4 && { name: data.alumnus_4.split(' (')[0], title: data.alumnus_4.includes('(') ? data.alumnus_4.split(' (')[1].replace(')', '') : '' }
      ].filter(Boolean)
    }

    return NextResponse.json({
      data: transformedData,
      success: true,
    })
  } catch (error) {
    console.error("MBA school GET error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required to update MBA schools", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Admin check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required to update MBA schools", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const body = await request.json()

    // Map frontend field names to database field names
    const mappedData = {
      name: body.name || body.school_name,
      description: body.description,
      location: body.location,
      tuition_total: body.tuition || body.tuition_per_year || body.tuition_total,
      mean_gmat: body.avg_gmat || body.mean_gmat,
      // Map other fields as needed
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("mba_schools")
      .update(mappedData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating MBA school:", error)
      return NextResponse.json(
        { success: false, message: "Failed to update MBA school", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "MBA school updated successfully",
    })
  } catch (error) {
    console.error("MBA school UPDATE error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required to delete MBA schools", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Admin check - only admins can delete
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required to delete MBA schools", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const { error } = await supabase
      .from("mba_schools")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting MBA school:", error)
      return NextResponse.json(
        { success: false, message: "Failed to delete MBA school", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "MBA school deleted successfully",
    })
  } catch (error) {
    console.error("MBA school DELETE error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}