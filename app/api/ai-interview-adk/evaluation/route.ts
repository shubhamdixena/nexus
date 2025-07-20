import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Simple evaluation logic - in production, this would use AI services
function analyzeTranscript(transcript: any[]): any {
  const totalResponses = transcript.filter(t => t.speaker === 'user').length
  const totalDuration = transcript.length > 0 ? 
    Math.floor((new Date(transcript[transcript.length - 1].timestamp).getTime() - 
                new Date(transcript[0].timestamp).getTime()) / 1000) : 0

  // Simple scoring based on response characteristics
  const responses = transcript.filter(t => t.speaker === 'user')
  const avgResponseLength = responses.reduce((sum, r) => sum + r.message_text.length, 0) / Math.max(responses.length, 1)
  const avgResponseTime = totalDuration / Math.max(responses.length, 1)

  // Basic scoring algorithm
  const communicationScore = Math.min(100, Math.max(30, 60 + (avgResponseLength / 20)))
  const contentScore = Math.min(100, Math.max(40, 50 + (responses.length * 5)))
  const confidenceScore = Math.min(100, Math.max(35, 80 - (avgResponseTime / 2)))
  const clarityScore = Math.min(100, Math.max(45, 70 + (avgResponseLength / 15)))
  
  const overallScore = Math.round((communicationScore + contentScore + confidenceScore + clarityScore) / 4)

  return {
    overall_score: overallScore,
    communication_score: Math.round(communicationScore),
    content_score: Math.round(contentScore),
    confidence_score: Math.round(confidenceScore),
    clarity_score: Math.round(clarityScore),
    response_time_avg: avgResponseTime,
    total_duration: totalDuration,
    total_responses: totalResponses,
    strengths: [
      ...(communicationScore > 75 ? ['Strong communication skills'] : []),
      ...(contentScore > 75 ? ['Well-structured responses'] : []),
      ...(confidenceScore > 75 ? ['Confident delivery'] : []),
      ...(clarityScore > 75 ? ['Clear and articulate'] : []),
      ...(responses.length > 8 ? ['Good engagement level'] : [])
    ],
    areas_for_improvement: [
      ...(communicationScore < 60 ? ['Work on communication clarity'] : []),
      ...(contentScore < 60 ? ['Provide more detailed responses'] : []),
      ...(confidenceScore < 60 ? ['Practice to build confidence'] : []),
      ...(clarityScore < 60 ? ['Focus on articulation'] : []),
      ...(responses.length < 5 ? ['Engage more actively in conversation'] : [])
    ],
    detailed_feedback: [
      {
        category: 'Communication Skills',
        score: Math.round(communicationScore),
        feedback: communicationScore > 75 ? 
          'You demonstrated excellent communication skills with clear, well-articulated responses.' :
          communicationScore > 60 ?
          'Your communication was generally good, with room for improvement in clarity and engagement.' :
          'Focus on improving clarity and structure in your responses. Practice speaking more confidently.',
        examples: responses.slice(0, 2).map(r => r.message_text.substring(0, 100) + '...')
      },
      {
        category: 'Content Quality',
        score: Math.round(contentScore),
        feedback: contentScore > 75 ?
          'Your responses showed depth and thoughtfulness with relevant examples.' :
          contentScore > 60 ?
          'Good content overall, but could benefit from more specific examples and details.' :
          'Work on providing more substantial, detailed responses with concrete examples.',
        examples: []
      },
      {
        category: 'Confidence & Delivery',
        score: Math.round(confidenceScore),
        feedback: confidenceScore > 75 ?
          'You projected confidence and handled questions with poise.' :
          confidenceScore > 60 ?
          'Generally confident, but could benefit from more decisive responses.' :
          'Practice speaking with more confidence and reduce hesitation in responses.',
        examples: []
      }
    ]
  }
}

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
    const { sessionId, sessionData } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get transcript for analysis
    const { data: transcript, error: transcriptError } = await supabase
      .from('ai_interview_conversation_turns')
      .select('*')
      .eq('session_id', sessionId)
      .order('turn_number', { ascending: true })

    if (transcriptError) {
      console.error('Failed to fetch transcript:', transcriptError)
      return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 })
    }

    // Generate evaluation
    const evaluation = analyzeTranscript(transcript || [])

    // Save evaluation to database (you would create this table)
    const { data: savedEvaluation, error: saveError } = await supabase
      .from('ai_interview_evaluations')
      .upsert({
        session_id: sessionId,
        user_id: user.id,
        evaluation_data: evaluation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single()

    if (saveError) {
      console.warn('Failed to save evaluation to database:', saveError)
      // Continue without saving - evaluation can still be returned
    }

    return NextResponse.json({ 
      success: true, 
      evaluation,
      saved: !saveError
    })

  } catch (error) {
    console.error('Evaluation API error:', error)
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

    // Try to get existing evaluation
    const { data: existingEvaluation, error } = await supabase
      .from('ai_interview_evaluations')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch evaluation' }, { status: 500 })
    }

    if (existingEvaluation) {
      return NextResponse.json({ 
        success: true, 
        evaluation: existingEvaluation.evaluation_data 
      })
    }

    // No existing evaluation found
    return NextResponse.json({ 
      success: true, 
      evaluation: null 
    })

  } catch (error) {
    console.error('Evaluation GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
