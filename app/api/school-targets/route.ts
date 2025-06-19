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
          business_school,
          location,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          avg_starting_salary,
          tuition_total,
          class_size
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching school targets:', error)
      return NextResponse.json({ error: "Failed to fetch school targets" }, { status: 500 })
    }

    // Transform the data to flatten school information
    const transformedTargets = targets?.map(target => {
      const school = target.mba_schools
      const ranking_tier = school?.qs_mba_rank <= 10 ? 'top-10' : 
                          school?.qs_mba_rank <= 25 ? 'top-25' : 
                          school?.qs_mba_rank <= 50 ? 'top-50' : 
                          school?.qs_mba_rank <= 100 ? 'top-100' : 'unranked'
      
      return {
        id: target.id,
        school_id: target.school_id,
        school_name: school?.business_school,
        location: school?.location,
        ranking_tier,
        program_of_interest: target.program_of_interest,
        application_round: target.application_round,
        notes: target.notes,
        priority_score: target.priority_score,
        target_category: target.target_category,
        qs_mba_rank: school?.qs_mba_rank,
        ft_global_mba_rank: school?.ft_global_mba_rank,
        bloomberg_mba_rank: school?.bloomberg_mba_rank,
        mean_gmat: school?.mean_gmat,
        avg_starting_salary: school?.avg_starting_salary,
        tuition_total: school?.tuition_total
      }
    }) || []

    return NextResponse.json({ targets: transformedTargets })
  } catch (error) {
    console.error('Unexpected error in GET /api/school-targets:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let supabase;
  try {
    supabase = createSupabaseServerClientForAPI(request);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return NextResponse.json(
      { error: "Server configuration error.", details: "Could not initialize Supabase client." },
      { status: 500 }
    );
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      school_id,
      program_of_interest,
      application_round,
      notes,
      priority_score,
      target_category
    } = body

    // Validate required fields
    if (!school_id) {
      return NextResponse.json(
        { error: "school_id is required" }, 
        { status: 400 }
      )
    }

    // First, verify the school exists
    const { data: schoolExists, error: schoolCheckError } = await supabase
      .from('mba_schools')
      .select('id')
      .eq('id', school_id)
      .maybeSingle() // Use maybeSingle to avoid error when no row is found

    if (schoolCheckError) {
      console.error('Error checking if school exists:', schoolCheckError)
      return NextResponse.json(
        { error: 'A server error occurred while checking for the school.' },
        { status: 500 }
      )
    }

    if (!schoolExists) {
      console.error('Attempted to add a target for a non-existent school:', { school_id })
      return NextResponse.json(
        { error: `School with ID ${school_id} not found.` },
        { status: 404 }
      )
    }

    // Insert new school target with all required fields
    const { data: newTarget, error } = await supabase
      .from('user_school_targets')
      .insert({
        user_id: user.id,
        school_id,
        target_category: target_category || 'target', // Default to 'target' if not provided
        program_of_interest,
        application_round,
        notes,
        priority_score: priority_score || 5
      })
      .select(`
        *,
        mba_schools:school_id (
          business_school,
          location,
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
      console.error('Full error object from Supabase:', JSON.stringify(error, null, 2))
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: "You have already added this school as a target." }, 
          { status: 409 }
        )
      }
      if (error.code === '23503') { // Foreign key constraint violation
        return NextResponse.json(
          { error: "Invalid school reference. The school may have been removed." }, 
          { status: 400 }
        )
      }
      return NextResponse.json({ 
        error: "Failed to create school target.", 
        details: error.message 
      }, { status: 500 })
    }

    // Transform the response
    const school = newTarget.mba_schools
    const ranking_tier = school?.qs_mba_rank <= 10 ? 'top-10' : 
                        school?.qs_mba_rank <= 25 ? 'top-25' : 
                        school?.qs_mba_rank <= 50 ? 'top-50' : 
                        school?.qs_mba_rank <= 100 ? 'top-100' : 'unranked'
    
    const transformedTarget = {
      id: newTarget.id,
      school_id: newTarget.school_id,
      school_name: school?.business_school,
      location: school?.location,
      ranking_tier,
      program_of_interest: newTarget.program_of_interest,
      application_round: newTarget.application_round,
      notes: newTarget.notes,
      priority_score: newTarget.priority_score,
      target_category: newTarget.target_category,
      qs_mba_rank: school?.qs_mba_rank,
      ft_global_mba_rank: school?.ft_global_mba_rank,
      bloomberg_mba_rank: school?.bloomberg_mba_rank,
      mean_gmat: school?.mean_gmat,
      avg_starting_salary: school?.avg_starting_salary,
      tuition_total: school?.tuition_total
    }

    return NextResponse.json({ target: transformedTarget }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/school-targets:', error)
    // Check if it's a known error shape
    if (error && typeof error === 'object' && 'message' in error) {
      return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown internal server error occurred." }, { status: 500 });
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
          business_school,
          location,
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
    const school = updatedTarget.mba_schools
    const ranking_tier = school?.qs_mba_rank <= 10 ? 'top-10' : 
                        school?.qs_mba_rank <= 25 ? 'top-25' : 
                        school?.qs_mba_rank <= 50 ? 'top-50' : 
                        school?.qs_mba_rank <= 100 ? 'top-100' : 'unranked'
    
    const transformedTarget = {
      id: updatedTarget.id,
      school_id: updatedTarget.school_id,
      school_name: school?.business_school,
      location: school?.location,
      ranking_tier,
      program_of_interest: updatedTarget.program_of_interest,
      application_round: updatedTarget.application_round,
      notes: updatedTarget.notes,
      priority_score: updatedTarget.priority_score,
      target_category: updatedTarget.target_category,
      qs_mba_rank: school?.qs_mba_rank,
      ft_global_mba_rank: school?.ft_global_mba_rank,
      bloomberg_mba_rank: school?.bloomberg_mba_rank,
      mean_gmat: school?.mean_gmat,
      avg_starting_salary: school?.avg_starting_salary,
      tuition_total: school?.tuition_total
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