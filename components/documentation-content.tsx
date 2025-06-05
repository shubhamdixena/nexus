"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function DocumentationContent() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Nexus Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Official documentation for the Nexus Dashboard hosted at{" "}
          <a
            href="https://shubhamdixena.com/nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            shubhamdixena.com/nexus
          </a>
        </p>
      </div>

      <Tabs defaultValue="getting-started">
        <TabsList className="mb-4">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="data-model">Data Model</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Nexus</CardTitle>
              <CardDescription>Essential information to begin using the dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="text-lg font-medium">Overview</h3>
                <p className="mt-2">
                  Nexus is a comprehensive dashboard for managing educational resources, applications, and scholarships.
                  It provides tools for students, educators, and administrators to streamline the application process
                  for international education opportunities.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">System Requirements</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                  <li>Internet connection</li>
                  <li>Account credentials (for authenticated features)</li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Authentication</h3>
                <p className="mt-2">
                  Nexus uses Supabase Authentication for secure access. Users can sign up with email/password
                  or sign in with their existing credentials. New users will be prompted to complete their profile upon first login.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Navigation</h3>
                <p className="mt-2">
                  The dashboard is organized into several key sections accessible from the sidebar:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Dashboard - Overview and summary information</li>
                  <li>Universities - Browse and search universities</li>
                  <li>MBA Schools - Specialized view for MBA programs</li>
                  <li>Scholarships - Available funding opportunities</li>
                  <li>Documents - Document management and templates</li>
                  <li>Timeline - Application timeline and deadlines</li>
                  <li>Knowledge Base - Resources and examples</li>
                  <li>Settings - User preferences and account settings</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Detailed explanation of dashboard capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="text-lg font-medium">University Explorer</h3>
                <p className="mt-2">
                  Browse, search, and filter universities based on various criteria including location, ranking,
                  programs offered, and admission requirements.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Scholarship Management</h3>
                <p className="mt-2">
                  Discover scholarships with detailed information on eligibility, benefits, deadlines, and application
                  processes. Save favorites and track application status.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Document Management</h3>
                <p className="mt-2">
                  Upload, organize, and manage application documents including transcripts, recommendation letters, and
                  statements of purpose.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Application Timeline</h3>
                <p className="mt-2">
                  Visual timeline of application deadlines, tasks, and milestones to help stay organized throughout the
                  application process.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Knowledge Base</h3>
                <p className="mt-2">
                  Access to sample statements of purpose, application essays, and other resources to guide the
                  application process.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Admin Panel</h3>
                <p className="mt-2">
                  Administrative tools for managing users, schools, scholarships, and application data (available to
                  authorized administrators only).
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-model">
          <Card>
            <CardHeader>
              <CardTitle>Data Model</CardTitle>
              <CardDescription>Database structure and relationships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="text-lg font-medium">Supabase Integration</h3>
                <p className="mt-2">
                  Nexus uses Supabase as its backend database service. Supabase provides a PostgreSQL database with
                  real-time capabilities, authentication, and storage features.
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Core Tables</h3>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    <strong>users</strong> - User profiles and authentication data
                    <p className="text-sm text-muted-foreground mt-1">
                      Stores user information including profile details, preferences, and authentication status.
                    </p>
                  </li>
                  <li>
                    <strong>universities</strong> - University information
                    <p className="text-sm text-muted-foreground mt-1">
                      Contains details about universities including location, ranking, programs, and admission
                      requirements.
                    </p>
                  </li>
                  <li>
                    <strong>mba_schools</strong> - MBA program details
                    <p className="text-sm text-muted-foreground mt-1">
                      Specialized information about MBA programs including GMAT requirements, class profiles, and
                      employment outcomes.
                    </p>
                  </li>
                  <li>
                    <strong>scholarships</strong> - Scholarship information
                    <p className="text-sm text-muted-foreground mt-1">
                      Details about scholarships including name, description, eligibility, benefits, deadlines, and
                      application URLs.
                    </p>
                  </li>
                  <li>
                    <strong>documents</strong> - User document metadata
                    <p className="text-sm text-muted-foreground mt-1">
                      Metadata about user documents with references to storage locations.
                    </p>
                  </li>
                  <li>
                    <strong>applications</strong> - Application tracking
                    <p className="text-sm text-muted-foreground mt-1">
                      Tracks user applications to universities and programs, including status and important dates.
                    </p>
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Relationships</h3>
                <p className="mt-2">The database uses foreign key relationships to maintain data integrity:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>users → applications (one-to-many)</li>
                  <li>users → documents (one-to-many)</li>
                  <li>universities → mba_schools (one-to-many)</li>
                  <li>universities → applications (one-to-many)</li>
                  <li>scholarships → applications (one-to-many)</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>Backend API endpoints and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="text-lg font-medium">Authentication</h3>
                <p className="mt-2">Authentication is handled through Supabase Auth.</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <code>/api/auth/signin</code> - Initiates the sign-in process
                  </li>
                  <li>
                    <code>/api/auth/signout</code> - Handles user sign-out
                  </li>
                  <li>
                    <code>/api/auth/session</code> - Returns the current session information
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">User Management</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <code>/api/profile/complete</code> - Updates user profile information
                  </li>
                  <li>
                    <code>/api/users</code> - List users (admin only)
                  </li>
                  <li>
                    <code>/api/users/[id]</code> - Get, update, or delete a specific user
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Universities</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <code>/api/universities</code> - List or create universities
                  </li>
                  <li>
                    <code>/api/universities/[id]</code> - Get, update, or delete a specific university
                  </li>
                  <li>
                    <code>/api/mba-schools</code> - List or create MBA schools
                  </li>
                  <li>
                    <code>/api/mba-schools/[id]</code> - Get, update, or delete a specific MBA school
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Scholarships</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <code>/api/scholarships</code> - List or create scholarships
                  </li>
                  <li>
                    <code>/api/scholarships/[id]</code> - Get, update, or delete a specific scholarship
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Documents</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <code>/api/documents</code> - List or upload documents
                  </li>
                  <li>
                    <code>/api/documents/[id]</code> - Get, update, or delete a specific document
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Applications</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <code>/api/applications</code> - List or create applications
                  </li>
                  <li>
                    <code>/api/applications/[id]</code> - Get, update, or delete a specific application
                  </li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle>Deployment</CardTitle>
              <CardDescription>Hosting and infrastructure details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="text-lg font-medium">Hosting</h3>
                <p className="mt-2">
                  The Nexus dashboard is hosted at{" "}
                  <a
                    href="https://shubhamdixena.com/nexus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    shubhamdixena.com/nexus
                  </a>
                </p>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Technology Stack</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <strong>Frontend:</strong> Next.js, React, Tailwind CSS
                  </li>
                  <li>
                    <strong>Backend:</strong> Next.js API Routes, Supabase
                  </li>
                  <li>
                    <strong>Authentication:</strong> Supabase Auth
                  </li>
                  <li>
                    <strong>Database:</strong> PostgreSQL (via Supabase)
                  </li>
                  <li>
                    <strong>Storage:</strong> Supabase Storage
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Environment Variables</h3>
                <p className="mt-2">The following environment variables are required for deployment:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <code>NEXT_PUBLIC_SUPABASE_URL</code> - Supabase project URL
                  </li>
                  <li>
                    <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Supabase anonymous key
                  </li>
                  <li>
                    <code>SUPABASE_SERVICE_ROLE_KEY</code> - Supabase service role key (for admin operations)
                  </li>
                  <li>
                    <code>NEXT_SITE_URL</code> - The base URL of the application (for redirects)
                  </li>
                </ul>
              </section>

              <Separator />

              <section>
                <h3 className="text-lg font-medium">Deployment Process</h3>
                <p className="mt-2">
                  The application is deployed using a continuous integration and deployment (CI/CD) pipeline:
                </p>
                <ol className="mt-2 list-decimal pl-5 space-y-1">
                  <li>Code is pushed to the main branch of the repository</li>
                  <li>Automated tests are run to ensure code quality</li>
                  <li>The application is built and deployed to the hosting environment</li>
                  <li>Environment variables are securely injected during the deployment process</li>
                </ol>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
