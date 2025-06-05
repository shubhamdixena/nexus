"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { Edit, GraduationCap, Mail, MapPin, Loader2, Trophy, Target, Settings, AlertCircle, CheckCircle2, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProfileSetupModal } from "@/components/profile-setup-modal"
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
    <div className="space-y-6">
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar_url} />
                <AvatarFallback className="text-lg">
                  {profileData.first_name?.charAt(0)}{profileData.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {profileData.first_name} {profileData.last_name}
                </CardTitle>
                <CardDescription className="text-base">
                  {profileData.bio || "Student Profile"}
                </CardDescription>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
            <ProfileSetupModal onProfileUpdate={handleProfileUpdate}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </ProfileSetupModal>
          </div>
        </CardHeader>
        <CardContent>
          {/* Profile Completion Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            {!isProfileComplete && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Complete your profile to get better recommendations and opportunities.
                  <ProfileSetupModal onProfileUpdate={handleProfileUpdate}>
                    <Button variant="link" className="p-0 h-auto ml-1">
                      Complete now
                    </Button>
                  </ProfileSetupModal>
                </AlertDescription>
              </Alert>
            )}
            {isProfileComplete && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your profile is complete! You're all set to receive personalized recommendations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="education" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Test Scores
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="education" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Education Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Highest Degree</h4>
                  <p className="font-medium">{profileData.highest_degree || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Field of Study</h4>
                  <p className="font-medium">{profileData.field_of_study || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">University</h4>
                  <p className="font-medium">{profileData.university || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Graduation Year</h4>
                  <p className="font-medium">{profileData.graduation_year || "Not specified"}</p>
                </div>
                {profileData.gpa && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">GPA</h4>
                    <p className="font-medium">{profileData.gpa}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Scores</CardTitle>
              <CardDescription>Standardized test scores for applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {profileData.test_scores?.gmat && (
                  <div className="space-y-2">
                    <h4 className="font-medium">GMAT</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
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
                  <div className="space-y-2">
                    <h4 className="font-medium">GRE</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
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
                  <div className="space-y-2">
                    <h4 className="font-medium">TOEFL</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
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
                  <div className="space-y-2">
                    <h4 className="font-medium">IELTS</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
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
                  <div className="col-span-2 text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No test scores added yet</p>
                    <ProfileSetupModal onProfileUpdate={handleProfileUpdate}>
                      <Button variant="outline" className="mt-2">
                        Add Test Scores
                      </Button>
                    </ProfileSetupModal>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Career Goals</CardTitle>
              <CardDescription>Your academic and career aspirations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Target Degree</h4>
                  <p className="font-medium">{profileData.target_degree?.toUpperCase() || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Work Experience</h4>
                  <p className="font-medium">{profileData.work_experience_category || "Not specified"} years</p>
                </div>
              </div>
              
              {profileData.target_programs && profileData.target_programs.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Target Programs</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.target_programs.map((program: string, index: number) => (
                      <Badge key={index} variant="outline">{program}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profileData.preferred_countries && profileData.preferred_countries.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Preferred Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferred_countries.map((country: string, index: number) => (
                      <Badge key={index} variant="outline">{country}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profileData.career_objective && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Career Objective</h4>
                  <p className="text-sm leading-relaxed">{profileData.career_objective}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
              <CardDescription>Your preferences for study programs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Budget Range</h4>
                  <p className="font-medium">{profileData.budget_range || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Preferred Start Date</h4>
                  <p className="font-medium">{profileData.start_date || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Study Mode</h4>
                  <p className="font-medium">{profileData.study_mode || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Accommodation</h4>
                  <p className="font-medium">{profileData.accommodation_preference || "Not specified"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Scholarship Interest</h4>
                <Badge variant={profileData.scholarship_interest ? "default" : "secondary"}>
                  {profileData.scholarship_interest ? "Interested" : "Not interested"}
                </Badge>
              </div>
              
              {profileData.communication_preferences && profileData.communication_preferences.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Communication Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.communication_preferences.map((pref: string, index: number) => (
                      <Badge key={index} variant="outline">{pref}</Badge>
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
