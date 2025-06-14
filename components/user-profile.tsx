"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { 
  Edit, 
  GraduationCap, 
  Mail, 
  MapPin, 
  Loader2, 
  Trophy, 
  Target, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  User,
  Phone,
  Calendar,
  BookOpen,
  Globe,
  DollarSign,
  Star,
  Clock,
  FileText,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface LoadError {
  type: 'network' | 'server' | 'unknown'
  message: string
  retryable: boolean
}

interface ProfileData {
  id?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  avatar_url?: string
  bio?: string
  nationality?: string
  date_of_birth?: string
  profile_completion_percentage?: number
  highest_degree?: string
  field_of_study?: string
  university?: string
  graduation_year?: number
  gpa?: number
  test_scores?: {
    gmat?: string
    gre?: string
    toefl?: string
    ielts?: string
    gmatDate?: string
    greDate?: string
    toeflDate?: string
    ieltsDate?: string
  }
  target_degree?: string
  target_programs?: string[]
  career_objective?: string
  work_experience_category?: string
  preferred_countries?: string[]
  industry_interests?: string[]
  budget_range?: string
  start_date?: string
  study_mode?: string
  accommodation_preference?: string
  scholarship_interest?: boolean
  communication_preferences?: string[]
}

export function UserProfile() {
  const [profileData, setProfileData] = useState<ProfileData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<LoadError | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const { toast } = useToast()
  const router = useRouter()

  const determineErrorType = (error: any): LoadError => {
    if (!navigator.onLine) {
      return {
        type: 'network',
        message: 'No internet connection. Please check your network and try again.',
        retryable: true
      }
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network error. Please check your connection and try again.',
        retryable: true
      }
    }

    if (error.status >= 500) {
      return {
        type: 'server',
        message: 'Server error. Please try again in a few moments.',
        retryable: true
      }
    }

    if (error.status === 401 || error.status === 403) {
      return {
        type: 'server',
        message: 'Authentication error. Please log in again.',
        retryable: false
      }
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      retryable: true
    }
  }

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/profile", {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw { status: response.status, message: `HTTP ${response.status}` }
      }
      
      const { profile } = await response.json()
      setProfileData(profile || {})
      setRetryCount(0)
      
    } catch (error) {
      console.error("Error loading profile:", error)
      const errorInfo = determineErrorType(error)
      setError(errorInfo)
      
      toast({
        title: "Failed to load profile",
        description: errorInfo.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1)
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Error state rendering
  if (error && !isLoading) {
    return (
      <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                {error.type === 'network' ? (
                  <WifiOff className="h-6 w-6 text-red-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <CardTitle className="text-lg">Unable to load profile</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {error.retryable && (
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again {retryCount > 0 && `(${retryCount})`}
                </Button>
              )}
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
        <div className="space-y-6">
          {/* Loading skeleton for profile header */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="h-24 w-24 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-3 flex-1">
                    <div className="h-8 w-64 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-56 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              </div>
            </CardHeader>
            <div className="h-px bg-border" />
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
          
          {/* Loading skeleton for tabs */}
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-36 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const completionPercentage = profileData.profile_completion_percentage || 0
  const isProfileComplete = completionPercentage >= 80
  const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-8 max-w-6xl">
      {/* Network status indicator */}
      {typeof window !== 'undefined' && !navigator.onLine && (
        <Alert className="border-orange-500 bg-orange-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarImage src={profileData.avatar_url} alt={fullName} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {profileData.first_name?.charAt(0) || 'U'}{profileData.last_name?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3 flex-1">
                <div>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    {fullName || "Welcome to your profile"}
                  </CardTitle>
                  <CardDescription className="text-lg mt-1">
                    {profileData.bio || "Complete your profile to get started"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profileData.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profileData.email}</span>
                    </div>
                  )}
                  {profileData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                  {profileData.nationality && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.nationality}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button 
              size="lg" 
              onClick={() => router.push('/profile-setup')} 
              className="shadow-sm whitespace-nowrap"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {/* Profile Completion Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-base font-semibold">Profile Completion</span>
              </div>
              <span className="text-base font-bold text-primary">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            {!isProfileComplete && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Complete your profile to get better recommendations and opportunities.
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-1 text-blue-600 hover:text-blue-800 font-semibold"
                    onClick={() => router.push('/profile-setup')}
                  >
                    Complete now →
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {isProfileComplete && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">
                  Your profile is complete! You're all set to receive personalized recommendations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="education" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 p-1 mb-8 bg-muted">
          <TabsTrigger value="education" className="flex items-center gap-2 h-10 font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
            <span className="sm:hidden text-xs">Edu</span>
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2 h-10 font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Test Scores</span>
            <span className="sm:hidden text-xs">Tests</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2 h-10 font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Goals</span>
            <span className="sm:hidden text-xs">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2 h-10 font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
            <span className="sm:hidden text-xs">Prefs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="education" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education Background
              </CardTitle>
              <CardDescription>Your academic qualifications and educational history</CardDescription>
            </CardHeader>
            <CardContent>
              {profileData.highest_degree || profileData.field_of_study || profileData.university ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <InfoCard
                    label="Highest Degree"
                    value={profileData.highest_degree}
                    icon={<BookOpen className="h-4 w-4" />}
                  />
                  <InfoCard
                    label="Field of Study"
                    value={profileData.field_of_study}
                    icon={<FileText className="h-4 w-4" />}
                  />
                  <InfoCard
                    label="University"
                    value={profileData.university}
                    icon={<GraduationCap className="h-4 w-4" />}
                  />
                  <InfoCard
                    label="Graduation Year"
                    value={profileData.graduation_year?.toString()}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  {profileData.gpa && (
                    <InfoCard
                      label="GPA"
                      value={profileData.gpa.toString()}
                      icon={<Star className="h-4 w-4" />}
                    />
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<GraduationCap className="h-16 w-16" />}
                  title="No education information"
                  description="Add your educational background to help us provide better recommendations."
                  action={
                    <Button onClick={() => router.push('/profile-setup')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Test Scores
              </CardTitle>
              <CardDescription>Standardized test scores for applications</CardDescription>
            </CardHeader>
            <CardContent>
              {profileData.test_scores && Object.keys(profileData.test_scores).some(key => profileData.test_scores?.[key as keyof typeof profileData.test_scores]) ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {profileData.test_scores.gmat && (
                    <ScoreCard
                      title="GMAT"
                      score={profileData.test_scores.gmat}
                      date={profileData.test_scores.gmatDate}
                    />
                  )}
                  {profileData.test_scores.gre && (
                    <ScoreCard
                      title="GRE"
                      score={profileData.test_scores.gre}
                      date={profileData.test_scores.greDate}
                    />
                  )}
                  {profileData.test_scores.toefl && (
                    <ScoreCard
                      title="TOEFL"
                      score={profileData.test_scores.toefl}
                      date={profileData.test_scores.toeflDate}
                    />
                  )}
                  {profileData.test_scores.ielts && (
                    <ScoreCard
                      title="IELTS"
                      score={profileData.test_scores.ielts}
                      date={profileData.test_scores.ieltsDate}
                    />
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<Trophy className="h-16 w-16" />}
                  title="No test scores added"
                  description="Add your GMAT, GRE, TOEFL, or IELTS scores to strengthen your profile."
                  action={
                    <Button onClick={() => router.push('/profile-setup')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Test Scores
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Career Goals
              </CardTitle>
              <CardDescription>Your academic and career aspirations</CardDescription>
            </CardHeader>
            <CardContent>
              {profileData.target_degree || profileData.target_programs?.length || profileData.career_objective ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <InfoCard
                      label="Target Degree"
                      value={profileData.target_degree?.toUpperCase()}
                      icon={<Target className="h-4 w-4" />}
                    />
                    <InfoCard
                      label="Work Experience"
                      value={profileData.work_experience_category}
                      icon={<Clock className="h-4 w-4" />}
                    />
                  </div>
                  
                  {profileData.target_programs && profileData.target_programs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Target Programs</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.target_programs.map((program: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1">{program}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profileData.preferred_countries && profileData.preferred_countries.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Preferred Countries</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.preferred_countries.map((country: string, index: number) => (
                          <Badge key={index} variant="outline" className="px-3 py-1">
                            <Globe className="h-3 w-3 mr-1" />
                            {country}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profileData.career_objective && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Career Objective</h4>
                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <p className="text-base leading-relaxed">{profileData.career_objective}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<Target className="h-16 w-16" />}
                  title="No career goals set"
                  description="Define your career aspirations and target programs to get personalized guidance."
                  action={
                    <Button onClick={() => router.push('/profile-setup')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Career Goals
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Study Preferences
              </CardTitle>
              <CardDescription>Your preferences for study programs and lifestyle</CardDescription>
            </CardHeader>
            <CardContent>
              {profileData.budget_range || profileData.start_date || profileData.study_mode ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <InfoCard
                      label="Budget Range"
                      value={profileData.budget_range}
                      icon={<DollarSign className="h-4 w-4" />}
                    />
                    <InfoCard
                      label="Preferred Start Date"
                      value={profileData.start_date}
                      icon={<Calendar className="h-4 w-4" />}
                    />
                    <InfoCard
                      label="Study Mode"
                      value={profileData.study_mode}
                      icon={<BookOpen className="h-4 w-4" />}
                    />
                    <InfoCard
                      label="Accommodation"
                      value={profileData.accommodation_preference}
                      icon={<Settings className="h-4 w-4" />}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Scholarship Interest</h4>
                    <Badge variant={profileData.scholarship_interest ? "default" : "secondary"} className="px-3 py-1">
                      {profileData.scholarship_interest ? "Interested in Scholarships" : "Not Interested in Scholarships"}
                    </Badge>
                  </div>
                  
                  {profileData.communication_preferences && profileData.communication_preferences.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Communication Preferences</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.communication_preferences.map((pref: string, index: number) => (
                          <Badge key={index} variant="outline" className="px-3 py-1">{pref}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<Settings className="h-16 w-16" />}
                  title="No preferences set"
                  description="Set your study preferences to help us match you with the best programs."
                  action={
                    <Button onClick={() => router.push('/profile-setup')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Preferences
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper Components
interface InfoCardProps {
  label: string
  value?: string
  icon: React.ReactNode
}

function InfoCard({ label, value, icon }: InfoCardProps) {
  return (
    <div className="space-y-2 p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2">
        <div className="text-muted-foreground">{icon}</div>
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{label}</h4>
      </div>
      <p className="font-semibold text-base text-foreground">
        {value || "Not specified"}
      </p>
    </div>
  )
}

interface ScoreCardProps {
  title: string
  score: string
  date?: string
}

function ScoreCard({ title, score, date }: ScoreCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="space-y-3">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </h4>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-xl px-4 py-2 font-bold bg-primary">
            {score}
          </Badge>
          {date && (
            <span className="text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-6 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}
