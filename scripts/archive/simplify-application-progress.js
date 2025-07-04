const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function simplifyApplicationProgress() {
  console.log('🔄 Simplifying Application Progress System')
  console.log('=' .repeat(50))
  
  try {
    // Check current schema
    console.log('\n1️⃣ Checking current table structure...')
    
    // Test if we can create a simple progress record without application_round
    const { data: schools, error: schoolsError } = await supabase
      .from('mba_schools')
      .select('id, business_school')
      .limit(1)
    
    if (schoolsError || !schools?.length) {
      console.error('❌ No MBA schools found')
      return false
    }
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError || !users.users.length) {
      console.log('⚠️ No users found. You may need to sign up first.')
      return true
    }
    
    const testUser = users.users[0]
    console.log(`✅ Found test user: ${testUser.email}`)
    console.log(`✅ Found test school: ${schools[0].business_school}`)
    
    // Try creating a simplified progress record
    console.log('\n2️⃣ Testing simplified application progress...')
    
    const sampleProgress = {
      user_id: testUser.id,
      mba_school_id: schools[0].id,
      application_status: 'essays_in_progress',
      notes: 'Sample application progress - simplified version',
      priority_level: 4,
      target_deadline: '2025-01-15' // Instead of application_round
    }
    
    // Check if this user already has progress for this school
    const { data: existing, error: existingError } = await supabase
      .from('user_application_progress')
      .select('id')
      .eq('user_id', testUser.id)
      .eq('mba_school_id', schools[0].id)
      .single()
    
    if (existing) {
      console.log('✅ Application progress already exists for this user/school')
      
      // Test creating essays
      console.log('\n3️⃣ Testing essay creation...')
      
      const sampleEssay = {
        user_id: testUser.id,
        application_progress_id: existing.id,
        essay_type: 'goals_essay',
        essay_prompt: 'Describe your short-term and long-term career goals',
        custom_title: 'Career Goals Essay',
        content: 'This is a sample essay about my career goals...',
        max_word_limit: 500,
        is_required: true
      }
      
      const { data: newEssay, error: essayError } = await supabase
        .from('user_application_essays')
        .insert(sampleEssay)
        .select()
        .single()
      
      if (essayError) {
        console.error('❌ Error creating essay:', essayError.message)
        return false
      }
      
      console.log('✅ Successfully created essay')
      
      // Test creating LOR
      console.log('\n4️⃣ Testing LOR creation...')
      
      const sampleLOR = {
        user_id: testUser.id,
        application_progress_id: existing.id,
        recommender_name: 'John Doe',
        recommender_title: 'Senior Manager',
        recommender_organization: 'Tech Corp',
        relationship_to_applicant: 'supervisor',
        status: 'pending_request'
      }
      
      const { data: newLOR, error: lorError } = await supabase
        .from('user_application_lors')
        .insert(sampleLOR)
        .select()
        .single()
      
      if (lorError) {
        console.error('❌ Error creating LOR:', lorError.message)
        return false
      }
      
      console.log('✅ Successfully created LOR')
      
    } else {
      const { data: newProgress, error: createError } = await supabase
        .from('user_application_progress')
        .insert(sampleProgress)
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Error creating progress:', createError.message)
        console.log('Error details:', createError)
        
        // Let's try without application_round field if that was the issue
        if (createError.message.includes('application_round')) {
          console.log('\n🔄 Retrying without application_round field...')
          
          const { application_round, ...progressWithoutRound } = sampleProgress
          
          const { data: retryProgress, error: retryError } = await supabase
            .from('user_application_progress')
            .insert(progressWithoutRound)
            .select()
            .single()
          
          if (retryError) {
            console.error('❌ Retry failed:', retryError.message)
            return false
          }
          
          console.log('✅ Successfully created application progress (without application_round)')
        } else {
          return false
        }
      } else {
        console.log('✅ Successfully created application progress')
      }
    }
    
    console.log('\n🎉 Application Management System is working!')
    console.log('\n💡 Recommendations:')
    console.log('1. Use target_deadline instead of application_round text field')
    console.log('2. Reference application_rounds table for detailed round info')
    console.log('3. The system can work without application_round column')
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

simplifyApplicationProgress().catch(console.error) 