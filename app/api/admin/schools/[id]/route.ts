import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess, createSupabaseServerClientForAPI } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createSupabaseServerClientForAPI(request)
    const { data, error: fetchError } = await supabase
      .from('universities')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching school:', fetchError)
      return NextResponse.json({ error: "Failed to fetch school" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in school GET:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createSupabaseServerClientForAPI(request)
    const body = await request.json()

    const { data, error: updateError } = await supabase
      .from('universities')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating school:', updateError)
      return NextResponse.json({ error: "Failed to update school" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in school PUT:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isAdmin, error } = await checkAdminAccess(request)
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createSupabaseServerClientForAPI(request)
    const { error: deleteError } = await supabase
      .from('universities')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting school:', deleteError)
      return NextResponse.json({ error: "Failed to delete school" }, { status: 500 })
    }

    return NextResponse.json({ message: "School deleted successfully" })
  } catch (error) {
    console.error('Error in school DELETE:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}