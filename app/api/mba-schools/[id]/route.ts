import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { MBASchool, MBASchoolAPIResponse } from "@/types/mba-school-master"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const { data, error } = await supabase
      .from("mba_schools")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("Error fetching MBA school:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch MBA school", errors: error ? [error.message] : [] },
        { status: error ? 500 : 404 }
      )
    }

    // Transform data to match frontend expectations using our master type
    const transformedData: MBASchool = {
      // Keep all original fields for compatibility
      ...data,
      
      // Computed/alias fields for backward compatibility
      avg_gmat: data.mean_gmat,
      avg_gpa: data.mean_gpa,
      tuition: data.tuition_total,
      
      // Application deadline aliases
      R1: data.r1_deadline,
      R2: data.r2_deadline,
      R3: data.r3_deadline,
      R4: data.r4_deadline,
      R5: data.r5_deadline,
      
      // Employment aliases
      employment_rate: data.employment_in_3_months_percent,
      employment_in_3_months: data.employment_in_3_months_percent ? 
        `${data.employment_in_3_months_percent}%` : null,
      
      // Alumni structured data
      notable_alumni_structured: [
        data.alumnus_1 && { 
          name: data.alumnus_1.split(' (')[0], 
          title: data.alumnus_1.includes('(') ? data.alumnus_1.split(' (')[1].replace(')', '') : '' 
        },
        data.alumnus_2 && { 
          name: data.alumnus_2.split(' (')[0], 
          title: data.alumnus_2.includes('(') ? data.alumnus_2.split(' (')[1].replace(')', '') : '' 
        },
        data.alumnus_3 && { 
          name: data.alumnus_3.split(' (')[0], 
          title: data.alumnus_3.includes('(') ? data.alumnus_3.split(' (')[1].replace(')', '') : '' 
        },
        data.alumnus_4 && { 
          name: data.alumnus_4.split(' (')[0], 
          title: data.alumnus_4.includes('(') ? data.alumnus_4.split(' (')[1].replace(')', '') : '' 
        }
      ].filter(Boolean),
      
      // Process top hiring companies into array format
      top_hiring_companies_array: data.top_hiring_companies 
        ? data.top_hiring_companies.split(';').map((company: string) => company.trim()).filter((company: string) => company.length > 0)
        : [],
        
      // Default values for missing fields
      type: data.type || 'Full-time MBA',
      duration: data.duration || '2 years',
      status: data.status as 'active' | 'inactive' | 'pending' | null || 'active',
      
      // Additional computed fields
      international_percentage: data.international_students_percentage,
      avg_work_exp: data.avg_work_exp_years ? `${data.avg_work_exp_years} years` : null,
      
      // Rankings (aliases)
      qs_rank: data.qs_mba_rank,
      ft_rank: data.ft_global_mba_rank,
      bloomberg_rank: data.bloomberg_mba_rank,
      
      // Combined ranking (best available)
      ranking: data.ft_global_mba_rank || data.qs_mba_rank || data.bloomberg_mba_rank || data.ranking
    }

    const response: MBASchoolAPIResponse = {
      data: transformedData,
      success: true,
    }

    return NextResponse.json(response)
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