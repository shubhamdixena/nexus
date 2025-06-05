"use client"
import { useState, useMemo } from "react"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, School, BookOpen, Settings, ArrowLeft, FileText, BookOpenCheck, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminUserManagement from "./admin-user-management"
import { AdminSchoolsManagement } from "./admin-schools-management"
import { AdminScholarshipsManagement } from "./admin-scholarships-management"
import { AdminSystemSettings } from "./admin-system-settings"
import { AdminApplicationManagement } from "./admin-application-management"
import { AdminSopManagement } from "./admin-sop-management"
import { AdminAdvancedUserManagement } from "./admin-advanced-user-management"
import { AdminOnly } from "./permission-guard"
import { usePermissions } from "@/hooks/use-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldX, Loader2 } from "lucide-react"

const AdminPanel = React.memo(() => {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { loading, isAdmin, hasPermission } = usePermissions()

  // Memoize permission checks to prevent recalculation
  const canAccessAdmin = useMemo(() => {
    return hasPermission('admin.read') || hasPermission('admin.write')
  }, [hasPermission])

  const canManageUsers = useMemo(() => {
    return hasPermission('admin.users.manage')
  }, [hasPermission])

  const canManageSchools = useMemo(() => {
    return hasPermission('admin.schools.manage')
  }, [hasPermission])

  // Memoize tab configurations to prevent recreation
  const tabConfig = useMemo(() => [
    {
      id: "overview",
      title: "Overview",
      icon: Activity,
      description: "Admin dashboard overview",
      component: null,
      permission: 'admin.read'
    },
    {
      id: "users",
      title: "User Management",
      icon: Users,
      description: "Manage users and permissions",
      component: AdminUserManagement,
      permission: 'admin.users.manage'
    },
    {
      id: "schools",
      title: "Schools Management",
      icon: School,
      description: "Manage universities and programs",
      component: AdminSchoolsManagement,
      permission: 'admin.schools.manage'
    },
    {
      id: "mba-schools",
      title: "MBA Schools",
      icon: BookOpen,
      description: "Manage MBA programs",
      component: AdminMbaSchoolsManagement,
      permission: 'admin.schools.manage'
    },
    {
      id: "scholarships",
      title: "Scholarships",
      icon: BookOpenCheck,
      description: "Manage scholarship opportunities",
      component: AdminScholarshipsManagement,
      permission: 'admin.scholarships.manage'
    },
    {
      id: "applications",
      title: "Applications",
      icon: FileText,
      description: "Manage student applications",
      component: AdminApplicationManagement,
      permission: 'admin.applications.manage'
    },
    {
      id: "sop",
      title: "SOP Management",
      icon: FileText,
      description: "Manage Statement of Purpose documents",
      component: AdminSopManagement,
      permission: 'admin.sop.manage'
    },
    {
      id: "advanced-users",
      title: "Advanced User Management",
      icon: Users,
      description: "Advanced user analytics and segmentation",
      component: AdminAdvancedUserManagement,
      permission: 'admin.users.advanced'
    },
    {
      id: "settings",
      title: "System Settings",
      icon: Settings,
      description: "Configure system settings",
      component: AdminSystemSettings,
      permission: 'admin.settings.manage'
    }
  ], [])

  // Filter available tabs based on permissions
  const availableTabs = useMemo(() => {
    return tabConfig.filter(tab => hasPermission(tab.permission))
  }, [tabConfig, hasPermission])

  // Get current tab component
  const currentTabComponent = useMemo(() => {
    const currentTab = tabConfig.find(tab => tab.id === activeSection)
    return currentTab?.component
  }, [activeSection, tabConfig])

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verifying admin access...</span>
      </div>
    )
  }

  // Show access denied if not admin
  if (!canAccessAdmin) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need administrator privileges to view this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Function to render the active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case "users":
        return <AdminUserManagement />
      case "schools":
        return <AdminSchoolsManagement />
      case "scholarships":
        return <AdminScholarshipsManagement />
      case "settings":
        return <AdminSystemSettings />
      case "applications":
        return <AdminApplicationManagement />
      case "sops":
        return <AdminSopManagement />
      case "advanced-user-management":
        return <AdminAdvancedUserManagement />
      default:
        return null
    }
  }

  // If a section is active, show that section with a back button
  if (activeSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => setActiveSection(null)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </div>
        {renderActiveSection()}
      </div>
    )
  }

  // Otherwise show the main admin dashboard
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>Manage users, content, and system settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Welcome to the admin panel. Select a section below to manage different aspects of the platform.
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className="bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setActiveSection("users")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="h-10 w-10 mb-4 text-primary" />
                <CardTitle className="text-lg mb-2">User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setActiveSection("advanced-user-management")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Activity className="h-10 w-10 mb-4 text-primary" />
                <CardTitle className="text-lg mb-2">Advanced User Management</CardTitle>
                <CardDescription>Track activity, create segments, and send messages</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setActiveSection("schools")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <School className="h-10 w-10 mb-4 text-primary" />
                <CardTitle className="text-lg mb-2">Schools & Programs</CardTitle>
                <CardDescription>Manage universities, MBA schools, and programs</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setActiveSection("scholarships")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <BookOpen className="h-10 w-10 mb-4 text-primary" />
                <CardTitle className="text-lg mb-2">Scholarships</CardTitle>
                <CardDescription>Manage scholarship listings and applications</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setActiveSection("applications")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <FileText className="h-10 w-10 mb-4 text-primary" />
                <CardTitle className="text-lg mb-2">Applications</CardTitle>
                <CardDescription>Track and manage student applications</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setActiveSection("sops")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <BookOpenCheck className="h-10 w-10 mb-4 text-primary" />
                <CardTitle className="text-lg mb-2">Knowledge Base</CardTitle>
                <CardDescription>Manage Statement of Purpose examples</CardDescription>
              </CardContent>
            </Card>

            <Card
              className="bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setActiveSection("settings")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Settings className="h-10 w-10 mb-4 text-primary" />
                <CardTitle className="text-lg mb-2">System Settings</CardTitle>
                <CardDescription>Configure platform settings and integrations</CardDescription>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export { AdminPanel }
