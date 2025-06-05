import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Application, PaginatedResponse } from "@/types"

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

    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const applicationType = searchParams.get("application_type")
    
    // Use authenticated user's ID instead of accepting it as parameter
    const userId = user.id

    const offset = (page - 1) * limit

    let query = supabase
      .from("applications")
      .select(`
        *,
        universities:university_id (
          id,
          name,
          location,
          country
        )
      `, { count: "exact" })
      .eq("user_id", userId)

    if (status) {
      query = query.eq("status", status)
    }

    if (applicationType) {
      query = query.eq("application_type", applicationType)
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching applications:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch applications", errors: [error.message] },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: PaginatedResponse<Application> = {
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
    console.error("Applications API error:", error)
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

    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.university_id || !body.program_name || !body.application_type) {
      return NextResponse.json(
        { success: false, message: "University ID, program name, and application type are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("applications")
      .insert([{
        ...body,
        user_id: user.id, // Use authenticated user's ID
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select(`
        *,
        universities:university_id (
          id,
          name,
          location,
          country
        )
      `)
      .single()

    if (error) {
      console.error("Error creating application:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create application", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Application created successfully",
    })
  } catch (error) {
    console.error("Create application error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("applications")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user can only update their own applications
      .select(`
        *,
        universities:university_id (
          id,
          name,
          location,
          country
        )
      `)
      .single()

    if (error) {
      console.error("Error updating application:", error)
      return NextResponse.json(
        { success: false, message: "Failed to update application", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Application updated successfully",
    })
  } catch (error) {
    console.error("Update application error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}