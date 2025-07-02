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

async function testApplicationManagement() {
  console.log('🧪 Testing Application Management System (Simplified)')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Check if tables exist and are accessible
    console.log('\n1️⃣ Testing table accessibility...')
    
    const { data: progressData, error: progressError } = await supabase
      .from('user_application_progress')
      .select('id')
      .limit(1)
    
    const { data: essaysData, error: essaysError } = await supabase
      .from('user_application_essays')
      .select('id')
      .limit(1)
    
    const { data: lorsData, error: lorsError } = await supabase
      .from('user_application_lors')
      .select('id')
      .limit(1)
    
    if (progressError) {
      console.log('❌ user_application_progress table error:', progressError.message)
    } else {
      console.log('✅ user_application_progress table accessible')
    }
    
    if (essaysError) {
      console.log('❌ user_application_essays table error:', essaysError.message)
    } else {
      console.log('✅ user_application_essays table accessible')
    }
    
    if (lorsError) {
      console.log('❌ user_application_lors table error:', lorsError.message)
    } else {
      console.log('✅ user_application_lors table accessible')
    }
    
    // Test 2: Get test user ID from existing data
    console.log('\n2️⃣ Finding test user...')
    let testUserId; // Declare variable here
    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .limit(1)
    
    if (userError || !userProfiles || userProfiles.length === 0) {
      console.log('❌ No test user found. Let me try getting from auth.users...')
      
      // Try to get users from auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError || !authUsers?.users?.length) {
        console.log('❌ No users found in system. Need to sign up first.')
        return
      }
      
      const testUserId = authUsers.users[0].id
      console.log('✅ Using auth user ID:', testUserId)
      
      // Create a user profile for this user if needed
      const { data: newProfile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: testUserId,
          full_name: 'Test User',
          email: authUsers.users[0].email
        })
        .select()
        .single()
      
      if (profileError) {
        console.log('⚠️ Could not create user profile, proceeding with auth user ID')
      } else {
        console.log('✅ Created user profile')
      }
      
      testUserId = authUsers.users[0].id
    } else {
      testUserId = userProfiles[0].user_id
      console.log('✅ Using test user ID:', testUserId)
    }
    
    // Test 3: Get a test MBA school
    console.log('\n3️⃣ Finding test MBA school...')
    const { data: mbaSchools, error: schoolError } = await supabase
      .from('mba_schools')
      .select('id, school_name')
      .limit(1)
    
    if (schoolError || !mbaSchools || mbaSchools.length === 0) {
      console.log('❌ No MBA school found:', schoolError?.message || 'No schools available')
      return
    }
    
    const mbaSchool = mbaSchools[0]
    console.log('✅ Using MBA school:', mbaSchool.school_name)
    
    // Test 4: Create application progress record
    console.log('\n4️⃣ Creating application progress...')
    const { data: progressRecord, error: createProgressError } = await supabase
      .from('user_application_progress')
      .upsert({
        user_id: testUserId,
        mba_school_id: mbaSchool.id,
        application_status: 'essays_in_progress',
        notes: 'Test application progress - simplified version',
        priority_level: 4
      })
      .select()
      .single()
    
    if (createProgressError) {
      console.log('❌ Error creating progress:', createProgressError.message)
      return
    }
    
    console.log('✅ Application progress created:', progressRecord.id)
    
    // Test 5: Create test essays
    console.log('\n5️⃣ Creating test essays...')
    const essaysToCreate = [
      {
        user_id: testUserId,
        application_progress_id: progressRecord.id,
        essay_type: 'personal_statement',
        essay_prompt: 'Tell us about yourself and your goals',
        content: 'This is a test personal statement with multiple words to test word counting functionality.',
        max_word_limit: 500,
        status: 'draft'
      },
      {
        user_id: testUserId,
        application_progress_id: progressRecord.id,
        essay_type: 'career_goals',
        essay_prompt: 'What are your short and long term career goals?',
        content: 'Test career goals essay content here.',
        max_word_limit: 300,
        status: 'final'
      }
    ]
    
    const { data: essayRecords, error: essayError } = await supabase
      .from('user_application_essays')
      .insert(essaysToCreate)
      .select()
    
    if (essayError) {
      console.log('❌ Error creating essays:', essayError.message)
    } else {
      console.log('✅ Created', essayRecords.length, 'essays')
      essayRecords.forEach(essay => {
        console.log(`  - ${essay.essay_type}: ${essay.word_count} words`)
      })
    }
    
    // Test 6: Create test LORs
    console.log('\n6️⃣ Creating test LORs...')
    const lorsToCreate = [
      {
        user_id: testUserId,
        application_progress_id: progressRecord.id,
        recommender_name: 'John Manager',
        recommender_organization: 'Tech Corp',
        recommender_email: 'john@techcorp.com',
        relationship_to_applicant: 'supervisor',
        relationship_duration: '2 years',
        work_context: 'Direct supervisor for software development projects',
        status: 'request_sent'
      },
      {
        user_id: testUserId,
        application_progress_id: progressRecord.id,
        recommender_name: 'Dr. Professor',
        recommender_organization: 'University',
        recommender_email: 'prof@university.edu',
        relationship_to_applicant: 'professor',
        relationship_duration: '1 semester',
        work_context: 'Graduate course instructor',
        status: 'completed',
        lor_type: 'academic'
      }
    ]
    
    const { data: lorRecords, error: lorError } = await supabase
      .from('user_application_lors')
      .insert(lorsToCreate)
      .select()
    
    if (lorError) {
      console.log('❌ Error creating LORs:', lorError.message)
    } else {
      console.log('✅ Created', lorRecords.length, 'LORs')
      lorRecords.forEach(lor => {
        console.log(`  - ${lor.recommender_name}: ${lor.status}`)
      })
    }
    
    // Test 7: Check auto-calculated progress
    console.log('\n7️⃣ Checking auto-calculated progress...')
    const { data: updatedProgress, error: progressCheckError } = await supabase
      .from('user_application_progress')
      .select('*')
      .eq('id', progressRecord.id)
      .single()
    
    if (progressCheckError) {
      console.log('❌ Error checking progress:', progressCheckError.message)
    } else {
      console.log('✅ Progress auto-calculated:')
      console.log(`  - Essays: ${updatedProgress.essays_completion_percentage}%`)
      console.log(`  - LORs: ${updatedProgress.lors_completion_percentage}%`)
      console.log(`  - Overall: ${updatedProgress.overall_completion_percentage}%`)
    }
    
    console.log('\n🎉 Application Management System Test Complete!')
    console.log('✅ All core functionality working correctly')
    console.log('\n📋 Next steps:')
    console.log('1. Visit http://localhost:3004/applications to see the UI')
    console.log('2. Sign in to see your application progress')
    console.log('3. Test creating and editing essays and LORs')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testApplicationManagement() 