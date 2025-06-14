import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    // Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        code: "UNAUTHORIZED" 
      }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const isAdmin = user.user_metadata?.role === 'admin' || 
                   user.user_metadata?.role === 'super_admin' ||
                   profile?.role === 'admin' ||
                   profile?.role === 'super_admin'

    if (!isAdmin) {
      return NextResponse.json({ 
        error: "Forbidden - Admin access required", 
        code: "FORBIDDEN" 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")
    const type = searchParams.get("type") || "overview"

    switch (type) {
      case "overview":
        return await getOverviewAnalytics(supabase, days)
      case "user-activity":
        return await getUserActivityAnalytics(supabase, days)
      case "popular-actions":
        return await getPopularActionsAnalytics(supabase, days)
      case "user-engagement":
        return await getUserEngagementAnalytics(supabase, days)
      default:
        return await getOverviewAnalytics(supabase, days)
    }

  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

async function getOverviewAnalytics(supabase: any, days: number) {
  try {
    // Get general analytics using our database function
    const { data: analytics, error: analyticsError } = await supabase
      .rpc('get_activity_analytics', { p_days: days })

    if (analyticsError) {
      console.error("Analytics function error:", analyticsError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch analytics",
        error: analyticsError.message
      }, { status: 500 })
    }

    // Get user count
    const { count: totalUsers, error: userCountError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    // Get active users (users who have activity in the last 7 days)
    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('user_activity_logs')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Get new users (registered in the last 30 days)
    const { count: newUsers, error: newUsersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const result = analytics?.[0] || {}
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          newUsers: newUsers || 0,
          totalActivities: result.total_activities || 0,
          dailyAverage: result.daily_average || 0,
          engagementRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
        },
        topActions: result.top_actions || [],
        topResources: result.top_resources || [],
        hourlyDistribution: result.hourly_distribution || [],
        period: `${days} days`
      }
    })

  } catch (error) {
    console.error("Overview analytics error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch overview analytics"
    }, { status: 500 })
  }
}

async function getUserActivityAnalytics(supabase: any, days: number) {
  try {
    // Get daily activity trends
    const { data: dailyTrends, error: dailyError } = await supabase
      .from('user_activity_logs')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

    // Process daily trends
    const dailyData = dailyTrends?.reduce((acc: any, log: any) => {
      const date = new Date(log.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}) || {}

    const dailyTrendsArray = Object.entries(dailyData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Get most active users
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('user_activity_logs')
      .select('user_id, user_name')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

    const userActivity = activeUsers?.reduce((acc: any, log: any) => {
      const key = `${log.user_id}:${log.user_name}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {}) || {}

    const topUsers = Object.entries(userActivity)
      .map(([userKey, count]) => {
        const [user_id, user_name] = userKey.split(':')
        return { user_id, user_name, activity_count: count }
      })
      .sort((a: any, b: any) => b.activity_count - a.activity_count)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        dailyTrends: dailyTrendsArray,
        topUsers,
        period: `${days} days`
      }
    })

  } catch (error) {
    console.error("User activity analytics error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch user activity analytics"
    }, { status: 500 })
  }
}

async function getPopularActionsAnalytics(supabase: any, days: number) {
  try {
    // Get action distribution
    const { data: actions, error: actionsError } = await supabase
      .from('user_activity_logs')
      .select('action, resource')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

    const actionCounts = actions?.reduce((acc: any, log: any) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {}) || {}

    const resourceCounts = actions?.reduce((acc: any, log: any) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1
      return acc
    }, {}) || {}

    const actionDistribution = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a: any, b: any) => b.count - a.count)

    const resourceDistribution = Object.entries(resourceCounts)
      .map(([resource, count]) => ({ resource, count }))
      .sort((a: any, b: any) => b.count - a.count)

    return NextResponse.json({
      success: true,
      data: {
        actionDistribution,
        resourceDistribution,
        period: `${days} days`
      }
    })

  } catch (error) {
    console.error("Popular actions analytics error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch popular actions analytics"
    }, { status: 500 })
  }
}

async function getUserEngagementAnalytics(supabase: any, days: number) {
  try {
    // Get user engagement metrics
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, created_at')

    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_logs')
      .select('user_id, created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

    // Calculate engagement metrics
    const userEngagement = users?.map((user: any) => {
      const userActivities = activities?.filter((activity: any) => activity.user_id === user.id) || []
      const daysSinceRegistration = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        user_id: user.id,
        activities_count: userActivities.length,
        days_since_registration: daysSinceRegistration,
        avg_activities_per_day: daysSinceRegistration > 0 ? (userActivities.length / daysSinceRegistration).toFixed(2) : 0
      }
    }) || []

    // Categorize users by engagement level
    const engagementLevels = {
      high: userEngagement.filter((u: any) => u.activities_count > 50).length,
      medium: userEngagement.filter((u: any) => u.activities_count > 10 && u.activities_count <= 50).length,
      low: userEngagement.filter((u: any) => u.activities_count > 0 && u.activities_count <= 10).length,
      inactive: userEngagement.filter((u: any) => u.activities_count === 0).length
    }

    return NextResponse.json({
      success: true,
      data: {
        engagementLevels,
        totalUsers: userEngagement.length,
        period: `${days} days`
      }
    })

  } catch (error) {
    console.error("User engagement analytics error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch user engagement analytics"
    }, { status: 500 })
  }
}

// Helper function to get user analytics summary for a specific user
