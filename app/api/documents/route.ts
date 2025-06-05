import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Document, PaginatedResponse } from "@/types"

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
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    
    // Use authenticated user's ID
    const userId = user.id

    const offset = (page - 1) * limit

    let query = supabase
      .from("documents")
      .select("*", { count: "exact" })
      .eq("user_id", userId)

    if (type) {
      query = query.eq("type", type)
    }

    if (status) {
      query = query.eq("status", status)
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching documents:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch documents", errors: [error.message] },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const response: PaginatedResponse<Document> = {
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
    console.error("Documents API error:", error)
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
    
    if (!body.name || !body.type || !body.file_url) {
      return NextResponse.json(
        { success: false, message: "Name, type, and file URL are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("documents")
      .insert([{
        ...body,
        user_id: user.id, // Use authenticated user's ID
        status: "pending",
        upload_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creating document:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create document", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Document uploaded successfully",
    })
  } catch (error) {
    console.error("Create document error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const documentId = searchParams.get("id")

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: "Document ID is required" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
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
    console.error("Delete document error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}