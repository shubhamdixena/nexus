import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForAPI } from '@/lib/supabase/server'
import { LetterOfRecommendation, CreateLORData, UpdateLORData } from '@/types/application-management'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const progressId = searchParams.get('progress_id')
    const lorId = searchParams.get('id')

    let query = supabase
      .from('user_application_lors')
      .select('*')
      .eq('user_id', user.id)

    if (lorId) {
      query = query.eq('id', lorId).single()
    } else if (progressId) {
      query = query.eq('application_progress_id', progressId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching LORs:', error)
      return NextResponse.json({ error: 'Failed to fetch letters of recommendation' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: lorId ? [data] : data,
      success: true 
    })

  } catch (error) {
    console.error('LORs GET error:', error)
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

    const body: CreateLORData = await request.json()

    // Validate required fields
    if (!body.application_progress_id || !body.recommender_name || !body.relationship_to_applicant) {
      return NextResponse.json({ 
        error: 'Application progress ID, recommender name, and relationship are required' 
      }, { status: 400 })
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

    const lorData = {
      user_id: user.id,
      application_progress_id: body.application_progress_id,
      recommender_name: body.recommender_name,
      recommender_title: body.recommender_title || null,
      recommender_organization: body.recommender_organization || null,
      recommender_email: body.recommender_email || null,
      recommender_phone: body.recommender_phone || null,
      relationship_to_applicant: body.relationship_to_applicant,
      relationship_duration: body.relationship_duration || null,
      work_context: body.work_context || null,
      lor_type: body.lor_type || 'standard',
      is_required: body.is_required ?? true,
      deadline_date: body.deadline_date || null,
    }

    const { data, error } = await supabase
      .from('user_application_lors')
      .insert(lorData)
      .select()
      .single()

    if (error) {
      console.error('Error creating LOR:', error)
      return NextResponse.json({ error: 'Failed to create letter of recommendation' }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      success: true,
      message: 'Letter of recommendation created successfully' 
    })

  } catch (error) {
    console.error('LORs POST error:', error)
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
    const lorId = searchParams.get('id')

    if (!lorId) {
      return NextResponse.json({ error: 'LOR ID is required' }, { status: 400 })
    }

    const body: UpdateLORData = await request.json()

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('user_application_lors')
      .select('id')
      .eq('id', lorId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Letter of recommendation not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('user_application_lors')
      .update(body)
      .eq('id', lorId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating LOR:', error)
      return NextResponse.json({ error: 'Failed to update letter of recommendation' }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      success: true,
      message: 'Letter of recommendation updated successfully' 
    })

  } catch (error) {
    console.error('LORs PUT error:', error)
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
    const lorId = searchParams.get('id')

    if (!lorId) {
      return NextResponse.json({ error: 'LOR ID is required' }, { status: 400 })
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('user_application_lors')
      .delete()
      .eq('id', lorId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting LOR:', error)
      return NextResponse.json({ error: 'Failed to delete letter of recommendation' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Letter of recommendation deleted successfully' 
    })

  } catch (error) {
    console.error('LORs DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 