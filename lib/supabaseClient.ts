import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/types/database'
import { env } from './env-validation'

// Create a browser client for client components
export const createClient = () => {
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Create a server client for server components and API routes
export const createServerComponentClient = (cookieStore: any) => {
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
  if (typeof window !== 'undefined') {
    throw new Error('Service role client should only be used server-side')
  }
  
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
}

// Utility function to create supabase client for API routes
export const createSupabaseApiClient = () => {
  return createClient()
}