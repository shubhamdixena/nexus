"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  GraduationCap,
  Trophy,
  Target,
  Globe,
  DollarSign,
  Calendar,
  Edit,
  Plus,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { CompactProfileEditForm } from "@/components/compact-profile-edit-form"

interface ProfileData {
  personal?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    dateOfBirth?: string
    nationality?: string
    bio?: string
    linkedinUrl?: string
  }
  education?: {
    highestDegree?: string
    fieldOfStudy?: string
    university?: string
    graduationYear?: string
    gpa?: string
  }
  scores?: {
    gmat?: string
    gre?: string
    toefl?: string
    ielts?: string
    gmatDate?: string
    greDate?: string
    toeflDate?: string
    ieltsDate?: string
  }
  goals?: {
    targetDegree?: string
    targetPrograms?: string[]
    careerObjective?: string
    workExperience?: string
    preferredCountries?: string[]
    industryInterests?: string[]
    careerLevel?: string
  }
  universities?: any[]
  scholarships?: {
    scholarshipInterest?: boolean
    budgetRange?: string
    financialAidNeeded?: boolean
  }
  examPlanning?: {
    plannedExams?: any[]
    currentScores?: any
  }
}

export function ProfileView() {
  const [profileData, setProfileData] = useState<ProfileData>({})
  const [schoolTargets, setSchoolTargets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      loadProfileData()
      loadSchoolTargets()
    }
  }, [user?.id])

  const loadProfileData = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const { profile } = await response.json()
        if (profile) {
          setProfileData({
            personal: {
              firstName: profile.first_name || "",
              lastName: profile.last_name || "",
              email: profile.user?.email || "",
              phone: profile.phone || "",
              dateOfBirth: profile.date_of_birth || "",
              nationality: profile.nationality || "",
              bio: profile.bio || "",
              linkedinUrl: profile.linkedin_url || "",
            },
            education: {
              highestDegree: profile.highest_degree || "",
              fieldOfStudy: profile.field_of_study || "",
              university: profile.university || "",
              graduationYear: profile.graduation_year || "",
              gpa: profile.gpa || "",
            },
            scores: {
              gmat: profile.gmat_score || "",
              gre: profile.gre_score || "",
              toefl: profile.toefl_score || "",
              ielts: profile.ielts_score || "",
              gmatDate: profile.gmat_date || "",
              greDate: profile.gre_date || "",
              toeflDate: profile.toefl_date || "",
              ieltsDate: profile.ielts_date || "",
            },
            goals: {
              targetDegree: profile.target_degree || "",
              careerObjective: profile.career_objective || "",
              workExperience: profile.work_experience || "",
              careerLevel: profile.career_level || "",
            }
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSchoolTargets = async () => {
    try {
      const response = await fetch('/api/school-targets')
      if (response.ok) {
        const data = await response.json()
        setSchoolTargets(data.targets || [])
      }
    } catch (error) {
      console.error('Error loading school targets:', error)
    }
  }

  const calculateCompletionPercentage = () => {
    const sections = [
      profileData.personal?.firstName && profileData.personal?.lastName,
      profileData.education?.university,
      profileData.scores?.gmat || profileData.scores?.gre,
      profileData.goals?.careerObjective,
      schoolTargets.length > 0,
    ]
    
    const completed = sections.filter(Boolean).length
    return Math.round((completed / sections.length) * 100)
  }

  const getInitials = () => {
    const first = profileData.personal?.firstName?.[0] || ""
    const last = profileData.personal?.lastName?.[0] || ""
    return (first + last).toUpperCase() || "U"
  }

  const getFullName = () => {
    const first = profileData.personal?.firstName || ""
    const last = profileData.personal?.lastName || ""
    return first && last ? `${first} ${last}` : "Complete your profile"
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{getFullName()}</h1>
                
                {profileData.personal?.bio && (
                  <p className="text-muted-foreground max-w-md">
                    {profileData.personal.bio}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {profileData.personal?.nationality && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profileData.personal.nationality}</span>
                    </div>
                  )}
                  
                  {profileData.personal?.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{profileData.personal.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Profile Completion</span>
                <Badge variant={calculateCompletionPercentage() === 100 ? "default" : "secondary"}>
                  {calculateCompletionPercentage()}%
                </Badge>
              </div>
              <Progress value={calculateCompletionPercentage()} className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Personal Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <CardTitle className="text-base">Personal Info</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Personal Information</DialogTitle>
                  <DialogDescription>
                    Update your personal details and contact information
                  </DialogDescription>
                </DialogHeader>
                <CompactProfileEditForm 
                  section="personal" 
                  data={profileData.personal || {}}
                  onSave={(data) => {
                    setProfileData(prev => ({ ...prev, personal: data }))
                    loadProfileData() // Refresh from server
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {profileData.personal?.firstName ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">
                    {profileData.personal.firstName} {profileData.personal.lastName}
                  </span>
                </div>
                
                {profileData.personal.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm">{profileData.personal.phone}</span>
                  </div>
                )}
                
                {profileData.personal.dateOfBirth && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Birth Date</span>
                    <span className="text-sm">{new Date(profileData.personal.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                
                {profileData.personal.linkedinUrl && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">LinkedIn</span>
                    <a 
                      href={profileData.personal.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No personal information added</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Personal Information</DialogTitle>
                      <DialogDescription>
                        Add your personal details and contact information
                      </DialogDescription>
                    </DialogHeader>
                    <CompactProfileEditForm 
                      section="personal" 
                      data={{}}
                      onSave={(data) => {
                        setProfileData(prev => ({ ...prev, personal: data }))
                        loadProfileData()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <CardTitle className="text-base">Education</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Education Background</DialogTitle>
                  <DialogDescription>
                    Update your academic qualifications and educational history
                  </DialogDescription>
                </DialogHeader>
                <CompactProfileEditForm 
                  section="education" 
                  data={profileData.education || {}}
                  onSave={(data) => {
                    setProfileData(prev => ({ ...prev, education: data }))
                    loadProfileData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {profileData.education?.university ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Degree</span>
                  <span className="text-sm font-medium">{profileData.education.highestDegree}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Field</span>
                  <span className="text-sm">{profileData.education.fieldOfStudy}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">University</span>
                  <span className="text-sm">{profileData.education.university}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Graduation</span>
                  <span className="text-sm">{profileData.education.graduationYear}</span>
                </div>
                
                {profileData.education.gpa && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">GPA</span>
                    <span className="text-sm">{profileData.education.gpa}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <GraduationCap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No education details added</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Education Background</DialogTitle>
                      <DialogDescription>
                        Add your academic qualifications and educational history
                      </DialogDescription>
                    </DialogHeader>
                    <CompactProfileEditForm 
                      section="education" 
                      data={{}}
                      onSave={(data) => {
                        setProfileData(prev => ({ ...prev, education: data }))
                        loadProfileData()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Scores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <CardTitle className="text-base">Test Scores</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Test Scores</DialogTitle>
                  <DialogDescription>
                    Update your standardized test scores and exam dates
                  </DialogDescription>
                </DialogHeader>
                <CompactProfileEditForm 
                  section="scores" 
                  data={profileData.scores || {}}
                  onSave={(data) => {
                    setProfileData(prev => ({ ...prev, scores: data }))
                    loadProfileData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {(profileData.scores?.gmat || profileData.scores?.gre || profileData.scores?.toefl || profileData.scores?.ielts) ? (
              <>
                {profileData.scores.gmat && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">GMAT</span>
                    <span className="text-sm font-medium">{profileData.scores.gmat}</span>
                  </div>
                )}
                
                {profileData.scores.gre && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">GRE</span>
                    <span className="text-sm font-medium">{profileData.scores.gre}</span>
                  </div>
                )}
                
                {profileData.scores.toefl && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TOEFL</span>
                    <span className="text-sm font-medium">{profileData.scores.toefl}</span>
                  </div>
                )}
                
                {profileData.scores.ielts && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">IELTS</span>
                    <span className="text-sm font-medium">{profileData.scores.ielts}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No test scores added</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Scores
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Test Scores</DialogTitle>
                      <DialogDescription>
                        Add your standardized test scores and exam dates
                      </DialogDescription>
                    </DialogHeader>
                    <CompactProfileEditForm 
                      section="scores" 
                      data={{}}
                      onSave={(data) => {
                        setProfileData(prev => ({ ...prev, scores: data }))
                        loadProfileData()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <CardTitle className="text-base">Career Goals</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Career Goals</DialogTitle>
                  <DialogDescription>
                    Update your career objectives and aspirations
                  </DialogDescription>
                </DialogHeader>
                <CompactProfileEditForm 
                  section="goals" 
                  data={profileData.goals || {}}
                  onSave={(data) => {
                    setProfileData(prev => ({ ...prev, goals: data }))
                    loadProfileData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {profileData.goals?.targetDegree ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Target Degree</span>
                  <span className="text-sm font-medium">{profileData.goals.targetDegree}</span>
                </div>
                
                {profileData.goals.careerLevel && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Career Level</span>
                    <span className="text-sm">{profileData.goals.careerLevel}</span>
                  </div>
                )}
                
                {profileData.goals.careerObjective && (
                  <div>
                    <span className="text-sm text-muted-foreground">Objective</span>
                    <p className="text-sm mt-1 line-clamp-3">{profileData.goals.careerObjective}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No career goals defined</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goals
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Career Goals</DialogTitle>
                      <DialogDescription>
                        Define your career objectives and aspirations
                      </DialogDescription>
                    </DialogHeader>
                    <CompactProfileEditForm 
                      section="goals" 
                      data={{}}
                      onSave={(data) => {
                        setProfileData(prev => ({ ...prev, goals: data }))
                        loadProfileData()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Schools */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <CardTitle className="text-base">Target Schools</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Manage Target Schools</DialogTitle>
                  <DialogDescription>
                    Add and manage your target universities and programs
                  </DialogDescription>
                </DialogHeader>
                <CompactProfileEditForm 
                  section="universities" 
                  data={{ schoolTargets }}
                  onSave={(data) => {
                    loadSchoolTargets() // Refresh school targets
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {schoolTargets.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Schools</span>
                  <Badge variant="outline">{schoolTargets.length}</Badge>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {schoolTargets.slice(0, 3).map((target, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate flex-1">{target.school_name}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          target.target_category === 'dream' ? 'border-red-200 text-red-700' :
                          target.target_category === 'target' ? 'border-blue-200 text-blue-700' :
                          'border-green-200 text-green-700'
                        }
                      >
                        {target.target_category}
                      </Badge>
                    </div>
                  ))}
                  
                  {schoolTargets.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{schoolTargets.length - 3} more schools
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No target schools selected</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Schools
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Target Schools</DialogTitle>
                      <DialogDescription>
                        Select your target universities and programs
                      </DialogDescription>
                    </DialogHeader>
                    <CompactProfileEditForm 
                      section="universities" 
                      data={{ schoolTargets: [] }}
                      onSave={(data) => {
                        loadSchoolTargets()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Planning */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <CardTitle className="text-base">Financial Planning</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Financial Planning</DialogTitle>
                  <DialogDescription>
                    Update your financial aid and scholarship information
                  </DialogDescription>
                </DialogHeader>
                <CompactProfileEditForm 
                  section="scholarships" 
                  data={profileData.scholarships || {}}
                  onSave={(data) => {
                    setProfileData(prev => ({ ...prev, scholarships: data }))
                    loadProfileData()
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {profileData.scholarships?.budgetRange ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Budget Range</span>
                  <span className="text-sm font-medium">{profileData.scholarships.budgetRange}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Scholarship Interest</span>
                  {profileData.scholarships.scholarshipInterest ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Financial Aid Needed</span>
                  {profileData.scholarships.financialAidNeeded ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No financial planning info</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Financial Planning</DialogTitle>
                      <DialogDescription>
                        Add your financial aid and scholarship information
                      </DialogDescription>
                    </DialogHeader>
                    <CompactProfileEditForm 
                      section="scholarships" 
                      data={{}}
                      onSave={(data) => {
                        setProfileData(prev => ({ ...prev, scholarships: data }))
                        loadProfileData()
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}