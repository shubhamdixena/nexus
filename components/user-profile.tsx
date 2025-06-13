"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Edit, GraduationCap, Mail, MapPin, Loader2, Trophy, Target, Settings, AlertCircle, CheckCircle2, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface LoadError {
  type: 'network' | 'server' | 'unknown'
  message: string
  retryable: boolean
}

export function UserProfile() {
  const [profileData, setProfileData] = useState<any>({})
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
      setRetryCount(0) // Reset retry count on success
      
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

  const handleProfileUpdate = useCallback(() => {
    loadProfile()
  }, [loadProfile])

  // Error state rendering
  if (error && !isLoading) {
    return (
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
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for profile header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
        
        {/* Loading skeleton for tabs */}
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const completionPercentage = profileData.profile_completion_percentage || 0
  const isProfileComplete = completionPercentage >= 80

  return (
    <div className="space-y-8">
      {/* Network status indicator */}
      {!navigator.onLine && (
        <Alert className="border-orange-500 bg-orange-50">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Header */}
      <Card className="shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profileData.avatar_url} />
                <AvatarFallback className="text-xl font-semibold">
                  {profileData.first_name?.charAt(0)}{profileData.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  {profileData.first_name} {profileData.last_name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {profileData.bio || "Student Profile"}
                </CardDescription>
                <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                  {profileData.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profileData.email}
                    </div>
                  )}
                  {profileData.nationality && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profileData.nationality}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button size="lg" onClick={() => router.push('/profile-setup')} className="shadow-sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 border-t">
          {/* Profile Completion Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Profile Completion</span>
              <span className="text-base font-medium text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            {!isProfileComplete && (
              <Alert className="border-l-4 border-l-blue-500">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-base">
                  Complete your profile to get better recommendations and opportunities.
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => router.push('/profile-setup')}
                  >
                    Complete now
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {isProfileComplete && (
              <Alert className="border-green-500 bg-green-50 border-l-4 border-l-green-500">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 text-base">
                  Your profile is complete! You're all set to receive personalized recommendations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="education" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 p-1 mb-8">
          <TabsTrigger value="education" className="flex items-center gap-2 h-10 text-sm font-medium">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2 h-10 text-sm font-medium">
            <Trophy className="h-4 w-4" />
            Test Scores
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2 h-10 text-sm font-medium">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2 h-10 text-sm font-medium">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="education" className="space-y-6 mt-0">
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Education Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Highest Degree</h4>
                  <p className="font-medium text-base">{profileData.highest_degree || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Field of Study</h4>
                  <p className="font-medium text-base">{profileData.field_of_study || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">University</h4>
                  <p className="font-medium text-base">{profileData.university || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Graduation Year</h4>
                  <p className="font-medium text-base">{profileData.graduation_year || "Not specified"}</p>
                </div>
                {profileData.gpa && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">GPA</h4>
                    <p className="font-medium text-base">{profileData.gpa}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6 mt-0">
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Test Scores</CardTitle>
              <CardDescription className="text-base">Standardized test scores for applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                {profileData.test_scores?.gmat && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">GMAT</h4>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xl px-4 py-2 font-bold">
                        {profileData.test_scores.gmat}
                      </Badge>
                      {profileData.test_scores.gmatDate && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(profileData.test_scores.gmatDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {profileData.test_scores?.gre && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">GRE</h4>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xl px-4 py-2 font-bold">
                        {profileData.test_scores.gre}
                      </Badge>
                      {profileData.test_scores.greDate && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(profileData.test_scores.greDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {profileData.test_scores?.toefl && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">TOEFL</h4>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xl px-4 py-2 font-bold">
                        {profileData.test_scores.toefl}
                      </Badge>
                      {profileData.test_scores.toeflDate && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(profileData.test_scores.toeflDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {profileData.test_scores?.ielts && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">IELTS</h4>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xl px-4 py-2 font-bold">
                        {profileData.test_scores.ielts}
                      </Badge>
                      {profileData.test_scores.ieltsDate && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(profileData.test_scores.ieltsDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {!profileData.test_scores?.gmat && !profileData.test_scores?.gre && 
                 !profileData.test_scores?.toefl && !profileData.test_scores?.ielts && (
                  <div className="col-span-2 text-center py-12">
                    <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                    <p className="text-lg text-muted-foreground mb-4">No test scores added yet</p>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="mt-2"
                      onClick={() => router.push('/profile-setup')}
                    >
                      Add Test Scores
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6 mt-0">
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Career Goals</CardTitle>
              <CardDescription className="text-base">Your academic and career aspirations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Target Degree</h4>
                  <p className="font-medium text-base">{profileData.target_degree?.toUpperCase() || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Work Experience</h4>
                  <p className="font-medium text-base">{profileData.work_experience_category || "Not specified"} years</p>
                </div>
              </div>
              
              {profileData.target_programs && profileData.target_programs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Target Programs</h4>
                  <div className="flex flex-wrap gap-3">
                    {profileData.target_programs.map((program: string, index: number) => (
                      <Badge key={index} variant="outline" className="px-3 py-1 text-sm">{program}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profileData.preferred_countries && profileData.preferred_countries.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Preferred Countries</h4>
                  <div className="flex flex-wrap gap-3">
                    {profileData.preferred_countries.map((country: string, index: number) => (
                      <Badge key={index} variant="outline" className="px-3 py-1 text-sm">{country}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profileData.career_objective && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Career Objective</h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-base leading-relaxed">{profileData.career_objective}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 mt-0">
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Study Preferences</CardTitle>
              <CardDescription className="text-base">Your preferences for study programs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Budget Range</h4>
                  <p className="font-medium text-base">{profileData.budget_range || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Preferred Start Date</h4>
                  <p className="font-medium text-base">{profileData.start_date || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Study Mode</h4>
                  <p className="font-medium text-base">{profileData.study_mode || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Accommodation</h4>
                  <p className="font-medium text-base">{profileData.accommodation_preference || "Not specified"}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Scholarship Interest</h4>
                <Badge variant={profileData.scholarship_interest ? "default" : "secondary"} className="px-3 py-1 text-sm">
                  {profileData.scholarship_interest ? "Interested" : "Not interested"}
                </Badge>
              </div>
              
              {profileData.communication_preferences && profileData.communication_preferences.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Communication Preferences</h4>
                  <div className="flex flex-wrap gap-3">
                    {profileData.communication_preferences.map((pref: string, index: number) => (
                      <Badge key={index} variant="outline" className="px-3 py-1 text-sm">{pref}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
