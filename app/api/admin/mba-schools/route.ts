import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { MBASchool, PaginatedResponse } from "@/types"

export async function GET(request: NextRequest) {
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

    // Authenticate admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required for admin access", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    
    const offset = (page - 1) * limit

    let query = supabase
      .from("mba_schools")
      .select("*", { count: "exact" })

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,country.ilike.%${search}%`)
    }

    query = query
      .order("created_at", { ascending: false })
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
    console.error("Admin MBA schools API error:", error)
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

    // Authenticate admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required for admin access", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required", 
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