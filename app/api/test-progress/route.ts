import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForAPI } from '@/lib/supabase/server'

// Test endpoint to simulate progress creation without authentication
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    
    // Test what happens when we try to create progress without authentication
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy user ID
      mba_school_id: '40f5dca4-1e3d-4b56-be88-31c1670866b8', // Valid school ID from diagnostic
      application_status: 'not_started',
      notes: 'Test application'
    }

    console.log('Testing application progress creation with data:', testData)

    const { data, error } = await supabase
      .from('user_application_progress')
      .insert(testData)
      .select()
      .single()

    if (error) {
      console.log('Test creation error:', error)
      console.log('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Test creation failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      })
    }

    return NextResponse.json({ 
      success: true,
      data,
      message: 'Test creation succeeded'
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
