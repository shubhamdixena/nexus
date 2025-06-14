import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { MBASchool, PaginatedResponse } from "@/types"

export async function GET(request: NextRequest) {
  try {
    // Create client for public read access (no authentication required for browsing MBA schools)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }, // No cookies needed for public access
        },
      }
    )

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const country = searchParams.get("country") || ""
    const ranking = searchParams.get("ranking") || ""
    
    const offset = (page - 1) * limit

    // Select all fields and transform them in JavaScript
    let query = supabase
      .from("mba_schools")
      .select("*", { count: "exact" })

    // Update search to use actual database field names
    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (country) {
      // Since most data seems to be USA, we can filter by location contains
      query = query.ilike("location", `%${country}%`)
    }

    if (ranking) {
      query = query.lte("ft_global_mba_rank", parseInt(ranking))
    }

    query = query
      .order("ft_global_mba_rank", { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching MBA schools:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch MBA schools", errors: [error.message] },
        { status: 500 }
      )
    }

    // Transform data to match frontend expectations
    const transformedData = (data || []).map((school: any) => ({
      // Map database fields to frontend expected fields
      id: school.id,
      name: school.name || 'Unknown School',
      description: school.description,
      location: school.location || 'USA',
      country: school.location?.includes('USA') ? 'USA' : 'USA',
      ranking: school.ft_global_mba_rank || school.qs_mba_rank || school.bloomberg_mba_rank || null,
      type: 'Full-time MBA',
      duration: '2 years',
      tuition: school.tuition_total || null,
      tuition_per_year: school.tuition_total || null,
      status: 'active',
      
      // Academic info
      class_size: school.class_size || null,
      women_percentage: school.women_percentage || null,
      mean_gmat: school.mean_gmat || null,
      avg_gmat: school.mean_gmat || null,
      mean_gpa: school.mean_gpa || null,
      avg_gpa: school.mean_gpa || null,
      avg_gre: school.avg_gre || null,
      avg_work_exp_years: school.avg_work_exp_years || null,
      avg_work_exp: school.avg_work_exp_years ? `${school.avg_work_exp_years} years` : null,
      
      // Application info
      application_deadline: school.application_deadlines || null,
      application_deadlines: school.application_deadlines || null,
      application_fee: school.application_fee || null,
      gmat_gre_waiver_available: school.gmat_gre_waiver_available || false,
      class_profile: school.class_profile || null,
      admissions_rounds: school.admissions_rounds || null,
      
      // Rankings
      qs_mba_rank: school.qs_mba_rank || null,
      ft_global_mba_rank: school.ft_global_mba_rank || null,
      bloomberg_mba_rank: school.bloomberg_mba_rank || null,
      
      // Employment & Career
      employment_in_3_months_percent: school.employment_in_3_months_percent || null,
      employment_in_3_months: school.employment_in_3_months_percent ? `${school.employment_in_3_months_percent}%` : null,
      employment_rate: school.employment_in_3_months_percent || null,
      avg_starting_salary: school.avg_starting_salary || null,
      weighted_salary: school.weighted_salary || null,
      top_hiring_companies: school.top_hiring_companies || null,
      
      // Alumni & Network
      alumni_network_strength: school.alumni_network_strength || null,
      notable_alumni: school.notable_alumni || null,
      
      // Additional fields
      international_students_percentage: school.international_students_percentage || null,
      international_students: school.international_students_percentage ? `${school.international_students_percentage}%` : null,
      
      // Timestamps
      created_at: school.created_at,
      updated_at: school.updated_at,
      
      // Keep original fields for compatibility
      ...school
    }))

    const totalPages = Math.ceil((count || 0) / limit)

    const response: PaginatedResponse<MBASchool> = {
      data: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      success: true,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("MBA schools API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Authenticate the user for creating MBA schools
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required to create MBA schools", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Additional admin check for MBA school creation
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required to create MBA schools", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const body = await request.json()
    
    if (!body.name || !body.location) {
      return NextResponse.json(
        { success: false, message: "Name and location are required" },
        { status: 400 }
      )
    }

    // Map frontend field names to database field names
    const mappedData = {
      name: body.name,
      description: body.description,
      location: body.location || 'USA',
      tuition_total: body.tuition || body.tuition_per_year,
      mean_gmat: body.avg_gmat || body.mean_gmat,
      // Add other field mappings as needed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("mba_schools")
      .insert([mappedData])
      .select()
      .single()

    if (error) {
      console.error("Error creating MBA school:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create MBA school", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "MBA school created successfully",
    })
  } catch (error) {
    console.error("Create MBA school error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}