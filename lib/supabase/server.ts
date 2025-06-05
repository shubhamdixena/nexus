import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
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
}

export function createSupabaseServerClientForAPI(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )
}

export function createSupabaseAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper function to get authenticated user from API routes
export async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createSupabaseServerClientForAPI(request)
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, error: error || new Error('No user found') }
    }
    
    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

// Helper function to check admin access
export async function checkAdminAccess(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request)
    
    if (error || !user) {
      return { isAdmin: false, user: null, error: error || 'No user found' }
    }
    
    // First check the profiles table for role
    const supabase = createSupabaseServerClientForAPI(request)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    // Check admin role from multiple sources (more reliable)
    const isAdmin = 
      profile?.role === 'admin' ||
      user.user_metadata?.role === 'admin' || 
      user.app_metadata?.role === 'admin' ||
      user.email === 'admin@nexus.edu' // fallback for test admin
    
    if (!isAdmin) {
      console.log('Admin access denied for user:', {
        email: user.email,
        profileRole: profile?.role,
        userMetadataRole: user.user_metadata?.role,
        appMetadataRole: user.app_metadata?.role
      })
    }
    
    return { isAdmin, user, error: null }
  } catch (err) {
    console.error('Admin access check failed:', err)
    return { isAdmin: false, user: null, error: 'Admin check failed' }
  }
}