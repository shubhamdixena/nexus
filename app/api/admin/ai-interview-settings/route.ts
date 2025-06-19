import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAccess, createSupabaseServerClientForAPI } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin permissions
    const { isAdmin, user, error } = await checkAdminAccess(request)
    if (error || !user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get AI interview settings from environment variables or database
    // This is a mock response - you would implement actual retrieval logic
    const settings = {
      stt: {
        provider: process.env.STT_PROVIDER || 'openai',
        apiKey: process.env.STT_API_KEY ? '****' : '',
        status: process.env.STT_API_KEY ? 'connected' : 'not_configured'
      },
      tts: {
        provider: process.env.TTS_PROVIDER || 'elevenlabs',
        apiKey: process.env.TTS_API_KEY ? '****' : '',
        voiceModel: process.env.TTS_VOICE_MODEL || 'rachel',
        status: process.env.TTS_API_KEY ? 'connected' : 'not_configured'
      },
      llm: {
        provider: process.env.LLM_PROVIDER || 'openai',
        apiKey: process.env.LLM_API_KEY ? '****' : '',
        model: process.env.LLM_MODEL || 'gpt-4-turbo',
        temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
        status: process.env.LLM_API_KEY ? 'connected' : 'not_configured'
      },
      general: {
        maxInterviews: parseInt(process.env.MAX_INTERVIEWS_PER_USER || '50'),
        defaultDuration: parseInt(process.env.DEFAULT_INTERVIEW_DURATION || '45'),
        companyName: process.env.COMPANY_NAME || 'AI Interview Platform',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@aiinterview.com'
      }
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching AI interview settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin permissions
    const { isAdmin, user, error } = await checkAdminAccess(request)
    if (error || !user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { section, settings } = body

    // Validate the input
    if (!section || !settings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Validate the settings based on the section
    // 2. Store the settings in a secure way (database or encrypted config)
    // 3. Update environment variables or configuration
    // 4. Restart services if needed

    // For now, we'll just simulate saving
    console.log(`Saving ${section} settings:`, settings)

    // Mock response
    return NextResponse.json({ 
      success: true, 
      message: `${section} settings saved successfully` 
    })
  } catch (error) {
    console.error('Error saving AI interview settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin permissions
    const { isAdmin, user, error } = await checkAdminAccess(request)
    if (error || !user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { service, action } = body

    // Handle service testing
    if (action === 'test') {
      // In a real implementation, you would:
      // 1. Get the current API keys for the service
      // 2. Make a test call to the service
      // 3. Return the connection status

      // Mock test response
      const delay = Math.random() * 2000 + 1000 // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, delay))

      const success = Math.random() > 0.2 // 80% success rate for demo
      
      if (success) {
        return NextResponse.json({
          success: true,
          status: 'connected',
          message: `${service.toUpperCase()} service is working properly`
        })
      } else {
        return NextResponse.json({
          success: false,
          status: 'error',
          message: `Failed to connect to ${service.toUpperCase()} service`
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error testing AI interview service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 