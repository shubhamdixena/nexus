import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForAPI } from '@/lib/supabase/server'
import { ApplicationEssay, CreateEssayData, UpdateEssayData } from '@/types/application-management'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const progressId = searchParams.get('progress_id')
    const essayId = searchParams.get('id')

    let query = supabase
      .from('user_application_essays')
      .select('*')
      .eq('user_id', user.id)

    if (essayId) {
      query = query.eq('id', essayId).single()
    } else if (progressId) {
      query = query.eq('application_progress_id', progressId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching essays:', error)
      return NextResponse.json({ error: 'Failed to fetch essays' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: essayId ? [data] : data,
      success: true 
    })

  } catch (error) {
    console.error('Essays GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateEssayData = await request.json()

    // Validate required fields
    if (!body.application_progress_id) {
      return NextResponse.json({ error: 'Application progress ID is required' }, { status: 400 })
    }

    // Verify ownership of the application progress
    const { data: progress, error: progressError } = await supabase
      .from('user_application_progress')
      .select('id')
      .eq('id', body.application_progress_id)
      .eq('user_id', user.id)
      .single()

    if (progressError || !progress) {
      return NextResponse.json({ error: 'Application progress not found or access denied' }, { status: 404 })
    }

    const essayData = {
      user_id: user.id,
      application_progress_id: body.application_progress_id,
      essay_title: body.essay_title || 'Essay',
      essay_prompt: body.essay_prompt || null,
      content: body.content || '',
      max_word_limit: body.max_word_limit || null,
      min_word_limit: body.min_word_limit || null,
      is_required: body.is_required ?? true,
    }

    const { data, error } = await supabase
      .from('user_application_essays')
      .insert(essayData)
      .select()
      .single()

    if (error) {
      console.error('Error creating essay:', error)
      return NextResponse.json({ error: 'Failed to create essay' }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      success: true,
      message: 'Essay created successfully' 
    })

  } catch (error) {
    console.error('Essays POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const essayId = searchParams.get('id')

    if (!essayId) {
      return NextResponse.json({ error: 'Essay ID is required' }, { status: 400 })
    }

    const body: UpdateEssayData = await request.json()

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('user_application_essays')
      .select('id')
      .eq('id', essayId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('user_application_essays')
      .update(body)
      .eq('id', essayId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating essay:', error)
      return NextResponse.json({ error: 'Failed to update essay' }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      success: true,
      message: 'Essay updated successfully' 
    })

  } catch (error) {
    console.error('Essays PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const essayId = searchParams.get('id')

    if (!essayId) {
      return NextResponse.json({ error: 'Essay ID is required' }, { status: 400 })
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('user_application_essays')
      .delete()
      .eq('id', essayId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting essay:', error)
      return NextResponse.json({ error: 'Failed to delete essay' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Essay deleted successfully' 
    })

  } catch (error) {
    console.error('Essays DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 