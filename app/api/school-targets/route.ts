import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClientForAPI } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's school targets with school information
    const { data: targets, error } = await supabase
      .from('user_school_targets')
      .select(`
        *,
        mba_schools:school_id (
          id,
          name,
          location,
          ranking_tier,
          difficulty_level,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          avg_starting_salary,
          tuition_total,
          class_size,
          acceptance_rate,
          website_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching school targets:', error)
      return NextResponse.json({ error: "Failed to fetch school targets" }, { status: 500 })
    }

    // Transform the data to flatten school information
    const transformedTargets = targets?.map(target => ({
      id: target.id,
      school_id: target.school_id,
      school_name: target.mba_schools?.name,
      location: target.mba_schools?.location,
      ranking_tier: target.mba_schools?.ranking_tier,
      target_category: target.target_category,
      program_of_interest: target.program_of_interest,
      application_round: target.application_round,
      notes: target.notes,
      priority_score: target.priority_score,
      qs_mba_rank: target.mba_schools?.qs_mba_rank,
      ft_global_mba_rank: target.mba_schools?.ft_global_mba_rank,
      bloomberg_mba_rank: target.mba_schools?.bloomberg_mba_rank,
      mean_gmat: target.mba_schools?.mean_gmat,
      avg_starting_salary: target.mba_schools?.avg_starting_salary,
      tuition_total: target.mba_schools?.tuition_total
    })) || []

    return NextResponse.json({ targets: transformedTargets })
  } catch (error) {
    console.error('Unexpected error in GET /api/school-targets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      school_id,
      target_category,
      program_of_interest,
      application_round,
      notes,
      priority_score
    } = body

    // Validate required fields
    if (!school_id || !target_category) {
      return NextResponse.json(
        { error: "school_id and target_category are required" }, 
        { status: 400 }
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
        priority_score: priority_score || 5
      })
      .select(`
        *,
        mba_schools:school_id (
          name,
          location,
          ranking_tier,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          avg_starting_salary,
          tuition_total
        )
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: "You have already added this school as a target" }, 
          { status: 409 }
        )
      }
      console.error('Error creating school target:', error)
      return NextResponse.json({ error: "Failed to create school target" }, { status: 500 })
    }

    // Transform the response
    const transformedTarget = {
      id: newTarget.id,
      school_id: newTarget.school_id,
      school_name: newTarget.mba_schools?.name,
      location: newTarget.mba_schools?.location,
      ranking_tier: newTarget.mba_schools?.ranking_tier,
      target_category: newTarget.target_category,
      program_of_interest: newTarget.program_of_interest,
      application_round: newTarget.application_round,
      notes: newTarget.notes,
      priority_score: newTarget.priority_score,
      qs_mba_rank: newTarget.mba_schools?.qs_mba_rank,
      ft_global_mba_rank: newTarget.mba_schools?.ft_global_mba_rank,
      bloomberg_mba_rank: newTarget.mba_schools?.bloomberg_mba_rank,
      mean_gmat: newTarget.mba_schools?.mean_gmat,
      avg_starting_salary: newTarget.mba_schools?.avg_starting_salary,
      tuition_total: newTarget.mba_schools?.tuition_total
    }

    return NextResponse.json({ target: transformedTarget }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/school-targets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClientForAPI(request)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
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
        priority_score
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own targets
      .select(`
        *,
        mba_schools:school_id (
          name,
          location,
          ranking_tier,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          avg_starting_salary,
          tuition_total
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

    // Transform the response
    const transformedTarget = {
      id: updatedTarget.id,
      school_id: updatedTarget.school_id,
      school_name: updatedTarget.mba_schools?.name,
      location: updatedTarget.mba_schools?.location,
      ranking_tier: updatedTarget.mba_schools?.ranking_tier,
      target_category: updatedTarget.target_category,
      program_of_interest: updatedTarget.program_of_interest,
      application_round: updatedTarget.application_round,
      notes: updatedTarget.notes,
      priority_score: updatedTarget.priority_score,
      qs_mba_rank: updatedTarget.mba_schools?.qs_mba_rank,
      ft_global_mba_rank: updatedTarget.mba_schools?.ft_global_mba_rank,
      bloomberg_mba_rank: updatedTarget.mba_schools?.bloomberg_mba_rank,
      mean_gmat: updatedTarget.mba_schools?.mean_gmat,
      avg_starting_salary: updatedTarget.mba_schools?.avg_starting_salary,
      tuition_total: updatedTarget.mba_schools?.tuition_total
    }

    return NextResponse.json({ target: transformedTarget })
  } catch (error) {
    console.error('Unexpected error in PUT /api/school-targets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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