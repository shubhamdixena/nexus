"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Book, Zap, Settings } from "lucide-react"

export function DeveloperDocumentation() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Developer Documentation</h1>
        <p className="text-muted-foreground mt-2">API reference, guides, and technical documentation</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Documentation
                </CardTitle>
                <CardDescription>Complete API reference for all endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive documentation for REST API endpoints, authentication, and data models.
                </p>
                <Badge variant="secondary" className="mt-2">v1.0</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Getting Started
                </CardTitle>
                <CardDescription>Quick start guide for developers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Step-by-step guide to integrate with our platform and start building applications.
                </p>
                <Badge variant="secondary" className="mt-2">Beginner</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Examples
                </CardTitle>
                <CardDescription>Code samples and use cases</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ready-to-use code examples for common integration patterns and use cases.
                </p>
                <Badge variant="secondary" className="mt-2">Examples</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>Setup and configuration guides</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Environment setup, configuration options, and deployment guidelines.
                </p>
                <Badge variant="secondary" className="mt-2">Setup</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>Complete REST API documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Authentication</h4>
                  <p className="text-sm text-muted-foreground">All API requests require authentication using Bearer tokens.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Base URL</h4>
                  <code className="text-sm">https://api.nexus.com/v1</code>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">API requests are limited to 1000 requests per hour.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Development Guides</CardTitle>
              <CardDescription>Step-by-step tutorials and best practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Getting Started</h4>
                  <p className="text-sm text-muted-foreground">Learn how to set up your development environment and make your first API call.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Authentication Guide</h4>
                  <p className="text-sm text-muted-foreground">Understand how to implement secure authentication in your applications.</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">Data Integration</h4>
                  <p className="text-sm text-muted-foreground">Learn how to integrate university and scholarship data into your application.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Ready-to-use code snippets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 text-slate-100 rounded-lg">
                  <h4 className="font-semibold mb-2 text-white">Fetch Universities</h4>
                  <pre className="text-sm overflow-x-auto">
                    <code>{`fetch('/api/universities', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}</code>
                  </pre>
                </div>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-lg">
                  <h4 className="font-semibold mb-2 text-white">Create Bookmark</h4>
                  <pre className="text-sm overflow-x-auto">
                    <code>{`fetch('/api/bookmarks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    item_type: 'university',
    item_id: 'university-id'
  })
});`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 