import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
      .from("documents")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user can only access their own documents
      .single()

    if (error) {
      console.error("Error fetching document:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch document", errors: [error.message] },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
    })
  } catch (error) {
    console.error("Document GET error:", error)
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
      .from("documents")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user can only update their own documents
      .select()
      .single()

    if (error) {
      console.error("Error updating document:", error)
      return NextResponse.json(
        { success: false, message: "Failed to update document", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Document updated successfully",
    })
  } catch (error) {
    console.error("Document UPDATE error:", error)
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
      .from("documents")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user can only delete their own documents

    if (error) {
      console.error("Error deleting document:", error)
      return NextResponse.json(
        { success: false, message: "Failed to delete document", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Document DELETE error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}