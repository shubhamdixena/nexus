"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestConnectionPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEnvironmentVariables = () => {
    const result = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET",
      timestamp: new Date().toISOString()
    }
    setTestResult({ type: "env", data: result })
  }

  const testApiEndpoint = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/universities?limit=1")
      const data = await response.json()
      
      setTestResult({
        type: "api",
        status: response.status,
        ok: response.ok,
        data: data
      })
    } catch (error: any) {
      setTestResult({
        type: "api",
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Connection Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testEnvironmentVariables} className="mb-4">
              Test Environment Variables
            </Button>
            {testResult?.type === "env" && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testApiEndpoint} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? "Testing..." : "Test API Endpoint"}
            </Button>
            {testResult?.type === "api" && (
              <div>
                <div className="mb-2">
                  <strong>Status:</strong> {testResult.status} ({testResult.ok ? "OK" : "ERROR"})
                </div>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <strong>1. Test Environment Variables:</strong> This will show if your environment variables are loaded correctly in the browser.
            </div>
            <div>
              <strong>2. Test API Endpoint:</strong> This will call your /api/universities endpoint and show the exact response.
            </div>
            <div>
              <strong>3. Expected Results:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Environment variables should show NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as "SET"</li>
                <li>API endpoint should return status 200 with university data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
