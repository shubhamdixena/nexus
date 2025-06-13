// Prevent static generation
export const dynamic = "force-dynamic"

'use client'

import { useState } from 'react'
import { runSupabaseHealthCheck, printHealthCheckReport, type HealthCheckResult } from '@/lib/supabase-health-check'

export default function SupabaseHealthCheckPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<HealthCheckResult | null>(null)

  const runHealthCheck = async () => {
    setIsRunning(true)
    try {
      // Run health check
      const healthResult = await runSupabaseHealthCheck()
      setResult(healthResult)
      
      // Also print to console for detailed logs
      printHealthCheckReport(healthResult)
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'warning': return '⚠️'
      case 'critical': return '❌'
      default: return '❓'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏥 Supabase Health Check</h1>
        <p className="text-gray-600">
          Simple diagnostics to check Supabase connection status
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runHealthCheck}
          disabled={isRunning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? '🔄 Running Health Check...' : '🚀 Run Health Check'}
        </button>
      </div>

      {/* Health Check Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              {getStatusEmoji(result.overall)} Overall Status: 
              <span className={`ml-2 ${getStatusColor(result.overall)}`}>
                {result.overall.toUpperCase()}
              </span>
            </h2>
          </div>

          {/* Individual Checks */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">🔍 Individual Checks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result.checks).map(([check, passed]) => (
                <div key={check} className="flex items-center space-x-2">
                  <span className="text-lg">{passed ? '✅' : '❌'}</span>
                  <span className="capitalize">
                    {check.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Issues */}
          {result.errors.length > 0 && (
            <div className="p-6 border border-red-300 bg-red-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-red-600">❌ Critical Issues</h3>
              <ul className="space-y-2">
                {result.errors.map((errorMsg, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-red-700">{errorMsg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="p-6 border border-yellow-300 bg-yellow-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-yellow-600">⚠️ Warnings</h3>
              <ul className="space-y-2">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span className="text-yellow-700">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="p-6 border border-blue-300 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">💡 Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-blue-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Fix Guide */}
      <div className="mt-8 p-6 border border-gray-200 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">🔧 Quick Fix Guide</h3>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Environment Issues:</strong> Check that your <code>.env.local</code> file exists and contains valid Supabase credentials
          </div>
          <div>
            <strong>Connection Failures:</strong> Verify your Supabase project is active and your URL/keys are correct
          </div>
          <div>
            <strong>Database Errors:</strong> Ensure the profiles table exists and RLS policies allow access
          </div>
          <div>
            <strong>Auth Issues:</strong> Check auth settings in your Supabase dashboard
          </div>
        </div>
      </div>
    </div>
  )
}