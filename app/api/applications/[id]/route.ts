import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Application } from "@/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        universities:university_id (
          id,
          name,
          location,
          country
        )
      `)
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user can only access their own applications
      .single()

    if (error) {
      console.error("Error fetching application:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch application", errors: [error.message] },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
    })
  } catch (error) {
    console.error("Application GET error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data, error } = await supabase
      .from("applications")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
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
    console.error("Application UPDATE error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user can only delete their own applications

    if (error) {
      console.error("Error deleting application:", error)
      return NextResponse.json(
        { success: false, message: "Failed to delete application", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    })
  } catch (error) {
    console.error("Application DELETE error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}