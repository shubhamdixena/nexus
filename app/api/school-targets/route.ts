import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClientForAPI } from "@/lib/supabase/server"
import { 
  CreateSchoolTargetRequest, 
  UpdateSchoolTargetRequest,
  SchoolTarget,
  SchoolTargetsResponse,
  SchoolTargetResponse 
} from "@/types/school-targets"

/**
 * Enhanced School Targets API Route
 * 
 * Provides comprehensive CRUD operations for school targets with proper typing,
 * optimized queries, and computed fields for UI consumption.
 */

// Helper function to compute ranking tier
function computeRankingTier(rank?: number): 'top-10' | 'top-25' | 'top-50' | 'top-100' | 'unranked' {
  if (!rank) return 'unranked'
  if (rank <= 10) return 'top-10'
  if (rank <= 25) return 'top-25'
  if (rank <= 50) return 'top-50'
  if (rank <= 100) return 'top-100'
  return 'unranked'
}

// Helper function to compute deadline based on application round and school deadlines
function computeDeadline(applicationRound?: string, schoolDeadlines?: any): string | undefined {
  if (!applicationRound || !schoolDeadlines) return undefined
  
  const roundMap: Record<string, string> = {
    'R1': schoolDeadlines.r1_deadline,
    'R2': schoolDeadlines.r2_deadline,
    'R3': schoolDeadlines.r3_deadline,
    'Round 1': schoolDeadlines.r1_deadline,
    'Round 2': schoolDeadlines.r2_deadline,
    'Round 3': schoolDeadlines.r3_deadline,
  }
  
  return roundMap[applicationRound]
}

