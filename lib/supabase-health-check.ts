/**
 * Comprehensive Supabase Health Check Utility
 * Run this to diagnose and fix Supabase issues
 */

import { createClient, createServiceRoleClient, testSupabaseConnection } from './supabaseClient'

export interface HealthCheckResult {
  overall: 'healthy' | 'warning' | 'critical'
  checks: {
    environment: boolean
    clientCreation: boolean
    databaseConnection: boolean
    authentication: boolean
    realtime: boolean
    storage: boolean
  }
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

export async function runSupabaseHealthCheck(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    overall: 'healthy',
    checks: {
      environment: false,
      clientCreation: false,
      databaseConnection: false,
      authentication: false,
      realtime: false,
      storage: false
    },
    errors: [],
    warnings: [],
    recommendations: []
  }

  console.log('🏥 Running Supabase Health Check...')

  // 1. Simple Environment Check
  try {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    result.checks.environment = hasUrl && hasAnonKey
    
    if (!hasUrl) result.errors.push('Missing NEXT_PUBLIC_SUPABASE_URL')
    if (!hasAnonKey) result.errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  } catch (error) {
    result.checks.environment = false
    result.errors.push(`Environment check failed: ${error}`)
  }

  // 2. Client Creation
  try {
    const client = createClient()
    result.checks.clientCreation = true
  } catch (error) {
    result.checks.clientCreation = false
    result.errors.push(`Client creation failed: ${error}`)
    result.recommendations.push('Verify Supabase URL and anon key format')
  }

  // 3. Database Connection
  try {
    const connectionTest = await testSupabaseConnection()
    result.checks.databaseConnection = connectionTest.success
    
    if (!connectionTest.success) {
      result.errors.push(`Database connection failed: ${connectionTest.error}`)
      result.recommendations.push('Check if your Supabase project is active and the profiles table exists')
    }
  } catch (error) {
    result.checks.databaseConnection = false
    result.errors.push(`Database test error: ${error}`)
  }

  // 4. Authentication Check
  try {
    const client = createClient()
    const { data: { user }, error } = await client.auth.getUser()
    
    if (error) {
      result.warnings.push(`Auth user check warning: ${error.message}`)
    } else {
      result.checks.authentication = true
      if (!user) {
        result.warnings.push('No active user session (this is normal if not logged in)')
      }
    }
  } catch (error) {
    result.checks.authentication = false
    result.errors.push(`Authentication check failed: ${error}`)
    result.recommendations.push('Verify auth configuration and RLS policies')
  }

  // 5. Realtime Check
  try {
    const client = createClient()
    const channel = client.channel('health-check')
    
    // Test channel creation (doesn't actually connect)
    result.checks.realtime = true
    channel.unsubscribe()
  } catch (error) {
    result.checks.realtime = false
    result.warnings.push(`Realtime check warning: ${error}`)
    result.recommendations.push('Realtime may not be properly configured')
  }

  // 6. Storage Check (basic)
  try {
    const client = createClient()
    const { data: buckets, error } = await client.storage.listBuckets()
    
    if (error) {
      result.warnings.push(`Storage check warning: ${error.message}`)
    } else {
      result.checks.storage = true
      if (buckets.length === 0) {
        result.warnings.push('No storage buckets found (create if needed)')
      }
    }
  } catch (error) {
    result.checks.storage = false
    result.warnings.push(`Storage check failed: ${error}`)
  }

  // Determine overall health
  const criticalChecks: (keyof typeof result.checks)[] = ['environment', 'clientCreation', 'databaseConnection']
  const hasCriticalFailures = criticalChecks.some(check => !result.checks[check])
  
  if (hasCriticalFailures) {
    result.overall = 'critical'
    result.recommendations.push('Fix critical issues before proceeding with development')
  } else if (result.errors.length > 0 || result.warnings.length > 2) {
    result.overall = 'warning'
    result.recommendations.push('Address warnings to ensure optimal performance')
  }

  return result
}

export function printHealthCheckReport(result: HealthCheckResult): void {
  console.log('\n📊 SUPABASE HEALTH CHECK REPORT')
  console.log('================================')
  
  // Overall status
  const statusEmoji = {
    healthy: '✅',
    warning: '⚠️',
    critical: '❌'
  }
  
  console.log(`Overall Status: ${statusEmoji[result.overall]} ${result.overall.toUpperCase()}`)
  console.log('')
  
  // Individual checks
  console.log('Individual Checks:')
  Object.entries(result.checks).forEach(([check, passed]) => {
    const emoji = passed ? '✅' : '❌'
    const name = check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    console.log(`  ${emoji} ${name}`)
  })
  
  // Errors
  if (result.errors.length > 0) {
    console.log('\n❌ Critical Issues:')
    result.errors.forEach(error => console.log(`  • ${error}`))
  }
  
  // Warnings
  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:')
    result.warnings.forEach(warning => console.log(`  • ${warning}`))
  }
  
  // Recommendations
  if (result.recommendations.length > 0) {
    console.log('\n💡 Recommendations:')
    result.recommendations.forEach(rec => console.log(`  • ${rec}`))
  }
  
  console.log('\n================================')
}