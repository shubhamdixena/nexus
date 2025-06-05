import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { Database } from '@/types/database'

// Get environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create a browser client for client components
export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Create a server client for server components and API routes
export const createServerComponentClient = (cookieStore: any) => {
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

// Legacy export for backwards compatibility during migration
export const supabase = createClient()

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const client = createClient()
    const { data, error } = await client.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error }
    }
    
    console.log('Supabase connection test successful')
    return { success: true, data }
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return { success: false, error }
  }
}

// Utility function to create supabase client for API routes
export const createSupabaseApiClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
