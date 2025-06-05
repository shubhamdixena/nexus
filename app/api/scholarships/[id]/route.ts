import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Scholarship, ApiResponse } from "@/types"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create client for public read access (no authentication required for browsing scholarships)
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
      .from("scholarships")
      .select("*")
      .eq("id", params.id)
      .eq("status", "active")
      .single()

    if (error) {
      console.error("Error fetching scholarship:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch scholarship", errors: [error.message] },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Scholarship not found" },
        { status: 404 }
      )
    }

    const response: ApiResponse<Scholarship> = {
      data,
      success: true,
      message: "Scholarship fetched successfully",
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Scholarship API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Authenticate the user for updating scholarships
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required to update scholarships", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Additional admin check for scholarship updates
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required to update scholarships", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const body = await request.json()
    
    if (!body.title || !body.organization || !body.amount) {
      return NextResponse.json(
        { success: false, message: "Title, organization, and amount are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("scholarships")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating scholarship:", error)
      return NextResponse.json(
        { success: false, message: "Failed to update scholarship", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Scholarship updated successfully",
    })
  } catch (error) {
    console.error("Update scholarship error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Authenticate the user for deleting scholarships
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required to delete scholarships", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Additional admin check for scholarship deletion
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required to delete scholarships", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const { error } = await supabase
      .from("scholarships")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting scholarship:", error)
      return NextResponse.json(
        { success: false, message: "Failed to delete scholarship", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Scholarship deleted successfully",
    })
  } catch (error) {
    console.error("Delete scholarship error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}