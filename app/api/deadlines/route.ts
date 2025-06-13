import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import ApiCache from '@/lib/api-cache'

export const dynamic = 'force-dynamic'

// GET /api/deadlines - Fetch user's deadlines
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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const type = searchParams.get('type')
    const completed = searchParams.get('completed')

    // Generate cache key based on user and query parameters
    const queryParams = { startDate, endDate, type, completed }
    const cacheKey = ApiCache.generateKey('deadlines', user.id, queryParams)

    return ApiCache.cachedResponse(
      cacheKey,
      async () => {
        let query = supabase
          .from('deadlines')
          .select('*')
          .eq('user_id', user.id)
          .order('deadline_date', { ascending: true })

        // Apply filters
        if (startDate) {
          query = query.gte('deadline_date', startDate)
        }
        if (endDate) {
          query = query.lte('deadline_date', endDate)
        }
        if (type) {
          query = query.eq('deadline_type', type)
        }
        if (completed !== null) {
          query = query.eq('completed', completed === 'true')
        }

        const { data: deadlines, error } = await query

        if (error) {
          console.error('Error fetching deadlines:', error)
          throw new Error('Failed to fetch deadlines')
        }

        return { deadlines }
      },
      { ttl: 2 * 60 * 1000 } // Cache for 2 minutes (shorter for user-specific data)
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/deadlines - Create new deadline
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
    const {
      title,
      deadline_type,
      priority = 'medium',
      deadline_date,
      notes,
      source_type = 'manual',
      source_id
    } = body

    // Validate required fields
    if (!title || !deadline_type || !deadline_date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, deadline_type, deadline_date' },
        { status: 400 }
      )
    }

    // Validate deadline_type
    const validTypes = ['application', 'scholarship', 'test', 'reminder', 'interview']
    if (!validTypes.includes(deadline_type)) {
      return NextResponse.json({ error: 'Invalid deadline_type' }, { status: 400 })
    }

    // Validate priority
    const validPriorities = ['high', 'medium', 'low']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
    }

    const { data: deadline, error } = await supabase
      .from('deadlines')
      .insert([
        {
          user_id: user.id,
          title,
          deadline_type,
          priority,
          deadline_date,
          notes,
          source_type,
          source_id
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating deadline:', error)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A deadline with this title and date already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Failed to create deadline' }, { status: 500 })
    }

    // Invalidate user's deadlines cache after creation
    ApiCache.invalidate(`deadlines:user:${user.id}`)

    return NextResponse.json({ deadline }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 