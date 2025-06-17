import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { MBASchool, MBASchoolListAPIResponse } from "@/types/mba-school-master"

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Create Supabase client for public access
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined }, // No cookies needed for public access
        },
      }
    )

    // Build query
    let query = supabase
      .from('mba_schools')
      .select('*', { count: 'exact' })

    // Apply search if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,country.ilike.%${search}%`)
    }

    // Fetch data with pagination
    const { data, error, count } = await query
      .order('name')
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching MBA schools:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch MBA schools", errors: [error.message] },
        { status: 500 }
      )
    }

    // Transform data to match frontend expectations
    const transformedData: MBASchool[] = (data || []).map((school: any): MBASchool => ({
      // Keep all original fields
      ...school,
      
      // Computed/alias fields for backward compatibility
      avg_gmat: school.mean_gmat,
      avg_gpa: school.mean_gpa,
      tuition: school.tuition_total,
      
      // Application deadline aliases
      R1: school.r1_deadline,
      R2: school.r2_deadline,
      R3: school.r3_deadline,
      R4: school.r4_deadline,
      R5: school.r5_deadline,
      
      // Employment aliases
      employment_rate: school.employment_in_3_months_percent,
      employment_in_3_months: school.employment_in_3_months_percent ? 
        `${school.employment_in_3_months_percent}%` : null,
      
      // Process top hiring companies into array format
      top_hiring_companies_array: school.top_hiring_companies 
        ? school.top_hiring_companies.split(';').map((company: string) => company.trim()).filter((company: string) => company.length > 0)
        : [],
        
      // Default values for missing fields
      type: school.type || 'Full-time MBA',
      duration: school.duration || '2 years',
      status: school.status as 'active' | 'inactive' | 'pending' | null || 'active',
      
      // Additional computed fields
      international_percentage: school.international_students_percentage,
      avg_work_exp: school.avg_work_exp_years ? `${school.avg_work_exp_years} years` : null,
      
      // Rankings (aliases)
      qs_rank: school.qs_mba_rank,
      ft_rank: school.ft_global_mba_rank,
      bloomberg_rank: school.bloomberg_mba_rank,
      
      // Combined ranking (best available)
      ranking: school.ft_global_mba_rank || school.qs_mba_rank || school.bloomberg_mba_rank || school.ranking
    }))

    const totalPages = Math.ceil((count || 0) / limit)

    const response: MBASchoolListAPIResponse = {
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