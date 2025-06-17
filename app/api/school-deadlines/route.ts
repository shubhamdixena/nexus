import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/school-deadlines - Get school deadlines from mba_schools table
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

    // Query mba_schools table for deadline information
    const { data: schools, error } = await supabase
      .from('mba_schools')
      .select(`
        id,
        business_school,
        r1_deadline,
        r2_deadline,
        r3_deadline,
        r4_deadline,
        r5_deadline,
        location,
        application_fee
      `)

    if (error) {
      console.error('Error fetching school deadlines:', error)
      return NextResponse.json({ error: 'Failed to fetch school deadlines' }, { status: 500 })
    }

    // Transform the data to extract all deadlines
    const deadlines: any[] = []
    
    schools?.forEach(school => {
      // Add each deadline round that exists
      if (school.r1_deadline) {
        deadlines.push({
          id: `${school.id}-r1`,
          school_id: school.id,
          school_name: school.business_school,
          deadline_date: school.r1_deadline,
          round: 'R1',
          location: school.location,
          application_fee: school.application_fee,
          is_active: true
        })
      }
      
      if (school.r2_deadline) {
        deadlines.push({
          id: `${school.id}-r2`,
          school_id: school.id,
          school_name: school.business_school,
          deadline_date: school.r2_deadline,
          round: 'R2',
          location: school.location,
          application_fee: school.application_fee,
          is_active: true
        })
      }
      
      if (school.r3_deadline) {
        deadlines.push({
          id: `${school.id}-r3`,
          school_id: school.id,
          school_name: school.business_school,
          deadline_date: school.r3_deadline,
          round: 'R3',
          location: school.location,
          application_fee: school.application_fee,
          is_active: true
        })
      }
      
      if (school.r4_deadline) {
        deadlines.push({
          id: `${school.id}-r4`,
          school_id: school.id,
          school_name: school.business_school,
          deadline_date: school.r4_deadline,
          round: 'R4',
          location: school.location,
          application_fee: school.application_fee,
          is_active: true
        })
      }
      
      if (school.r5_deadline) {
        deadlines.push({
          id: `${school.id}-r5`,
          school_id: school.id,
          school_name: school.business_school,
          deadline_date: school.r5_deadline,
          round: 'R5',
          location: school.location,
          application_fee: school.application_fee,
          is_active: true
        })
      }
    })

    // Filter by date range if provided
    let filteredDeadlines = deadlines
    if (start || end) {
      filteredDeadlines = deadlines.filter(deadline => {
        const deadlineDate = new Date(deadline.deadline_date)
        const startDate = start ? new Date(start) : null
        const endDate = end ? new Date(end) : null
        
        if (startDate && deadlineDate < startDate) return false
        if (endDate && deadlineDate > endDate) return false
        
        return true
      })
    }

    // Sort by deadline date
    filteredDeadlines.sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime())

    return NextResponse.json({ deadlines: filteredDeadlines })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 