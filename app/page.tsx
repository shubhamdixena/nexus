"use client"

import { useEffect, useState, Suspense } from "react"
import { useAuth } from "@/components/auth-provider"
import { useActivityTracker } from "@/hooks/use-activity-tracker"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { getUserDisplayName as getDisplayName } from "@/lib/user-utils"
// Removed optimized dashboard wrapper imports as we're using simpler components now
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { useProfile, useDeadlines, useApplicationProgress } from "@/hooks/use-cached-data"
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
  DollarSign,
  Users,
  Building2,
  Award,
  ExternalLink,
  BarChart3,
  Globe,
  Briefcase,
  Edit3,
  Eye,
  MoreHorizontal,
  Upload,
  MessageSquare,
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
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
    university_name: string
    location: string
    country: string
  }
}

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  
  // Track user activity automatically
  useActivityTracker({
    trackPageViews: true,
    trackClicks: true,
    trackFormSubmissions: true
  })
  
  // Use cached data hooks (only when user exists)
  const { data: profileResponse, loading: profileLoading, error: profileError } = useProfile(user?.id)
  const { data: deadlinesResponse, loading: deadlinesLoading, error: deadlinesError } = useDeadlines(user?.id)
  const { data: applicationProgress, loading: applicationsLoading, error: applicationsError } = useApplicationProgress(user?.id)
  
  // Legacy state for non-cached data (until we create hooks for these)
  const [schoolDeadlines, setSchoolDeadlines] = useState<DeadlineItem[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [schoolTargets, setSchoolTargets] = useState<any[]>([])
  const [isLoadingLegacyData, setIsLoadingLegacyData] = useState(true)

  // Extract data from cached responses
  const profileData = profileResponse?.profile || null
  const deadlines = deadlinesResponse || []
  
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
    const loadLegacyDashboardData = async () => {
      if (!user) return
      
      setIsLoadingLegacyData(true)
      try {
        // Load only non-cached data (school deadlines, activity, applications, school targets)
        const [
          schoolDeadlinesResponse,
          applicationsResponse,
          activityResponse,
          schoolTargetsResponse
        ] = await Promise.allSettled([
          fetch("/api/school-deadlines"),
          fetch("/api/applications"),
          fetch("/api/activity?limit=5"),
          fetch("/api/school-targets")
        ])

        // Process school deadlines data - API returns { deadlines: [...] }
        if (schoolDeadlinesResponse.status === 'fulfilled' && schoolDeadlinesResponse.value.ok) {
          const schoolDeadlinesData = await schoolDeadlinesResponse.value.json()
          if (schoolDeadlinesData.deadlines && Array.isArray(schoolDeadlinesData.deadlines)) {
            const processedSchoolDeadlines = schoolDeadlinesData.deadlines.map((deadline: any) => ({
              ...deadline,
              date: deadline.deadline_date,
              daysLeft: calculateDaysLeft(deadline.deadline_date),
              university: deadline.school_name,
              type: 'application'
            }))
            setSchoolDeadlines(processedSchoolDeadlines)
          } else {
            setSchoolDeadlines([])
          }
        } else {
          console.error('Failed to load school deadlines')
          setSchoolDeadlines([])
        }

        // Process applications data - API returns { data: [...] }
        if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.ok) {
          const applicationsData = await applicationsResponse.value.json()
          if (applicationsData.data && Array.isArray(applicationsData.data)) {
            setApplications(applicationsData.data)
          } else {
            console.warn('Applications API returned unexpected data structure:', applicationsData)
            setApplications([])
          }
        } else {
          if (applicationsResponse.status === 'fulfilled') {
            // Log the actual error from the API
            const errorText = await applicationsResponse.value.text()
            console.error('Failed to load applications - API error:', errorText)
          } else {
            console.error('Failed to load applications - Network error:', applicationsResponse.reason)
          }
          setApplications([])
        }

        // Process activity data - API returns { data: [...] }
        if (activityResponse.status === 'fulfilled' && activityResponse.value.ok) {
          const activityData = await activityResponse.value.json()
          if (activityData.data && Array.isArray(activityData.data)) {
            const formattedActivity = activityData.data.map((activity: any) => ({
              id: activity.id,
              type: 'activity' as const,
              title: activity.action,
              description: `${activity.resource}${activity.details ? ` - ${activity.details}` : ''}`,
              timestamp: activity.timestamp || activity.created_at,
              icon: getActivityIcon(activity.resource),
              resource: activity.resource,
              action: activity.action
            }))
            setRecentActivity(formattedActivity)
          } else {
            setRecentActivity([])
          }
        } else {
          console.error('Failed to load activity data')
          setRecentActivity([])
        }

        // Process school targets data - this will replace the dummy data
        if (schoolTargetsResponse.status === 'fulfilled' && schoolTargetsResponse.value.ok) {
          const schoolTargetsData = await schoolTargetsResponse.value.json()
          setSchoolTargets(schoolTargetsData.targets || [])
          console.log('School targets data:', schoolTargetsData)
        } else {
          console.error('Failed to load school targets')
          setSchoolTargets([])
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Set empty states on error
        setSchoolDeadlines([])
        setApplications([])
        setRecentActivity([])
      } finally {
        setIsLoadingLegacyData(false)
      }
    }

    loadLegacyDashboardData()
  }, [user])

  function getTimeBasedGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good Morning"
    if (hour >= 12 && hour < 17) return "Good Afternoon"
    if (hour >= 17 && hour < 22) return "Good Evening"
    return "Good Night"
  }

  const getUserDisplayName = () => {
    return getDisplayName(user, profileData)
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

  // Immediately render dashboard structure with static content
  // and load dynamic content separately
  if (!user && !authLoading) {
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



  // Comprehensive application status options
  const applicationStatuses = [
    { value: "account_created", label: "Account Created", color: "text-gray-600 bg-gray-100" },
    { value: "essays_working", label: "Essays Working On", color: "text-blue-600 bg-blue-100" },
    { value: "draft_completed", label: "Draft Completed", color: "text-indigo-600 bg-indigo-100" },
    { value: "waiting_review", label: "Waiting for Review", color: "text-yellow-600 bg-yellow-100" },
    { value: "review_completed", label: "Review Completed", color: "text-purple-600 bg-purple-100" },
    { value: "application_submitted", label: "Application Submitted", color: "text-green-600 bg-green-100" },
    { value: "interview_invited", label: "Interview Invited", color: "text-cyan-600 bg-cyan-100" },
    { value: "interview_completed", label: "Interview Completed", color: "text-teal-600 bg-teal-100" },
    { value: "decision_pending", label: "Decision Pending", color: "text-orange-600 bg-orange-100" },
    { value: "accepted", label: "Accepted", color: "text-emerald-600 bg-emerald-100" },
    { value: "waitlisted", label: "Waitlisted", color: "text-amber-600 bg-amber-100" },
    { value: "rejected", label: "Rejected", color: "text-red-600 bg-red-100" }
  ]

  // Document requirements for MBA applications
  const documentRequirements = [
    { id: "transcript", name: "Official Transcripts", required: true },
    { id: "gmat_gre", name: "GMAT/GRE Scores", required: true },
    { id: "resume", name: "Resume/CV", required: true },
    { id: "essays", name: "Essays", required: true },
    { id: "recommendations", name: "Letters of Recommendation", required: true },
    { id: "toefl_ielts", name: "TOEFL/IELTS (International)", required: false },
    { id: "application_fee", name: "Application Fee", required: true },
    { id: "interview", name: "Interview (if invited)", required: false },
    { id: "additional_docs", name: "Additional Documents", required: false }
  ]

  // Get application status badge
  const getStatusBadge = (status: string) => {
    const statusInfo = applicationStatuses.find(s => s.value === status)
    if (!statusInfo) return <Badge variant="outline">Unknown</Badge>
    
    return (
      <Badge 
        variant="outline" 
        className={`${statusInfo.color} border-current text-xs`}
      >
        {statusInfo.label}
      </Badge>
    )
  }

  // Get deadline urgency styling
  const getDeadlineUrgency = (daysLeft: number) => {
    if (daysLeft < 0) return { color: "text-red-600", bg: "bg-red-50" }
    if (daysLeft <= 7) return { color: "text-red-600", bg: "bg-red-50" }
    if (daysLeft <= 30) return { color: "text-orange-600", bg: "bg-orange-50" }
    if (daysLeft <= 60) return { color: "text-blue-600", bg: "bg-blue-50" }
    return { color: "text-gray-600", bg: "bg-gray-50" }
  }

  // Document Requirements Modal Component
  const DocumentRequirementsModal = ({ school }: { school: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View Documents">
          <FileText className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Requirements
          </DialogTitle>
          <DialogDescription>
            Track your document submission progress for {school.schoolName}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {documentRequirements.map((doc) => {
              const docStatus = school.documentStatus[doc.id as keyof typeof school.documentStatus]
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={docStatus?.uploaded || false}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      {doc.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                  {docStatus?.uploaded && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Upload className="h-3 w-3" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )

  // Remarks Modal Component
  const RemarksModal = ({ school }: { school: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Add Remark">
          <MessageSquare className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Remarks
          </DialogTitle>
          <DialogDescription>
            Add notes and track progress for {school.schoolName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Last Remark:</label>
            <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
              {school.lastRemark || "No remarks yet"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Add New Remark:</label>
            <Textarea 
              placeholder="Add your notes here..."
              className="mt-1"
              rows={4}
            />
          </div>
          <Button className="w-full">Save Remark</Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Preference Badge Component
  const PreferenceBadge = ({ rank }: { rank: number }) => {
    const getPreferenceColor = (rank: number) => {
      if (rank <= 3) return "bg-amber-100 text-amber-800 border-amber-200"
      if (rank <= 7) return "bg-blue-100 text-blue-800 border-blue-200"
      if (rank <= 12) return "bg-green-100 text-green-800 border-green-200"
      return "bg-gray-100 text-gray-800 border-gray-200"
    }

    const getPreferenceLabel = (rank: number) => {
      if (rank <= 3) return "Dream"
      if (rank <= 7) return "Target"
      if (rank <= 12) return "Safety"
      return "Backup"
    }

    return (
      <div className="flex items-center gap-2">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPreferenceColor(rank)}`}>
          #{rank}
        </div>
        <Badge variant="outline" className={`text-xs ${getPreferenceColor(rank)} border-0`}>
          {getPreferenceLabel(rank)}
        </Badge>
      </div>
    )
  }

  // Targeted Schools Component
  const TargetedSchoolsComponent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Target Schools</h2>
          <p className="text-muted-foreground">Track deadlines and application progress across {schoolTargets.length} schools</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Schools</p>
              <p className="text-xl font-bold">{schoolTargets.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Urgent Deadlines</p>
              <p className="text-xl font-bold">
                {schoolTargets.filter(school => school.deadline && calculateDaysLeft(school.deadline) <= 7).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Submitted</p>
              <p className="text-xl font-bold">
                {schoolTargets.filter(school => school.application_status === 'application_submitted').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Trophy className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Interviews</p>
              <p className="text-xl font-bold">
                {schoolTargets.filter(school => 
                  school.application_status === 'interview_invited' || 
                  school.application_status === 'interview_completed'
                ).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Schools Grid */}
      <ScrollArea className="h-[700px]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schoolTargets
            .sort((a, b) => (a.priority_score || 0) - (b.priority_score || 0))
            .map((school) => {
              const daysLeft = calculateDaysLeft(school.deadline || 'TBD')
              const urgency = getDeadlineUrgency(daysLeft)
              const uploadedDocs = school.documentStatus ? Object.values(school.documentStatus).filter((doc: any) => doc.uploaded).length : 0
              const totalRequiredDocs = school.documentStatus ? Object.values(school.documentStatus).filter((doc: any) => doc.required).length : 0
              const statusInfo = applicationStatuses.find(s => s.value === school.application_status)
              
              return (
                <Card key={school.id} className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative">
                  {/* Priority Score Badge */}
                  <div className="absolute -top-2 -left-2 z-10">
                    <PreferenceBadge rank={school.priority_score || 0} />
                  </div>

                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold leading-tight">{school.school_name}</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {school.location}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {school.application_round || 'Round TBD'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {school.deadline ? new Date(school.deadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            }) : 'TBD'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Application Status */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Application Status</label>
                      <Select value={school.application_status || 'not_started'}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {applicationStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                {status.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Document Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Documents</label>
                        <span className="text-xs text-muted-foreground">{uploadedDocs}/{totalRequiredDocs}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(uploadedDocs / totalRequiredDocs) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Last Remark */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Note</label>
                      <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-md min-h-[40px] text-left">
                        {school.notes || "No notes yet"}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View Essays">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <DocumentRequirementsModal school={school} />
                        <RemarksModal school={school} />
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/mba-schools/${school.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <DashboardLayout>
      <PerformanceMonitor />
      <div className="container mx-auto p-4 md:p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {getTimeBasedGreeting()}, {authLoading ? "Student" : getUserDisplayName()}!
          </h1>
          <p className="text-muted-foreground mt-1">Track your MBA application journey</p>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Profile Completion */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {profileLoading && !profileData ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <div className="text-2xl font-bold">{profileResponse?.completion?.percentage || 0}%</div>
              )}
              <Progress value={profileResponse?.completion?.percentage || 0} className="w-full mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {(profileResponse?.completion?.percentage || 0) < 100 ? `${100 - (profileResponse?.completion?.percentage || 0)}% remaining` : 'Complete!'}
              </p>
            </CardContent>
          </Card>



          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {(deadlinesLoading && deadlines.length === 0) || isLoadingLegacyData ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Next in {upcomingDeadlines[0]?.daysLeft || 0} days
              </p>
            </CardContent>
          </Card>

          {/* Saved Schools */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Schools</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {schoolsLoading ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <div className="text-2xl font-bold">{savedSchools.length}</div>
              )}
              <p className="text-xs text-muted-foreground">
                {savedScholarships.length} scholarships saved
              </p>
            </CardContent>
          </Card>

          {/* AI Interview Practice */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/ai-interview'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">AI Interview</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">Practice</div>
              <p className="text-xs text-blue-700 mt-1">
                Master your MBA interviews
              </p>
              <Button size="sm" className="w-full mt-2 bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/ai-interview">
                  Start Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Deadlines and Activity */}
          <div className="md:col-span-2 space-y-6">
            {/* Upcoming Deadlines Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(deadlinesLoading && deadlines.length === 0) || isLoadingLegacyData ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingDeadlines.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingDeadlines.map((deadline) => {
                      const urgency = getDeadlineUrgency(deadline.daysLeft || 0)
                      return (
                        <div key={deadline.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className={`rounded-full p-2 ${urgency.bg}`}>
                              <Calendar className={`h-4 w-4 ${urgency.color}`} />
                            </div>
                            <div>
                              <p className="font-medium">{deadline.title}</p>
                              <p className="text-sm text-muted-foreground">{deadline.university}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${urgency.color}`}>
                              {deadline.daysLeft} days left
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(deadline.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/timeline">View All Deadlines</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No upcoming deadlines</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/timeline">Manage Deadlines</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingLegacyData ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const IconComponent = activity.icon
                      return (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className="rounded-full bg-muted p-2">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatRelativeTime(activity.timestamp)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions and Profile */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link href="/mba-schools">
                    <School className="h-4 w-4 mr-2" />
                    Explore MBA Schools
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/timeline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Deadline
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/scholarships">
                    <Award className="h-4 w-4 mr-2" />
                    Find Scholarships
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileLoading && !profileData ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profileData?.first_name && (
                      <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">
                          {profileData.first_name} {profileData.last_name}
                        </p>
                      </div>
                    )}
                    
                    {profileData?.target_degree && (
                      <div>
                        <p className="text-sm font-medium">Target Degree</p>
                        <p className="text-sm text-muted-foreground">{profileData.target_degree}</p>
                      </div>
                    )}
                    
                    {testScores.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Test Scores</p>
                        <div className="space-y-1">
                          {testScores.map((score, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              {score.test}: {score.score}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/profile">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Items Quick View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Saved Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schoolsLoading || scholarshipsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">MBA Schools</span>
                      <Badge variant="outline">{savedSchools.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scholarships</span>
                      <Badge variant="outline">{savedScholarships.length}</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/mba-schools?tab=saved">View Saved</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>


      </div>
    </DashboardLayout>
  )
}
