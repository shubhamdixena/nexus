"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, GraduationCap, HelpCircle } from "lucide-react"

export function DocumentationContent() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground mt-2">User guides and platform documentation</p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="user-guide">User Guide</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Welcome to Nexus
                </CardTitle>
                <CardDescription>Your MBA application journey starts here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nexus is your comprehensive platform for managing MBA applications, finding scholarships, and tracking your progress.
                </p>
                <Badge variant="secondary" className="mt-2">New User</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Setting Up Your Profile
                </CardTitle>
                <CardDescription>Complete your profile for better recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A complete profile helps us provide personalized school recommendations and scholarship matches.
                </p>
                <Badge variant="secondary" className="mt-2">Essential</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Finding Schools
                </CardTitle>
                <CardDescription>Discover MBA programs that match your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use our advanced filters to find MBA programs based on location, ranking, specialization, and more.
                </p>
                <Badge variant="secondary" className="mt-2">Core Feature</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Getting Help
                </CardTitle>
                <CardDescription>Support when you need it</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our support team is here to help with any questions about using the platform or your applications.
                </p>
                <Badge variant="secondary" className="mt-2">Support</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Guide</CardTitle>
              <CardDescription>Step-by-step instructions for using Nexus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Dashboard Overview</h4>
                  <p className="text-sm text-muted-foreground">Learn how to navigate your personalized dashboard and track your application progress.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">School Search & Bookmarks</h4>
                  <p className="text-sm text-muted-foreground">Discover how to search for schools, use filters, and save your target programs.</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">Application Tracking</h4>
                  <p className="text-sm text-muted-foreground">Keep track of application deadlines, requirements, and submission status.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold">Scholarship Opportunities</h4>
                  <p className="text-sm text-muted-foreground">Find and apply for scholarships that match your profile and goals.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>Explore everything Nexus has to offer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">School Discovery</h4>
                  <p className="text-sm text-muted-foreground">Browse and filter MBA programs from top universities worldwide.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Application Tracking</h4>
                  <p className="text-sm text-muted-foreground">Manage deadlines, requirements, and submission status in one place.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Scholarship Search</h4>
                  <p className="text-sm text-muted-foreground">Find funding opportunities that match your profile and career goals.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Profile Management</h4>
                  <p className="text-sm text-muted-foreground">Maintain your academic and professional profile for better recommendations.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions and answers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">How do I create an account?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can sign up using your email address or Google account. After registration, complete your profile to get personalized recommendations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Is the platform free to use?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, Nexus is free to use for searching schools, tracking applications, and finding scholarships. Premium features may be available in the future.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How often is the data updated?</h4>
                  <p className="text-sm text-muted-foreground">
                    We update our university and scholarship data regularly to ensure you have access to the most current information.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Can I export my application data?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can export your saved schools, applications, and deadlines from your profile settings page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 