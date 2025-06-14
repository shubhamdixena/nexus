"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useBookmarks } from "@/hooks/use-bookmarks"
import Link from "next/link"
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Plus,
  School,
  Star,
  Target,
  Trophy,
  User,
  AlertCircle,
  Activity,
  Settings,
  Search,
  Heart,
  BookOpen,
  GraduationCap,
  TrendingUp,
} from "lucide-react"

interface DeadlineItem {
  id: string
  title: string
  university?: string
  school_name?: string
  date: string
  daysLeft?: number
  type: 'application' | 'scholarship' | 'document' | 'interview'
  priority?: 'high' | 'medium' | 'low'
  deadline_type?: string
}

interface RecentActivity {
  id: string
  type: 'bookmark' | 'application' | 'profile_update' | 'document_upload' | 'activity'
  title: string
  description: string
  timestamp: string
  icon: any
  item_type?: string
  created_at?: string
  resource?: string
  action?: string
}

interface TestScore {
  test: string
  score: string | number
  date?: string
  percentile?: string
}

interface Application {
  id: string
  university_id: string
  program_name: string
  status: string
  application_type: string
  created_at: string
  updated_at: string
  universities?: {
    id: string
    name: string
    location: string
    country: string
  }
}

export default function Home() {
  const { user, loading } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([])
  const [schoolDeadlines, setSchoolDeadlines] = useState<DeadlineItem[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Real-time bookmark data
  const {
    bookmarkedItems: savedSchools,
    loading: schoolsLoading,
  } = useBookmarks('mba_school')
  
  const {
    bookmarkedItems: savedScholarships,
    loading: scholarshipsLoading,
  } = useBookmarks('scholarship')

  // Calculate days left for a deadline
  const calculateDaysLeft = (dateString: string): number => {
    const deadline = new Date(dateString)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return diffMins <= 1 ? 'just now' : `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
    } else if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      
      setIsLoadingData(true)
      try {
        // Load profile data
        const profileResponse = await fetch("/api/profile")
        if (profileResponse.ok) {
          const { profile, completion } = await profileResponse.json()
          setProfileData({ ...profile, completion })
        }

        // Load personal deadlines
        const deadlinesResponse = await fetch("/api/deadlines")
        if (deadlinesResponse.ok) {
          const { data: deadlinesData } = await deadlinesResponse.json()
          if (deadlinesData && Array.isArray(deadlinesData)) {
            const processedDeadlines = deadlinesData.map((deadline: any) => ({
              ...deadline,
              daysLeft: calculateDaysLeft(deadline.date),
              university: deadline.title.includes('Deadline') ? deadline.title.replace(' Deadline', '') : deadline.title
            }))
            setDeadlines(processedDeadlines)
          } else {
            setDeadlines([])
          }
        }

        // Load school deadlines
        const schoolDeadlinesResponse = await fetch("/api/school-deadlines")
        if (schoolDeadlinesResponse.ok) {
          const { data: schoolDeadlinesData } = await schoolDeadlinesResponse.json()
          if (schoolDeadlinesData && Array.isArray(schoolDeadlinesData)) {
            const processedSchoolDeadlines = schoolDeadlinesData.map((deadline: any) => ({
              ...deadline,
              daysLeft: calculateDaysLeft(deadline.date),
              university: deadline.school_name,
              type: deadline.deadline_type === 'scholarship' ? 'scholarship' : 'application'
            }))
            setSchoolDeadlines(processedSchoolDeadlines)
          } else {
            setSchoolDeadlines([])
          }
        }

        // Load applications
        const applicationsResponse = await fetch("/api/applications")
        if (applicationsResponse.ok) {
          const { data: applicationsData } = await applicationsResponse.json()
          if (applicationsData && Array.isArray(applicationsData)) {
            setApplications(applicationsData)
          } else {
            setApplications([])
          }
        }

        // Load recent activity from activity logs
        const activityResponse = await fetch("/api/activity?limit=5")
        if (activityResponse.ok) {
          const { data: activityData } = await activityResponse.json()
          if (activityData && Array.isArray(activityData)) {
            const formattedActivity = activityData.map((activity: any) => ({
              id: activity.id,
              type: 'activity' as const,
              title: activity.action,
              description: activity.details || activity.resource,
              timestamp: formatRelativeTime(activity.timestamp),
              icon: getActivityIcon(activity.resource),
              resource: activity.resource,
              action: activity.action,
              created_at: activity.timestamp
            }))
            setRecentActivity(formattedActivity)
          } else {
            setRecentActivity([])
          }
        } else {
          // Fallback to bookmarks if activity logs are not available
          const bookmarksResponse = await fetch("/api/bookmarks?limit=5")
          if (bookmarksResponse.ok) {
            const { data: bookmarksData } = await bookmarksResponse.json()
            if (bookmarksData && Array.isArray(bookmarksData)) {
              const recentBookmarks = bookmarksData.map((bookmark: any) => ({
                id: bookmark.id,
                type: 'bookmark' as const,
                title: `Saved ${bookmark.item_type === 'mba_school' ? 'MBA School' : bookmark.item_type}`,
                description: `Added to your ${bookmark.item_type === 'mba_school' ? 'target schools' : 'saved items'}`,
                timestamp: formatRelativeTime(bookmark.created_at),
                icon: bookmark.item_type === 'mba_school' ? School : 
                      bookmark.item_type === 'scholarship' ? Star : 
                      bookmark.item_type === 'university' ? GraduationCap : BookOpen,
                item_type: bookmark.item_type,
                created_at: bookmark.created_at
              }))
              setRecentActivity(recentBookmarks)
            } else {
              setRecentActivity([])
            }
          } else {
            setRecentActivity([])
          }
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoadingProfile(false)
        setIsLoadingData(false)
      }
    }

    if (!loading && user) {
      loadDashboardData()
    } else if (!loading && !user) {
      setIsLoadingProfile(false)
      setIsLoadingData(false)
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

  const getActivityIcon = (resource: string) => {
    switch (resource?.toLowerCase()) {
      case 'mba school':
      case 'school':
        return School
      case 'test scores':
      case 'profile':
        return TrendingUp
      case 'application':
        return FileText
      case 'deadlines':
        return Calendar
      case 'sop':
        return FileText
      case 'documents':
        return FileText
      case 'search':
        return Search
      case 'navigation':
        return ChevronRight
      default:
        return BookOpen
    }
  }

  const calculateProfileCompletion = () => {
    if (!profileData) return 0
    
    const requiredFields = [
      'first_name', 'last_name', 'nationality', 'highest_degree',
      'field_of_study', 'university', 'graduation_year', 'target_degree',
      'career_objective', 'preferred_countries'
    ]
    
    const completedFields = requiredFields.filter(field => {
      const value = profileData[field]
      if (Array.isArray(value)) return value.length > 0
      return value && value !== ''
    })
    
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  const extractTestScores = (): TestScore[] => {
    if (!profileData?.test_scores) return []
    
    const scores: TestScore[] = []
    const testScores = profileData.test_scores
    
    if (testScores.gmat) {
      scores.push({
        test: 'GMAT',
        score: testScores.gmat,
        date: testScores.gmatDate,
        percentile: testScores.gmatPercentile
      })
    }
    
    if (testScores.gre) {
      scores.push({
        test: 'GRE',
        score: testScores.gre,
        date: testScores.greDate,
        percentile: testScores.grePercentile
      })
    }
    
    if (testScores.toefl) {
      scores.push({
        test: 'TOEFL',
        score: testScores.toefl,
        date: testScores.toeflDate
      })
    }
    
    if (testScores.ielts) {
      scores.push({
        test: 'IELTS',
        score: testScores.ielts,
        date: testScores.ieltsDate
      })
    }
    
    return scores
  }

  const getUpcomingDeadlines = () => {
    // Combine personal and school deadlines
    const allDeadlines = [...deadlines, ...schoolDeadlines]
    return allDeadlines
      .filter(d => (d.daysLeft ?? 0) > 0)
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0))
      .slice(0, 3)
  }

  const getSubmittedApplications = () => {
    return applications.filter(app => app.status === 'submitted')
  }

  if (loading || isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 md:p-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6,7].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground mb-4">Sign in to access your personalized dashboard</p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const profileCompletion = calculateProfileCompletion()
  const testScores = extractTestScores()
  const upcomingDeadlines = getUpcomingDeadlines()
  const submittedApplications = getSubmittedApplications()

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {getTimeBasedGreeting()}, {getUserDisplayName()}!
          </h1>
          <p className="text-muted-foreground mt-1">Track your MBA application journey</p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* 1. Your Deadlines */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-500" />
                Your Deadlines
              </CardTitle>
              <CardDescription>Upcoming application deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`rounded-full p-1 ${
                        (deadline.daysLeft ?? 0) <= 7 ? 'bg-red-100 text-red-600' :
                        (deadline.daysLeft ?? 0) <= 30 ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Calendar className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{deadline.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {deadline.university || deadline.school_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={(deadline.daysLeft ?? 0) <= 7 ? 'destructive' : 'secondary'} className="text-xs">
                            {deadline.daysLeft ?? 0} days left
                          </Badge>
                          {deadline.school_name && (
                            <Badge variant="outline" className="text-xs">
                              School
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                    <Link href="/calendar">
                      View All Deadlines
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No deadlines set</p>
                  <p className="text-xs text-muted-foreground mb-3">Add schools to track deadlines or create custom ones</p>
                  <div className="space-y-2">
                    <Button size="sm" asChild>
                      <Link href="/mba-schools">Browse Schools</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/calendar">Add Custom Deadline</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Target Schools */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Target Schools
              </CardTitle>
              <CardDescription>Your saved MBA programs</CardDescription>
            </CardHeader>
            <CardContent>
              {schoolsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : savedSchools.length > 0 ? (
                <div className="space-y-3">
                  {savedSchools.slice(0, 3).map((schoolId) => (
                    <div key={schoolId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="rounded-full bg-blue-100 p-2">
                        <School className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">MBA School</p>
                        <p className="text-xs text-muted-foreground">Saved to your list</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{savedSchools.length} schools saved</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/mba-schools">
                        View All
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No schools saved</p>
                  <p className="text-xs text-muted-foreground mb-3">Start building your target list</p>
                  <Button size="sm" asChild>
                    <Link href="/mba-schools">
                      <Plus className="h-3 w-3 mr-1" />
                      Browse Schools
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Your Recent Activity */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="rounded-full bg-green-100 p-1.5">
                        <activity.icon className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                    <Link href="/profile">
                      View All Activity
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No recent activity</p>
                  <p className="text-xs text-muted-foreground mb-3">Start your MBA journey to see activity here</p>
                  <div className="space-y-2">
                    <Button size="sm" asChild>
                      <Link href="/mba-schools">
                        <Search className="h-3 w-3 mr-1" />
                        Browse Schools
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/scholarships">Find Scholarships</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/profile">Complete Profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Applications Submitted */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Applications Submitted
              </CardTitle>
              <CardDescription>Your submitted applications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="space-y-3">
                  {[1,2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Skeleton className="h-4 w-4" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : submittedApplications.length > 0 ? (
                <div className="space-y-3">
                  {submittedApplications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {app.universities?.name || `University ${app.university_id.slice(-4)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Submitted
                      </Badge>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      {submittedApplications.length} application{submittedApplications.length !== 1 ? 's' : ''} submitted
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/applications">
                        View All
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No applications submitted</p>
                  <p className="text-xs text-muted-foreground mb-3">Start your first application</p>
                  <div className="space-y-2">
                    <Button size="sm" asChild>
                      <Link href="/mba-schools">Find Schools</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/applications">Manage Applications</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Complete Your Profile */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                Complete Your Profile
              </CardTitle>
              <CardDescription>Enhance your application profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Profile Completion</span>
                    <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
                
                {profileCompletion < 100 ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Complete your profile to:</p>
                      <ul className="text-xs space-y-1">
                        <li className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                          Get better school recommendations
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                          Track application deadlines
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                          Find relevant scholarships
                        </li>
                      </ul>
                    </div>
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/profile">
                        <Settings className="h-3 w-3 mr-1" />
                        Complete Profile
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium text-green-600">Profile Complete!</p>
                    <p className="text-xs text-muted-foreground">You're ready to apply</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 6. Your Scores */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Your Scores
              </CardTitle>
              <CardDescription>Test scores & achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {testScores.length > 0 ? (
                <div className="space-y-3">
                  {testScores.map((score, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{score.test}</p>
                        {score.date && (
                          <p className="text-xs text-muted-foreground">{score.date}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-amber-600">{score.score}</p>
                        {score.percentile && (
                          <p className="text-xs text-muted-foreground">{score.percentile}%ile</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/profile">
                      Update Scores
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No test scores added</p>
                  <p className="text-xs text-muted-foreground mb-3">Add your GMAT/GRE scores to get better recommendations</p>
                  <Button size="sm" asChild>
                    <Link href="/profile">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Scores
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 7. Scholarships Saved */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Scholarships Saved
              </CardTitle>
              <CardDescription>Your saved scholarship opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {scholarshipsLoading ? (
                <div className="space-y-3">
                  {[1,2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <Skeleton className="h-4 w-4" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : savedScholarships.length > 0 ? (
                <div className="space-y-3">
                  {savedScholarships.slice(0, 3).map((scholarshipId) => (
                    <div key={scholarshipId} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Scholarship Opportunity</p>
                        <p className="text-xs text-muted-foreground">Merit-based award</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{savedScholarships.length} scholarships saved</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/scholarships">
                        View All
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No scholarships saved</p>
                  <p className="text-xs text-muted-foreground mb-3">Discover funding opportunities for your MBA</p>
                  <Button size="sm" asChild>
                    <Link href="/scholarships">
                      <Search className="h-3 w-3 mr-1" />
                      Find Scholarships
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
