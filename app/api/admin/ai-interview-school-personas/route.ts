import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForAPI } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('ai_interview_school_personas')
      .select(`
        *,
        mba_schools (
          business_school,
          location
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching school personas:', error)
      return NextResponse.json({ error: 'Failed to fetch school personas' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })

  } catch (error) {
    console.error('School personas GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      school_id,
      interviewer_name,
      interviewer_title,
      tone,
      background,
      greeting,
      closing,
      school_context,
      behavioral_notes,
      is_active = true
    } = body

    // Validation
    if (!school_id || !interviewer_name || !interviewer_title || !tone) {
      return NextResponse.json({ 
        error: 'School ID, interviewer name, title, and tone are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ai_interview_school_personas')
      .insert([{
        school_id,
        interviewer_name: interviewer_name.trim(),
        interviewer_title: interviewer_title.trim(),
        tone,
        background: background?.trim() || '',
        greeting: greeting?.trim() || '',
        closing: closing?.trim() || '',
        school_context: school_context?.trim() || '',
        behavioral_notes: behavioral_notes?.trim() || '',
        is_active,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating school persona:', error)
      return NextResponse.json({ error: 'Failed to create school persona' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true }, { status: 201 })

  } catch (error) {
    console.error('School personas POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      id,
      school_id,
      interviewer_name,
      interviewer_title,
      tone,
      background,
      greeting,
      closing,
      school_context,
      behavioral_notes,
      is_active
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Persona ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ai_interview_school_personas')
      .update({
        school_id,
        interviewer_name: interviewer_name?.trim(),
        interviewer_title: interviewer_title?.trim(),
        tone,
        background: background?.trim(),
        greeting: greeting?.trim(),
        closing: closing?.trim(),
        school_context: school_context?.trim(),
        behavioral_notes: behavioral_notes?.trim(),
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating school persona:', error)
      return NextResponse.json({ error: 'Failed to update school persona' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })

  } catch (error) {
    console.error('School personas PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 