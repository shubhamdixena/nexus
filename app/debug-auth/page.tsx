// Prevent static generation
export const dynamic = "force-dynamic"

"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      clientTest: {},
      connectionTest: {},
      authTest: {}
    }

    // 1. Check environment variables
    try {
      results.environment = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlFormat: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') || false,
        anonKeyFormat: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') || false,
        // Show first/last 10 chars for verification
        urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
          `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` : 'MISSING',
        keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-10)}` : 'MISSING'
      }
    } catch (error) {
      results.environment.error = String(error)
    }

    // 2. Test client creation
    try {
      const client = createClient()
      results.clientTest = {
        success: true,
        clientCreated: !!client,
        hasAuth: !!client.auth,
        hasFrom: !!client.from
      }

      // 3. Test basic connection
      try {
        const { data, error } = await client.from('users').select('count', { count: 'exact', head: true })
        results.connectionTest = {
          success: !error,
          error: error?.message,
          errorCode: error?.code,
          errorDetails: error?.details,
          data: data
        }
      } catch (connError) {
        results.connectionTest = {
          success: false,
          error: String(connError)
        }
      }

      // 4. Test auth methods
      try {
        const { data: { user }, error: userError } = await client.auth.getUser()
        
        results.authTest = {
          userError: userError?.message,
          hasUser: !!user,
          userDetails: user ? {
            user_id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at
          } : null
        }
      } catch (authError) {
        results.authTest = {
          error: String(authError)
        }
      }

    } catch (clientError) {
      results.clientTest = {
        success: false,
        error: String(clientError)
      }
    }

    setDebugInfo(results)
    setLoading(false)
  }

  const testLogin = async () => {
    try {
      const client = createClient()
      console.log('Testing login with admin@test.com...')
      
      const { data, error } = await client.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'admin123'
      })
      
      console.log('Login result:', { data, error })
      
      if (error) {
        alert(`Login failed: ${error.message}`)
      } else {
        alert('Login successful!')
      }
    } catch (error) {
      console.error('Login test error:', error)
      alert(`Login test failed: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔍 Authentication Debug Tool</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '🔄 Running Diagnostics...' : '🚀 Run Full Diagnostics'}
        </button>
        
        <button
          onClick={testLogin}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-4"
        >
          🔐 Test Login (admin@test.com)
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">🌍 Environment Check</h2>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(debugInfo.environment, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">🔧 Client Creation</h2>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(debugInfo.clientTest, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">🌐 Database Connection</h2>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(debugInfo.connectionTest, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">🔐 Auth System</h2>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(debugInfo.authTest, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">🛠️ Quick Fixes to Try:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Restart your development server: <code>npm run dev</code></li>
          <li>Clear browser cache and cookies completely</li>
          <li>Check if your Supabase project is active in the dashboard</li>
          <li>Verify your API keys haven't expired</li>
          <li>Try incognito/private browsing mode</li>
        </ul>
      </div>
    </div>
  )
}