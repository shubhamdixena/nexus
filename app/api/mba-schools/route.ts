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

    let query = supabase
      .from("mba_schools")
      .select("*", { count: "exact" })
      .eq("status", "active")

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,country.ilike.%${search}%`)
    }

    if (country) {
      query = query.eq("country", country)
    }

    if (ranking) {
      query = query.lte("ranking", parseInt(ranking))
    }

    query = query
      .order("ranking", { ascending: true, nullsLast: true })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching MBA schools:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch MBA schools", errors: [error.message] },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: PaginatedResponse<MBASchool> = {
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
    
    if (!body.name || !body.location || !body.country) {
      return NextResponse.json(
        { success: false, message: "Name, location, and country are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("mba_schools")
      .insert([{
        ...body,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
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