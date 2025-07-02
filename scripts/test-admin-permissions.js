#!/usr/bin/env node

/**
 * Test script to verify admin permissions for system settings
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Import the permission checker (we'll simulate it)
const ROLE_PERMISSIONS = {
  admin: [
    'users:read', 'users:write', 'users:delete',
    'schools:read', 'schools:write', 'schools:delete',
    'applications:read', 'applications:write', 'applications:delete',
    'scholarships:read', 'scholarships:write', 'scholarships:delete',
    'sops:read', 'sops:write', 'sops:delete',
    'admin:access',
    'admin.read', 'admin.write',
    'admin.users.manage', 'admin.users.advanced',
    'admin.schools.manage', 'admin.scholarships.manage',
    'admin.sop.manage',
    'admin.settings.manage'
  ]
}

function hasPermission(userRole, permission) {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testAdminPermissions(email) {
  console.log(`🔍 Testing admin permissions for: ${email}\n`)
  
  try {
    // Get user data
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) throw new Error(`Auth error: ${authError.message}`)
    
    const authUser = authUsers.users.find(user => user.email === email)
    if (!authUser) {
      console.log(`❌ User not found`)
      return
    }
    
    // Check database role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()
    
    const userRole = userData?.role || authUser.user_metadata?.role || 'user'
    
    console.log(`👤 User: ${email}`)
    console.log(`🎭 Role: ${userRole}`)
    console.log(`📧 Email confirmed: ${!!authUser.email_confirmed_at}`)
    console.log()
    
    // Test specific permissions
    const permissionsToTest = [
      'admin:access',
      'admin.read',
      'admin.write', 
      'admin.settings.manage',
      'admin.users.manage',
      'admin.schools.manage'
    ]
    
    console.log('🔐 Permission Check Results:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    permissionsToTest.forEach(permission => {
      const hasAccess = hasPermission(userRole, permission)
      const status = hasAccess ? '✅' : '❌'
      console.log(`${status} ${permission.padEnd(25)} ${hasAccess ? 'GRANTED' : 'DENIED'}`)
    })
    
    console.log()
    
    // Summary
    const canAccessSettings = hasPermission(userRole, 'admin.settings.manage')
    console.log('📊 Summary:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Admin Panel Access: ${hasPermission(userRole, 'admin:access') ? '✅ YES' : '❌ NO'}`)
    console.log(`System Settings Access: ${canAccessSettings ? '✅ YES' : '❌ NO'}`)
    
    if (canAccessSettings) {
      console.log('\n🎉 SUCCESS: Admin can now access System Settings!')
      console.log('💡 Next steps:')
      console.log('   1. Clear browser cache and local storage')
      console.log('   2. Log out and log back in')
      console.log('   3. Navigate to Settings > Admin > System Settings')
    } else {
      console.log('\n⚠️  Issue: Admin still cannot access System Settings')
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
  }
}

// Test the specific user
testAdminPermissions('shubhamdixena@gmail.com').catch(console.error)