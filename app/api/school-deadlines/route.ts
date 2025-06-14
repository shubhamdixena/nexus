import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/school-deadlines - Get school deadlines (visible to all users)
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

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    let query = supabase
      .from('school_deadlines')
      .select('*')
      .eq('is_active', true)
      .order('deadline_date')

    // Filter by date range if provided
    if (start) {
      query = query.gte('deadline_date', start)
    }
    if (end) {
      query = query.lte('deadline_date', end)
    }

    const { data: deadlines, error } = await query

    if (error) {
      console.error('Error fetching school deadlines:', error)
      return NextResponse.json({ error: 'Failed to fetch school deadlines' }, { status: 500 })
    }

    return NextResponse.json({ deadlines: deadlines || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 