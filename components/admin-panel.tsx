"use client"
import { useState, useMemo, lazy, Suspense, useCallback } from "react"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, School, BookOpen, Settings, ArrowLeft, FileText, BookOpenCheck, Activity, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldX, Loader2 } from "lucide-react"
import { performanceMonitor, useDebounce } from '@/lib/performance-optimizer'

// Lazy load heavy admin components for better initial load
const AdminUserManagement = lazy(() => import("./admin-user-management"))
const AdminSchoolsManagement = lazy(() => import("./admin-schools-management").then(m => ({ default: m.AdminSchoolsManagement })))
const AdminMbaSchoolsManagement = lazy(() => import("./admin-mba-schools-management").then(m => ({ default: m.AdminMbaSchoolsManagement })))
const AdminScholarshipsManagement = lazy(() => import("./admin-scholarships-management").then(m => ({ default: m.AdminScholarshipsManagement })))
const AdminSystemSettings = lazy(() => import("./admin-system-settings").then(m => ({ default: m.AdminSystemSettings })))
const AdminApplicationManagement = lazy(() => import("./admin-application-management").then(m => ({ default: m.AdminApplicationManagement })))
const AdminSopManagement = lazy(() => import("./admin-sop-management").then(m => ({ default: m.AdminSopManagement })))
const AdminAdvancedUserManagement = lazy(() => import("./admin-advanced-user-management").then(m => ({ default: m.AdminAdvancedUserManagement })))
const AdminDataCorrections = lazy(() => import("./admin-data-corrections").then(m => ({ default: m.AdminDataCorrections })))

// Memoized loading component
const ComponentLoader = React.memo(() => (
  <div className="flex items-center justify-center h-96">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading component...</span>
  </div>
))

// Memoized admin card component
const AdminCard = React.memo(({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  disabled = false 
}: {
  icon: any
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
}) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
    }`}
    onClick={disabled ? undefined : onClick}
  >
    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
      <Icon className="h-6 w-6 text-primary mr-2" />
      <div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </div>
    </CardHeader>
  </Card>
))

const AdminPanel = React.memo(() => {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { loading, isAdmin, hasPermission } = usePermissions()

  // Debounce section changes to prevent rapid switching
  const debouncedSetActiveSection = useDebounce(setActiveSection, 100)

  // Memoize permission checks to prevent recalculation
  const canAccessAdmin = useMemo(() => {
    return hasPermission('admin.read') || hasPermission('admin.write')
  }, [hasPermission])

  // Memoize tab configurations to prevent recreation
  const tabConfig = useMemo(() => [
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
      id: "data-corrections",
      title: "Data Corrections",
      icon: Flag,
      description: "Review user-reported data issues",
      component: AdminDataCorrections,
      permission: 'admin.data.manage'
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
    return tabConfig.filter(tab => hasPermission(tab.permission as any))
  }, [tabConfig, hasPermission])

  // Get current tab component with performance monitoring
  const currentTabComponent = useMemo(() => {
    const currentTab = tabConfig.find(tab => tab.id === activeSection)
    return currentTab?.component
  }, [activeSection, tabConfig])

  // Handle section change with performance monitoring
  const handleSectionChange = useCallback((sectionId: string) => {
    performanceMonitor.startTiming(`AdminPanel-${sectionId}`)
    debouncedSetActiveSection(sectionId)
  }, [debouncedSetActiveSection])

  const handleBackToMain = useCallback(() => {
    setActiveSection(null)
  }, [])

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

  // Render active section with lazy loading
  const renderActiveSection = () => {
    if (!currentTabComponent) return null

    const Component = currentTabComponent

    return (
      <Suspense fallback={<ComponentLoader />}>
        <Component />
      </Suspense>
    )
  }

  // If a section is active, show that section with a back button
  if (activeSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBackToMain} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </div>
        {renderActiveSection()}
      </div>
    )
  }

  // Main admin dashboard with optimized grid
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage your application and users</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-500" />
          <span className="text-sm text-muted-foreground">System Active</span>
        </div>
      </div>

      {/* Quick Stats - Fast loading */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MBA Schools</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+2 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+12 pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.9%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Sections - Optimized grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <AdminCard
              key={tab.id}
              icon={Icon}
              title={tab.title}
              description={tab.description}
              onClick={() => handleSectionChange(tab.id)}
            />
          )
        })}
      </div>

      {/* Recent Activity - Lightweight component */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">New user registration: john.doe@example.com</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">MBA School updated: Harvard Business School</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Application submitted for review</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export { AdminPanel }
