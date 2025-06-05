import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { University } from "@/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const { data, error } = await supabase
      .from("universities")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching university:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch university", errors: [error.message] },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "University not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
    })
  } catch (error) {
    console.error("University GET error:", error)
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
        error: "Unauthorized - Authentication required to update universities", 
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
        error: "Forbidden - Admin access required to update universities", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("universities")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating university:", error)
      return NextResponse.json(
        { success: false, message: "Failed to update university", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "University updated successfully",
    })
  } catch (error) {
    console.error("University UPDATE error:", error)
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
        error: "Unauthorized - Authentication required to delete universities", 
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
        error: "Forbidden - Admin access required to delete universities", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const { error } = await supabase
      .from("universities")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting university:", error)
      return NextResponse.json(
        { success: false, message: "Failed to delete university", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "University deleted successfully",
    })
  } catch (error) {
    console.error("University DELETE error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}