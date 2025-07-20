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
      .from('ai_interview_agent_config')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agent config:', error)
      return NextResponse.json({ error: 'Failed to fetch agent configuration' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })

  } catch (error) {
    console.error('Agent config GET error:', error)
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
      foundational_prompt, 
      evaluation_criteria, 
      conversation_guidelines, 
      max_conversation_turns 
    } = body

    // Validation
    if (!foundational_prompt || !evaluation_criteria || !conversation_guidelines) {
      return NextResponse.json({ 
        error: 'Foundational prompt, evaluation criteria, and conversation guidelines are required' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ai_interview_agent_config')
      .insert([{
        foundational_prompt: foundational_prompt.trim(),
        evaluation_criteria: evaluation_criteria.trim(),
        conversation_guidelines: conversation_guidelines.trim(),
        max_conversation_turns: max_conversation_turns || 20,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating agent config:', error)
      return NextResponse.json({ error: 'Failed to create agent configuration' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true }, { status: 201 })

  } catch (error) {
    console.error('Agent config POST error:', error)
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
      foundational_prompt, 
      evaluation_criteria, 
      conversation_guidelines, 
      max_conversation_turns 
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Configuration ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ai_interview_agent_config')
      .update({
        foundational_prompt: foundational_prompt?.trim(),
        evaluation_criteria: evaluation_criteria?.trim(),
        conversation_guidelines: conversation_guidelines?.trim(),
        max_conversation_turns,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating agent config:', error)
      return NextResponse.json({ error: 'Failed to update agent configuration' }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })

  } catch (error) {
    console.error('Agent config PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 