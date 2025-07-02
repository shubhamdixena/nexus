import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForAPI } from '@/lib/supabase/server'

// Diagnostic endpoint to check database schema and sample data
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)

    // Check if mba_schools table has data
    const { data: schoolsCount, error: schoolsError } = await supabase
      .from('mba_schools')
      .select('id', { count: 'exact', head: true })

    if (schoolsError) {
      return NextResponse.json({ 
        error: 'Error accessing mba_schools table',
        details: schoolsError.message 
      })
    }

    // Get a sample school
    const { data: sampleSchool, error: sampleError } = await supabase
      .from('mba_schools')
      .select('id, business_school')
      .limit(1)
      .single()

    // Check user_application_progress table structure
    const { data: progressCount, error: progressError } = await supabase
      .from('user_application_progress')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      mba_schools_count: schoolsCount,
      sample_school: sampleSchool,
      sample_school_error: sampleError?.message,
      progress_table_accessible: !progressError,
      progress_error: progressError?.message,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json({ 
      error: 'Diagnostic check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
