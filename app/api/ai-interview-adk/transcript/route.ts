import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
    const { sessionId, id, speaker, text, timestamp, confidence, messageOrder } = body

    // Get the next message order if not provided
    let order = messageOrder
    if (!order) {
      const { data: lastMessage } = await supabase
        .from('ai_interview_conversation_turns')
        .select('turn_number')
        .eq('session_id', sessionId)
        .order('turn_number', { ascending: false })
        .limit(1)
        .single()
      
      order = lastMessage ? lastMessage.turn_number + 1 : 1
    }

    // Save transcript entry
    const { data, error } = await supabase
      .from('ai_interview_conversation_turns')
      .insert({
        session_id: sessionId,
        turn_number: order,
        speaker: speaker, // maps to the 'speaker' field from client
        message_text: text, // maps to the 'text' field from client
        message_metadata: JSON.stringify({ 
          confidence_score: confidence,
          id: id,
          timestamp: timestamp 
        }),
        timestamp: new Date(timestamp || Date.now())
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save transcript' }, { status: 500 })
    }

    return NextResponse.json({ success: true, transcript: data })

  } catch (error) {
    console.error('Transcript API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ai_interview_conversation_turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_number', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
    }

    return NextResponse.json({ success: true, transcripts: data })

  } catch (error) {
    console.error('Transcript GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('ai_interview_conversation_turns')
      .delete()
      .eq('session_id', sessionId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete transcripts' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Transcripts deleted' })

  } catch (error) {
    console.error('Transcript DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 