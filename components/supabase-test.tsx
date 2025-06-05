'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const [profileCount, setProfileCount] = useState<number | null>(null)
  
  const testConnection = async () => {
    setConnectionStatus('testing')
    setError('')
    
    try {
      const supabase = createClient()
      
      // Test basic connection with the correct table name
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        throw error
      }
      
      setProfileCount(count || 0)
      setConnectionStatus('success')
    } catch (err: any) {
      setError(err.message)
      setConnectionStatus('error')
    }
  }

  const testAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('Session:', session ? 'Active' : 'None')
      console.log('User:', user ? user.email : 'Not logged in')
    } catch (err: any) {
      console.error('Auth test error:', err.message)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Test your Supabase database connection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
            {connectionStatus === 'testing' ? 'Testing...' : 'Test Database Connection'}
          </Button>
          
          <Button onClick={testAuth} variant="outline">
            Test Auth Session
          </Button>
        </div>
        
        {connectionStatus === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">
              ✅ Database connection successful!
              {profileCount !== null && ` Found ${profileCount} profiles.`}
            </p>
          </div>
        )}
        
        {connectionStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">❌ Connection failed:</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
          <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
        </div>
      </CardContent>
    </Card>
  )
}