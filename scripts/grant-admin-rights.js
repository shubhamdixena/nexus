#!/usr/bin/env node

/**
 * Script to grant admin rights to a user in the Nexus application
 * 
 * Usage:
 *   node scripts/grant-admin-rights.js <user-email>
 *   node scripts/grant-admin-rights.js user@example.com
 * 
 * Requirements:
 *   - SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 *   - User must already exist in the system
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create Supabase admin client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function grantAdminRights(userEmail) {
  try {
    console.log(`🔍 Looking up user: ${userEmail}`)
    
    // First, find the user by email in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      throw new Error(`Failed to fetch users: ${authError.message}`)
    }
    
    const authUser = authUsers.users.find(user => user.email === userEmail)
    
    if (!authUser) {
      throw new Error(`User with email "${userEmail}" not found in authentication system`)
    }
    
    console.log(`✅ Found user in auth system: ${authUser.id}`)
    
    // Check if user exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', authUser.id)
      .single()
    
    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Error checking user record: ${userError.message}`)
    }
    
    if (existingUser) {
      // User record exists, update the role
      console.log(`📝 Updating existing user role from "${existingUser.role}" to "admin"`)
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)
        .select()
        .single()
      
      if (updateError) {
        throw new Error(`Failed to update user role: ${updateError.message}`)
      }
      
      console.log(`✅ Successfully updated user role to admin`)
      console.log(`User: ${updatedUser.email || userEmail}`)
      console.log(`Role: ${updatedUser.role}`)
      
    } else {
      // User record doesn't exist, create one with admin role
      console.log(`📝 Creating new user record with admin role`)
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: userEmail,
          name: `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim() || userEmail.split('@')[0],
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        throw new Error(`Failed to create user record: ${insertError.message}`)
      }
      
      console.log(`✅ Successfully created admin user record`)
      console.log(`User: ${newUser.email}`)
      console.log(`Role: ${newUser.role}`)
    }
    
    // Also ensure profile exists (profiles table is separate)
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', authUser.id)
      .single()
    
    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      console.log(`📝 Creating user profile record`)
      
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: userEmail,
          first_name: authUser.user_metadata?.first_name || null,
          last_name: authUser.user_metadata?.last_name || null,
          profile_completed: false,
          profile_completion_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileInsertError) {
        console.warn(`⚠️  Warning: Failed to create profile: ${profileInsertError.message}`)
      } else {
        console.log(`✅ Successfully created user profile`)
      }
    }
    
    // Also update user metadata for additional security
    console.log(`🔧 Updating user metadata...`)
    
    const { data: updatedAuthUser, error: metadataError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      {
        user_metadata: {
          ...authUser.user_metadata,
          role: 'admin'
        }
      }
    )
    
    if (metadataError) {
      console.warn(`⚠️  Warning: Failed to update user metadata: ${metadataError.message}`)
      console.warn(`The profile role has been updated, but user metadata update failed.`)
    } else {
      console.log(`✅ Successfully updated user metadata`)
    }
    
    console.log(`\n🎉 Admin rights granted successfully!`)
    console.log(`\nThe user ${userEmail} now has admin access and can:`)
    console.log(`- Access the admin panel`)
    console.log(`- Manage users, schools, MBA programs, and scholarships`)
    console.log(`- View analytics and system settings`)
    console.log(`\nThe user may need to log out and log back in for changes to take effect.`)
    
  } catch (error) {
    console.error(`❌ Error granting admin rights: ${error.message}`)
    process.exit(1)
  }
}

async function listAdminUsers() {
  try {
    console.log(`📋 Current admin users:`)
    
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('email, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch admin users: ${error.message}`)
    }
    
    if (adminUsers.length === 0) {
      console.log(`No admin users found`)
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (since ${new Date(user.created_at).toLocaleDateString()})`)
      })
    }
    
  } catch (error) {
    console.error(`❌ Error listing admin users: ${error.message}`)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`Usage: node scripts/grant-admin-rights.js <user-email>`)
    console.log(`       node scripts/grant-admin-rights.js --list`)
    console.log(``)
    console.log(`Examples:`)
    console.log(`  node scripts/grant-admin-rights.js user@example.com`)
    console.log(`  node scripts/grant-admin-rights.js --list`)
    process.exit(1)
  }
  
  if (args[0] === '--list' || args[0] === '-l') {
    await listAdminUsers()
    return
  }
  
  const userEmail = args[0]
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userEmail)) {
    console.error(`❌ Error: Invalid email format: ${userEmail}`)
    process.exit(1)
  }
  
  console.log(`🚀 Granting admin rights to: ${userEmail}`)
  console.log(`⏳ This may take a moment...`)
  console.log(``)
  
  await grantAdminRights(userEmail)
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log(`\n⛔ Operation cancelled by user`)
  process.exit(0)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the script
main().catch(console.error)