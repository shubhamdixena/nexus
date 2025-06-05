"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Book, Code, Zap, Shield } from "lucide-react"

export function DeveloperDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Developer Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive guide to building with the Nexus platform
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Start
              </CardTitle>
              <CardDescription>
                Get up and running with the Nexus platform in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Installation</h3>
                <div className="bg-muted p-4 rounded-lg relative">
                  <code className="text-sm">npm install @nexus/sdk</code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard("npm install @nexus/sdk", "install")}
                  >
                    {copiedCode === "install" ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Setup</h3>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`import { NexusClient } from '@nexus/sdk'

const client = new NexusClient({
  apiKey: 'your-api-key',
  environment: 'development'
})

// Initialize your application
await client.initialize()`}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard("import { NexusClient } from '@nexus/sdk'\n\nconst client = new NexusClient({\n  apiKey: 'your-api-key',\n  environment: 'development'\n})\n\n// Initialize your application\nawait client.initialize()", "setup")}
                  >
                    {copiedCode === "setup" ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication
              </CardTitle>
              <CardDescription>
                Secure authentication flow for your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg relative">
                <pre className="text-sm overflow-x-auto">
{`// Login with email/password
const { user, session } = await client.auth.signIn({
  email: 'user@example.com',
  password: 'password'
})

// Social login
const { user, session } = await client.auth.signInWithProvider({
  provider: 'google'
})`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard("// Login with email/password\nconst { user, session } = await client.auth.signIn({\n  email: 'user@example.com',\n  password: 'password'\n})\n\n// Social login\nconst { user, session } = await client.auth.signInWithProvider({\n  provider: 'google'\n})", "auth")}
                >
                  {copiedCode === "auth" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-reference" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user profiles and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Get User Profile</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>GET /api/users/:id</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Update Profile</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>PUT /api/users/:id</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Delete User</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>DELETE /api/users/:id</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Universities</CardTitle>
                <CardDescription>Access university data and rankings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">List Universities</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>GET /api/universities</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Get University Details</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>GET /api/universities/:id</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Search Universities</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>GET /api/universities/search</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scholarships</CardTitle>
                <CardDescription>Scholarship search and application APIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">List Scholarships</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>GET /api/scholarships</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Apply for Scholarship</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>POST /api/scholarships/:id/apply</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Check Application Status</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>GET /api/applications/:id</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Document upload and management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Upload Document</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>POST /api/documents</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Get Document</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>GET /api/documents/:id</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Delete Document</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <code>DELETE /api/documents/:id</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Practical examples to help you integrate with Nexus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">React Integration</h3>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`import { useNexus } from '@nexus/react'

function UniversityList() {
  const { data: universities, loading } = useNexus.universities.list()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {universities.map(uni => (
        <div key={uni.id}>{uni.name}</div>
      ))}
    </div>
  )
}`}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard("import { useNexus } from '@nexus/react'\n\nfunction UniversityList() {\n  const { data: universities, loading } = useNexus.universities.list()\n  \n  if (loading) return <div>Loading...</div>\n  \n  return (\n    <div>\n      {universities.map(uni => (\n        <div key={uni.id}>{uni.name}</div>\n      ))}\n    </div>\n  )\n}", "react")}
                  >
                    {copiedCode === "react" ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Next.js API Route</h3>
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
{`// pages/api/universities.js
import { NexusClient } from '@nexus/sdk'

export default async function handler(req, res) {
  const client = new NexusClient(process.env.NEXUS_API_KEY)
  
  try {
    const universities = await client.universities.list()
    res.status(200).json(universities)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch universities' })
  }
}`}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard("// pages/api/universities.js\nimport { NexusClient } from '@nexus/sdk'\n\nexport default async function handler(req, res) {\n  const client = new NexusClient(process.env.NEXUS_API_KEY)\n  \n  try {\n    const universities = await client.universities.list()\n    res.status(200).json(universities)\n  } catch (error) {\n    res.status(500).json({ error: 'Failed to fetch universities' })\n  }\n}", "nextjs")}
                  >
                    {copiedCode === "nextjs" ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>API Reference</span>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>SDK Documentation</span>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Migration Guide</span>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Tools & SDKs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">JavaScript SDK</div>
                    <div className="text-sm text-muted-foreground">@nexus/sdk</div>
                  </div>
                  <Badge variant="secondary">v2.1.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">React Hooks</div>
                    <div className="text-sm text-muted-foreground">@nexus/react</div>
                  </div>
                  <Badge variant="secondary">v1.5.2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">CLI Tool</div>
                    <div className="text-sm text-muted-foreground">@nexus/cli</div>
                  </div>
                  <Badge variant="secondary">v1.2.0</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status & Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>API Status</span>
                  <Badge variant="default" className="bg-green-500">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Response Time</span>
                  <span className="text-sm text-muted-foreground">145ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Uptime</span>
                  <span className="text-sm text-muted-foreground">99.9%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Community Forum</span>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>GitHub Issues</span>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contact Support</span>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
