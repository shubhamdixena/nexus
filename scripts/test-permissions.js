#!/usr/bin/env node

/**
 * Quick script to test current user permissions
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testUserPermissions(email) {
  console.log(`🔍 Testing permissions for: ${email}`)
  
  try {
    // Check auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw new Error(`Auth error: ${authError.message}`)
    
    const authUser = authUsers.users.find(user => user.email === email)
    if (!authUser) {
      console.log(`❌ User not found in auth system`)
      return
    }
    
    console.log(`✅ Found in auth system`)
    console.log(`   User ID: ${authUser.id}`)
    console.log(`   Metadata role: ${authUser.user_metadata?.role || 'none'}`)
    
    // Check users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (userError) {
      console.log(`⚠️  Not found in users table: ${userError.message}`)
    } else {
      console.log(`✅ Found in users table`)
      console.log(`   Database role: ${userData.role}`)
      console.log(`   Status: ${userData.status}`)
    }
    
    // Check profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (profileError) {
      console.log(`⚠️  Not found in profiles table: ${profileError.message}`)
    } else {
      console.log(`✅ Found in profiles table`)
      console.log(`   Email: ${profileData.email}`)
      console.log(`   Name: ${profileData.first_name} ${profileData.last_name}`)
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
  }
}

// Test the specific user
testUserPermissions('shubhamdixena@gmail.com').catch(console.error)