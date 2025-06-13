import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemType = searchParams.get("type") // university, mba_school, scholarship, sop
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    
    const offset = (page - 1) * limit

    // Build query for user's bookmarks
    let query = supabase
      .from("user_bookmarks")
      .select(`
        id,
        item_type,
        item_id,
        notes,
        tags,
        created_at,
        updated_at
      `, { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Filter by type if specified
    if (itemType && ["university", "mba_school", "scholarship", "sop"].includes(itemType)) {
      query = query.eq("item_type", itemType)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: bookmarks, error, count } = await query

    if (error) {
      console.error("Error fetching bookmarks:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch bookmarks", errors: [error.message] },
        { status: 500 }
      )
    }

    // Get bookmark counts by type
    const { data: countsData, error: countsError } = await supabase
      .rpc('get_user_bookmark_counts', { user_uuid: user.id })
      .single()

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      data: bookmarks || [],
      counts: countsData || {
        universities_count: 0,
        mba_schools_count: 0,
        scholarships_count: 0,
        sops_count: 0,
        total_count: 0
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      success: true,
    })
  } catch (error) {
    console.error("Error in bookmarks API:", error)
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.item_type || !body.item_id) {
      return NextResponse.json(
        { success: false, message: "item_type and item_id are required" },
        { status: 400 }
      )
    }

    // Validate item_type
    if (!["university", "mba_school", "scholarship", "sop"].includes(body.item_type)) {
      return NextResponse.json(
        { success: false, message: "Invalid item_type" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("user_bookmarks")
      .insert({
        user_id: user.id,
        item_type: body.item_type,
        item_id: body.item_id,
        notes: body.notes || null,
        tags: body.tags || [],
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation (duplicate bookmark)
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, message: "Item already bookmarked" },
          { status: 409 }
        )
      }
      
      console.error("Error creating bookmark:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create bookmark", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Bookmark created successfully"
    })
  } catch (error) {
    console.error("Error in bookmark creation:", error)
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized - Authentication required", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemType = searchParams.get("item_type")
    const itemId = searchParams.get("item_id")
    
    if (!itemType || !itemId) {
      return NextResponse.json(
        { success: false, message: "item_type and item_id are required" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("user_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("item_type", itemType)
      .eq("item_id", itemId)

    if (error) {
      console.error("Error deleting bookmark:", error)
      return NextResponse.json(
        { success: false, message: "Failed to delete bookmark", errors: [error.message] },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Bookmark deleted successfully"
    })
  } catch (error) {
    console.error("Error in bookmark deletion:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}