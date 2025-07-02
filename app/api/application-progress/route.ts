import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForAPI } from '@/lib/supabase/server'
import { ApplicationProgress, CreateApplicationProgressData, UpdateApplicationProgressData } from '@/types/application-management'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeSchoolData = searchParams.get('include_school') === 'true'
    const applicationId = searchParams.get('id')

    let query = supabase
      .from('user_application_progress')
      .select(includeSchoolData ? '*, mba_schools(id, business_school, location, country)' : '*')
      .eq('user_id', user.id)

    if (applicationId) {
      query = query.eq('id', applicationId).single()
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching application progress:', error)
      return NextResponse.json({ error: 'Failed to fetch application progress' }, { status: 500 })
    }

    return NextResponse.json({ 
      data: applicationId ? [data] : data,
      success: true 
    })

  } catch (error) {
    console.error('Application progress GET error:', error)
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

    const body: CreateApplicationProgressData = await request.json()

    // Validate required fields
    if (!body.mba_school_id) {
      return NextResponse.json({ error: 'MBA school ID is required' }, { status: 400 })
    }

    // Check if application progress already exists for this user and school
    const { data: existing } = await supabase
      .from('user_application_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('mba_school_id', body.mba_school_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Application progress already exists for this school' }, { status: 409 })
    }

    const progressData = {
      user_id: user.id,
      mba_school_id: body.mba_school_id,
      application_status: body.application_status || 'not_started',
      notes: body.notes || null,
      priority_level: body.priority_level || 3,
    }

    console.log('Creating application progress with data:', progressData)

    const { data, error } = await supabase
      .from('user_application_progress')
      .insert(progressData)
      .select()
      .single()

    if (error) {
      console.error('Error creating application progress:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Failed to create application progress',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      success: true,
      message: 'Application progress created successfully' 
    })

  } catch (error) {
    console.error('Application progress POST error:', error)
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
    const progressId = searchParams.get('id')

    if (!progressId) {
      return NextResponse.json({ error: 'Progress ID is required' }, { status: 400 })
    }

    const body: UpdateApplicationProgressData = await request.json()

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('user_application_progress')
      .select('id')
      .eq('id', progressId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Application progress not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('user_application_progress')
      .update(body)
      .eq('id', progressId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating application progress:', error)
      return NextResponse.json({ error: 'Failed to update application progress' }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      success: true,
      message: 'Application progress updated successfully' 
    })

  } catch (error) {
    console.error('Application progress PUT error:', error)
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
    const progressId = searchParams.get('id')

    if (!progressId) {
      return NextResponse.json({ error: 'Progress ID is required' }, { status: 400 })
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('user_application_progress')
      .delete()
      .eq('id', progressId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting application progress:', error)
      return NextResponse.json({ error: 'Failed to delete application progress' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Application progress deleted successfully' 
    })

  } catch (error) {
    console.error('Application progress DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 