import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/deadlines/[id] - Get specific deadline
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: deadline, error } = await supabase
      .from('deadlines')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching deadline:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch deadline' }, { status: 500 })
    }

    return NextResponse.json({ deadline })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/deadlines/[id] - Update deadline
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const updateData: any = {}

    // Only update provided fields
    if (body.title !== undefined) updateData.title = body.title
    if (body.deadline_type !== undefined) {
      const validTypes = ['application', 'scholarship', 'test', 'reminder', 'interview']
      if (!validTypes.includes(body.deadline_type)) {
        return NextResponse.json({ error: 'Invalid deadline_type' }, { status: 400 })
      }
      updateData.deadline_type = body.deadline_type
    }
    if (body.priority !== undefined) {
      const validPriorities = ['high', 'medium', 'low']
      if (!validPriorities.includes(body.priority)) {
        return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
      }
      updateData.priority = body.priority
    }
    if (body.deadline_date !== undefined) updateData.deadline_date = body.deadline_date
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.completed !== undefined) updateData.completed = body.completed

    const { data: deadline, error } = await supabase
      .from('deadlines')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating deadline:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A deadline with this title and date already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Failed to update deadline' }, { status: 500 })
    }

    return NextResponse.json({ deadline })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/deadlines/[id] - Delete deadline
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting deadline:', error)
      return NextResponse.json({ error: 'Failed to delete deadline' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Deadline deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 