import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/types/database'

// Get environment variables with fallbacks and validation
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  
  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    serviceRoleKey
  }
}

// Create a browser client for client components
export const createClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
  
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Create a server client for server components and API routes
export const createServerComponentClient = (cookieStore: any) => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Simple connection test
export const testSupabaseConnection = async () => {
  try {
    const client = createClient()
    const { data, error } = await client.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Supabase connection is working' }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Service role client for admin operations (server-side only)
export const createServiceRoleClient = () => {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig()
  
  if (typeof window !== 'undefined') {
    throw new Error('Service role client should only be used server-side')
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable for service role')
  }
  
  return createBrowserClient<Database>(supabaseUrl, serviceRoleKey)
}

// Utility function to create supabase client for API routes
export const createSupabaseApiClient = () => {
  return createClient()
}