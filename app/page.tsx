"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Info,
  PenTool,
  User,
  Users,
  BookMarked,
  School,
  Briefcase,
  Loader2,
} from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const { profile } = await response.json()
          setProfileData(profile)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    if (!loading && user) {
      loadProfile()
    }
  }, [user, loading])

  function getTimeBasedGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good Morning"
    if (hour >= 12 && hour < 17) return "Good Afternoon"
    if (hour >= 17 && hour < 22) return "Good Evening"
    return "Good Night"
  }

  const getUserDisplayName = () => {
    if (profileData?.first_name) {
      return `${profileData.first_name}`
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return "Student"
  }

  if (loading || isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 md:p-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        {/* Welcome Section - Now with real user data */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {getTimeBasedGreeting()}, {getUserDisplayName()}!
          </h1>
          <p className="text-muted-foreground mt-1">Your education journey at a glance</p>
        </div>

        {/* Platform Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <School className="h-8 w-8 mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">42</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">Universities</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <BookMarked className="h-8 w-8 mb-2 text-purple-600 dark:text-purple-400" />
              <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">18</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">SOPs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <BarChart3 className="h-8 w-8 mb-2 text-amber-600 dark:text-amber-400" />
              <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300">24</h3>
              <p className="text-sm text-amber-600 dark:text-amber-400">Scholarships</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Briefcase className="h-8 w-8 mb-2 text-green-600 dark:text-green-400" />
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">5</h3>
              <p className="text-sm text-green-600 dark:text-green-400">Applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid - Simplified */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Book an Appointment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Book an Appointment</CardTitle>
              <CardDescription>Schedule time with our experts</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-3">
                <div className="rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <PenTool className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">SOP Review</h4>
                      <p className="text-xs text-muted-foreground">30 min • Professional editing</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Book Now
                  </Button>
                </div>

                <div className="rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Mock Interview</h4>
                      <p className="text-xs text-muted-foreground">45 min • Admission prep</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Schedule
                  </Button>
                </div>

                <div className="rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Visa Counseling</h4>
                      <p className="text-xs text-muted-foreground">60 min • Expert guidance</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Get Help
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education News - Simplified */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Education News</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 items-start pb-3 border-b">
                  <div className="rounded-md overflow-hidden h-12 w-12 flex-shrink-0">
                    <img src="/diverse-students-learning.png" alt="News" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">New Visa Regulations for Students</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      The US Department of State has announced new visa regulations affecting international students...
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start pb-3 border-b">
                  <div className="rounded-md overflow-hidden h-12 w-12 flex-shrink-0">
                    <img src="/scholarship-opportunities.png" alt="News" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Increased Scholarship Funding</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      Leading MBA programs have announced increased scholarship funding for international students...
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="rounded-md overflow-hidden h-12 w-12 flex-shrink-0">
                    <img src="/campus-quad.png" alt="News" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">New Global Leadership Program</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      The University of Virginia's Darden School of Business has announced a new global leadership
                      initiative...
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-xs" size="sm">
                View All News
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>

          {/* Important Reminders - Simplified */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Reminders</CardTitle>
              <CardDescription>Upcoming deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                    <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Visa Documents</h4>
                      <Badge variant="outline" className="text-xs text-red-600 dark:text-red-400">
                        5 days
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Submit all required documents</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                    <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Scholarship Application</h4>
                      <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400">
                        12 days
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Complete Global Leadership application</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Housing Application</h4>
                      <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400">
                        18 days
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Submit on-campus housing preferences</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Pre-Departure Orientation</h4>
                      <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                        July 15
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Mandatory online session</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full text-xs" size="sm">
                View Calendar
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-xs">New SOP</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Browse Schools</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Find Scholarships</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Timeline</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
              <Info className="h-5 w-5" />
              <span className="text-xs">Help Center</span>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
