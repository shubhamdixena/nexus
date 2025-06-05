import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { University, PaginatedResponse, UniversityFilters } from "@/types"

export async function GET(request: NextRequest) {
  try {
    // Create client for public read access (no authentication required for browsing universities)
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
    const program = searchParams.get("program") || ""
    
    const offset = (page - 1) * limit

    // Start building the query
    let query = supabase
      .from("universities")
      .select("*", { count: "exact" })

    // Apply search filter
    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,country.ilike.%${search}%`)
    }

    // Apply country filter
    if (country) {
      query = query.eq("country", country)
    }

    // Apply program filter
    if (program) {
      query = query.contains("programs", [program])
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    query = query.order("name", { ascending: true })

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching universities:", error)
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to fetch universities", 
          error: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: PaginatedResponse<University> = {
      data: data || [],
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
    console.error("Universities API error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
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

    // Authenticate the user for creating universities
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required to create universities", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Additional admin check for university creation
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required to create universities", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Basic validation
    if (!body.name || !body.location || !body.country) {
      return NextResponse.json(
        { success: false, message: "Name, location, and country are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("universities")
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creating university:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create university", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "University created successfully",
    })
  } catch (error) {
    console.error("Create university error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}