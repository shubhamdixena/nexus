import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

// Environment variables - these should be the same as your web app
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // For React Native, use AsyncStorage for session persistence
    storage: typeof window !== 'undefined' 
      ? window.localStorage 
      : require('@react-native-async-storage/async-storage').default,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

export type { Database } from '../types/database'
