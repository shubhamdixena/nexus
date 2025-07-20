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
      .from('ai_interview_question_banks')
      .select(`
        *,
        mba_schools (
          business_school
        )
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching question banks:', error)
      return NextResponse.json({ error: 'Failed to fetch question banks' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })

  } catch (error) {
    console.error('Question banks GET error:', error)
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
      question_text,
      question_category = 'general',
      priority = 1,
      is_active = true
    } = body

    // Validation
    if (!school_id || !question_text) {
      return NextResponse.json({ 
        error: 'School ID and question text are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ai_interview_question_banks')
      .insert([{
        school_id,
        question_text: question_text.trim(),
        question_category,
        priority: parseInt(priority),
        is_active,
        created_by: session.user.id,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true }, { status: 201 })

  } catch (error) {
    console.error('Question banks POST error:', error)
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
      question_text,
      question_category,
      priority,
      is_active
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ai_interview_question_banks')
      .update({
        school_id,
        question_text: question_text?.trim(),
        question_category,
        priority: priority ? parseInt(priority) : undefined,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating question:', error)
      return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })

  } catch (error) {
    console.error('Question banks PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 