import { z } from 'zod'

// Client-side environment schema (only NEXT_PUBLIC_ variables)
const clientEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
})

// Server-side environment schema (includes sensitive variables)
const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>

function validateClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse(process.env)
  
  if (!result.success) {
    console.error('❌ Invalid client environment variables:')
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Client environment validation failed')
  }
  
  return result.data
}

function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env)
  
  if (!result.success) {
    console.error('❌ Invalid server environment variables:')
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Server environment validation failed')
  }
  
  return result.data
}

// Export appropriate validation based on environment
export const env = typeof window === 'undefined' 
  ? validateServerEnv() 
  : validateClientEnv()