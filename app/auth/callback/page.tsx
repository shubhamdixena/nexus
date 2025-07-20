"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

// Prevent prerendering since this is a client-side auth callback handler
export const dynamic = 'force-dynamic'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_failed')
          return
        }

        if (data.session) {
          // Check if user has completed profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('profile_completed, profile_completion_percentage')
            .eq('id', data.session.user.id)
            .single()

          const isComplete = profile?.profile_completed || (profile?.profile_completion_percentage || 0) >= 80

          if (!isComplete) {
            router.push('/profile?required=true')
          } else {
            router.push('/applications')
          }
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-2 text-sm text-muted-foreground">
          Completing authentication...
        </p>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-2 text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}