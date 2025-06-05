import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess, createSupabaseServerClientForAPI } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createSupabaseServerClientForAPI(request)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    const offset = (page - 1) * limit

    let query = supabase
      .from('universities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,country.ilike.%${search}%`)
    }

    const { data, error: fetchError, count } = await query

    if (fetchError) {
      console.error('Error fetching schools:', fetchError)
      return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 })
    }

    return NextResponse.json({
      data,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Error in schools GET:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createSupabaseServerClientForAPI(request)
    const body = await request.json()
    const { name, type, location, country, ranking, website, description, status = 'active' } = body

    // Validation
    if (!name || !type || !location || !country) {
      return NextResponse.json({ 
        error: "Name, type, location, and country are required" 
      }, { status: 400 })
    }

    const { data, error: insertError } = await supabase
      .from('universities')
      .insert([{
        name: name.trim(),
        type: type.trim(),
        location: location.trim(),
        country: country.trim(),
        ranking: ranking ? parseInt(ranking) : null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating school:', insertError)
      return NextResponse.json({ error: "Failed to create school" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in schools POST:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}