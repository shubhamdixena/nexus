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

    // Use the authenticated user's ID instead of accepting it as a parameter
    const userId = user.id

    // Get application statistics
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("status")
      .eq("user_id", userId)

    if (appsError) {
      console.error("Error fetching applications:", appsError)
      return NextResponse.json(
        { success: false, message: "Failed to fetch statistics", errors: [appsError.message] },
        { status: 500 }
      )
    }

    // Get document statistics
    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("type, status")
      .eq("user_id", userId)

    if (docsError) {
      console.error("Error fetching documents:", docsError)
      return NextResponse.json(
        { success: false, message: "Failed to fetch statistics", errors: [docsError.message] },
        { status: 500 }
      )
    }

    // Calculate statistics
    const totalApplications = applications?.length || 0
    const submittedApplications = applications?.filter(app => app.status === "submitted").length || 0
    const acceptedApplications = applications?.filter(app => app.status === "accepted").length || 0
    const rejectedApplications = applications?.filter(app => app.status === "rejected").length || 0
    const pendingApplications = applications?.filter(app => app.status === "pending").length || 0

    const totalDocuments = documents?.length || 0
    const completedDocuments = documents?.filter(doc => doc.status === "completed").length || 0
    const draftDocuments = documents?.filter(doc => doc.status === "draft").length || 0

    const statistics = {
      applications: {
        total: totalApplications,
        submitted: submittedApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
        pending: pendingApplications,
      },
      documents: {
        total: totalDocuments,
        completed: completedDocuments,
        draft: draftDocuments,
      },
      acceptanceRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0,
      completionRate: totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0,
    }

    return NextResponse.json({
      data: statistics,
      success: true,
      message: "Statistics fetched successfully",
    })
  } catch (error) {
    console.error("Dashboard statistics error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}