// Helper function to compute days until deadline
function computeDaysUntilDeadline(deadline?: string): number | undefined {
  if (!deadline) return undefined
  
  const deadlineDate = new Date(deadline)
  const today = new Date()
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

// Transform database result to SchoolTarget
function transformToSchoolTarget(dbResult: any): SchoolTarget {
  const school = dbResult.mba_schools
  const deadline = computeDeadline(dbResult.application_round, school)
  
  return {
    // From user_school_targets
    id: dbResult.id,
    school_id: dbResult.school_id,
    target_category: dbResult.target_category,
    program_of_interest: dbResult.program_of_interest,
    application_round: dbResult.application_round,
    notes: dbResult.notes,
    priority_score: dbResult.priority_score,
    created_at: dbResult.created_at,
    updated_at: dbResult.updated_at,
    
    // From mba_schools (joined data)
    school_name: school?.business_school || 'Unknown School',
    location: school?.location || 'Unknown Location',
    country: school?.country,
    website: school?.website,
    qs_mba_rank: school?.qs_mba_rank,
    ft_global_mba_rank: school?.ft_global_mba_rank,
    bloomberg_mba_rank: school?.bloomberg_mba_rank,
    mean_gmat: school?.mean_gmat,
    mean_gpa: school?.mean_gpa,
    avg_starting_salary: school?.avg_starting_salary,
    tuition_total: school?.tuition_total,
    class_size: school?.class_size,
    
    // Computed fields
    ranking_tier: computeRankingTier(school?.qs_mba_rank),
    deadline,
    days_until_deadline: computeDaysUntilDeadline(deadline),
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<SchoolTargetsResponse | { error: string }>> {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url)
    const category = searchParams.getAll('category')
    const ranking_tier = searchParams.getAll('ranking_tier')
    const application_round = searchParams.getAll('application_round')
    const priority_min = searchParams.get('priority_min')
    const priority_max = searchParams.get('priority_max')

    // Build the query
    let query = supabase
      .from('user_school_targets')
      .select(`
        *,
        mba_schools:school_id (
          id,
          business_school,
          location,
          country,
          website,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          mean_gpa,
          avg_starting_salary,
          tuition_total,
          class_size,
          r1_deadline,
          r2_deadline,
          r3_deadline,
          application_deadlines
        )
      `)
      .eq('user_id', user.id)

    // Apply filters
    if (category.length > 0) {
      query = query.in('target_category', category)
    }
    if (application_round.length > 0) {
      query = query.in('application_round', application_round)
    }
    if (priority_min) {
      query = query.gte('priority_score', parseInt(priority_min))
    }
    if (priority_max) {
      query = query.lte('priority_score', parseInt(priority_max))
    }

    // Execute query
    const { data: targets, error, count } = await query
      .order('priority_score', { ascending: false })

    if (error) {
      console.error('Error fetching school targets:', error)
      return NextResponse.json({ error: "Failed to fetch school targets" }, { status: 500 })
    }

    // Transform the data
    const transformedTargets = (targets || []).map(transformToSchoolTarget)

    // Apply ranking tier filter (post-processing since it's computed)
    const filteredTargets = ranking_tier.length > 0
      ? transformedTargets.filter(target => ranking_tier.includes(target.ranking_tier))
      : transformedTargets

    return NextResponse.json({ 
      targets: filteredTargets,
      total_count: filteredTargets.length
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/school-targets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<SchoolTargetResponse | { error: string; details?: string }>> {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: CreateSchoolTargetRequest = await request.json()
    const {
      school_id,
      target_category = 'target',
      program_of_interest,
      application_round,
      notes,
      priority_score = 5
    } = body

    // Validate required fields
    if (!school_id) {
      return NextResponse.json(
        { error: "school_id is required" }, 
        { status: 400 }
      )
    }

    // Verify the school exists
    const { data: schoolExists, error: schoolCheckError } = await supabase
      .from('mba_schools')
      .select('id')
      .eq('id', school_id)
      .maybeSingle()

    if (schoolCheckError) {
      console.error('Error checking if school exists:', schoolCheckError)
      return NextResponse.json(
        { error: 'A server error occurred while checking for the school.' },
        { status: 500 }
      )
    }

    if (!schoolExists) {
      return NextResponse.json(
        { error: `School with ID ${school_id} not found.` },
        { status: 404 }
      )
    }

    // Check for duplicates
    const { data: existing } = await supabase
      .from('user_school_targets')
      .select('id')
      .eq('user_id', user.id)
      .eq('school_id', school_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "You have already added this school as a target." }, 
        { status: 409 }
      )
    }

    // Insert new school target
    const { data: newTarget, error } = await supabase
      .from('user_school_targets')
      .insert({
        user_id: user.id,
        school_id,
        target_category,
        program_of_interest,
        application_round,
        notes,
        priority_score
      })
      .select(`
        *,
        mba_schools:school_id (
          id,
          business_school,
          location,
          country,
          website,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          mean_gpa,
          avg_starting_salary,
          tuition_total,
          class_size,
          r1_deadline,
          r2_deadline,
          r3_deadline,
          application_deadlines
        )
      `)
      .single()

    if (error) {
      console.error('Error creating school target:', error)
      return NextResponse.json({ 
        error: "Failed to create school target.", 
        details: error.message 
      }, { status: 500 })
    }

    // Transform and return the new target
    const transformedTarget = transformToSchoolTarget(newTarget)

    return NextResponse.json({ target: transformedTarget }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/school-targets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<SchoolTargetResponse | { error: string }>> {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: UpdateSchoolTargetRequest = await request.json()
    const {
      id,
      target_category,
      program_of_interest,
      application_round,
      notes,
      priority_score
    } = body

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: "Target ID is required" }, { status: 400 })
    }

    // Update the school target (only allow user to update their own targets)
    const { data: updatedTarget, error } = await supabase
      .from('user_school_targets')
      .update({
        target_category,
        program_of_interest,
        application_round,
        notes,
        priority_score,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own targets
      .select(`
        *,
        mba_schools:school_id (
          id,
          business_school,
          location,
          country,
          website,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          mean_gpa,
          avg_starting_salary,
          tuition_total,
          class_size,
          r1_deadline,
          r2_deadline,
          r3_deadline,
          application_deadlines
        )
      `)
      .single()

    if (error) {
      console.error('Error updating school target:', error)
      return NextResponse.json({ error: "Failed to update school target" }, { status: 500 })
    }

    if (!updatedTarget) {
      return NextResponse.json({ error: "Target not found or unauthorized" }, { status: 404 })
    }

    // Transform and return the updated target
    const transformedTarget = transformToSchoolTarget(updatedTarget)

    return NextResponse.json({ target: transformedTarget })
  } catch (error) {
    console.error('Unexpected error in PUT /api/school-targets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('id')

    if (!targetId) {
      return NextResponse.json({ error: "Target ID is required" }, { status: 400 })
    }

    // Delete the school target (only allow user to delete their own targets)
    const { error } = await supabase
      .from('user_school_targets')
      .delete()
      .eq('id', targetId)
      .eq('user_id', user.id) // Ensure user can only delete their own targets

    if (error) {
      console.error('Error deleting school target:', error)
      return NextResponse.json({ error: "Failed to delete school target" }, { status: 500 })
    }

    return NextResponse.json({ message: "School target deleted successfully" })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/school-targets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
