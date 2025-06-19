"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminAIInterviewSettings from '@/components/admin-ai-interview-settings'
import { useAuth } from '@/components/auth-provider'
import { usePermissions } from '@/hooks/use-permissions'

export default function AIInterviewSettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { loading: permLoading, isAdmin } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!permLoading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, permLoading, router])

  if (authLoading || permLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-muted-foreground">Loading AI Interview Settings...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return <AdminAIInterviewSettings />
} 