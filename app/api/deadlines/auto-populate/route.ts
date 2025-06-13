import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// POST /api/deadlines/auto-populate - Auto-populate deadlines from bookmarked items
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { source_type, source_id, source_name, deadline_date } = body

    // Validate required fields
    if (!source_type || !source_id || !source_name) {
      return NextResponse.json(
        { error: 'Missing required fields: source_type, source_id, source_name' },
        { status: 400 }
      )
    }

    // Validate source_type
    const validSourceTypes = ['school_bookmark', 'scholarship_save']
    if (!validSourceTypes.includes(source_type)) {
      return NextResponse.json({ error: 'Invalid source_type' }, { status: 400 })
    }

    let deadlinesAdded = 0

    try {
      if (source_type === 'school_bookmark') {
        // Call the PostgreSQL function to auto-populate school deadlines
        const { data, error } = await supabase.rpc('auto_populate_school_deadlines', {
          p_user_id: user.id,
          p_school_id: source_id,
          p_school_name: source_name
        })

        if (error) {
          console.error('Error calling auto_populate_school_deadlines:', error)
          return NextResponse.json({ error: 'Failed to auto-populate school deadlines' }, { status: 500 })
        }

        deadlinesAdded = data || 0
      } else if (source_type === 'scholarship_save') {
        // Call the PostgreSQL function to auto-populate scholarship deadlines
        const { data, error } = await supabase.rpc('auto_populate_scholarship_deadlines', {
          p_user_id: user.id,
          p_scholarship_id: source_id,
          p_scholarship_name: source_name,
          p_deadline_date: deadline_date || null
        })

        if (error) {
          console.error('Error calling auto_populate_scholarship_deadlines:', error)
          return NextResponse.json({ error: 'Failed to auto-populate scholarship deadlines' }, { status: 500 })
        }

        deadlinesAdded = data || 0
      }

      return NextResponse.json({
        message: `Successfully auto-populated ${deadlinesAdded} deadlines`,
        deadlinesAdded,
        source: {
          type: source_type,
          id: source_id,
          name: source_name
        }
      })
    } catch (error) {
      console.error('Error during auto-population:', error)
      return NextResponse.json({ error: 'Failed to auto-populate deadlines' }, { status: 500 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/deadlines/auto-populate - Get auto-population history
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: imports, error } = await supabase
      .from('deadline_auto_imports')
      .select('*')
      .eq('user_id', user.id)
      .order('import_date', { ascending: false })

    if (error) {
      console.error('Error fetching auto-imports:', error)
      return NextResponse.json({ error: 'Failed to fetch auto-import history' }, { status: 500 })
    }

    return NextResponse.json({ imports })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 