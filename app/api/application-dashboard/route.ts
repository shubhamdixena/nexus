import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForAPI } from '@/lib/supabase/server'
import { ApplicationDashboardData } from '@/types/application-management'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const progressId = searchParams.get('id')
    const includeDetails = searchParams.get('include_details') === 'true'

    // Use the view for efficient data retrieval
    let query = supabase
      .from('application_dashboard_view')
      .select('*')
      .eq('user_id', user.id)

    if (progressId) {
      query = query.eq('progress_id', progressId).single()
    }

    const { data: dashboardData, error: dashboardError } = await query

    if (dashboardError) {
      console.error('Error fetching dashboard data:', dashboardError)
      return NextResponse.json({ error: 'Failed to fetch application dashboard data' }, { status: 500 })
    }

    let responseData = dashboardData

    // If including details, fetch essays and LORs for each application
    if (includeDetails) {
      const applications = Array.isArray(dashboardData) ? dashboardData : [dashboardData]
      
      for (let app of applications) {
        // Fetch essays for this application
        const { data: essays, error: essaysError } = await supabase
          .from('user_application_essays')
          .select('*')
          .eq('application_progress_id', app.progress_id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (essaysError) {
          console.error('Error fetching essays:', essaysError)
        } else {
          app.essays = essays || []
        }

        // Fetch LORs for this application
        const { data: lors, error: lorsError } = await supabase
          .from('user_application_lors')
          .select('*')
          .eq('application_progress_id', app.progress_id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (lorsError) {
          console.error('Error fetching LORs:', lorsError)
        } else {
          app.lors = lors || []
        }
      }
    }

    return NextResponse.json({ 
      data: progressId ? [responseData] : responseData,
      success: true 
    })

  } catch (error) {
    console.error('Application dashboard GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper endpoint for aggregated statistics
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get aggregated statistics
    const { data: progressStats, error: progressError } = await supabase
      .from('user_application_progress')
      .select('application_status, overall_completion_percentage, target_deadline')
      .eq('user_id', user.id)

    if (progressError) {
      console.error('Error fetching progress stats:', progressError)
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
    }

    const { data: essayStats, error: essayError } = await supabase
      .from('user_application_essays')
      .select('status')
      .eq('user_id', user.id)

    if (essayError) {
      console.error('Error fetching essay stats:', essayError)
      return NextResponse.json({ error: 'Failed to fetch essay statistics' }, { status: 500 })
    }

    const { data: lorStats, error: lorError } = await supabase
      .from('user_application_lors')
      .select('status, relationship_to_applicant')
      .eq('user_id', user.id)

    if (lorError) {
      console.error('Error fetching LOR stats:', lorError)
      return NextResponse.json({ error: 'Failed to fetch LOR statistics' }, { status: 500 })
    }

    // Calculate statistics
    const totalApplications = progressStats.length
    const submittedApplications = progressStats.filter(app => 
      ['submitted', 'interview_invited', 'interview_completed', 'decision_pending', 'accepted', 'waitlisted', 'rejected'].includes(app.application_status)
    ).length

    const averageCompletion = totalApplications > 0 
      ? Math.round(progressStats.reduce((sum, app) => sum + app.overall_completion_percentage, 0) / totalApplications)
      : 0

    const upcomingDeadlines = progressStats
      .filter(app => app.target_deadline && new Date(app.target_deadline) > new Date())
      .sort((a, b) => new Date(a.target_deadline!).getTime() - new Date(b.target_deadline!).getTime())
      .slice(0, 5)

    const statusDistribution = progressStats.reduce((acc, app) => {
      acc[app.application_status] = (acc[app.application_status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const essayStatusDistribution = essayStats.reduce((acc, essay) => {
      acc[essay.status] = (acc[essay.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const lorStatusDistribution = lorStats.reduce((acc, lor) => {
      acc[lor.status] = (acc[lor.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statistics = {
      totalApplications,
      submittedApplications,
      averageCompletion,
      upcomingDeadlines,
      statusDistribution,
      essayStatusDistribution,
      lorStatusDistribution,
      totalEssays: essayStats.length,
      totalLors: lorStats.length,
      completedEssays: essayStats.filter(e => ['final', 'submitted'].includes(e.status)).length,
      completedLors: lorStats.filter(l => ['completed', 'submitted_to_school'].includes(l.status)).length,
    }

    return NextResponse.json({ 
      data: statistics,
      success: true 
    })

  } catch (error) {
    console.error('Application dashboard statistics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 