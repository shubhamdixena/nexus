"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const steps = [
  { id: "personal", title: "Personal Information" },
  { id: "education", title: "Education Background" },
  { id: "career", title: "Career Goals" },
  { id: "preferences", title: "Preferences" },
]

interface ProfileSetupFormProps {
  initialData?: {
    firstName?: string
    lastName?: string
    email?: string
  }
}

export function ProfileSetupForm({ initialData }: ProfileSetupFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: "",
    nationality: "",
    
    // Education
    highestDegree: "",
    fieldOfStudy: "",
    university: "",
    graduationYear: "",
    gpa: "",
    
    // Career Goals
    targetDegree: "",
    careerObjective: "",
    workExperience: "",
    
    // Preferences
    budgetRange: "",
    startDate: "",
    scholarshipInterest: false,
    accommodationPreference: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  // Load existing profile data on component mount
  React.useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            const profile = data.profile
            setFormData(prev => ({
              ...prev,
              firstName: profile.first_name || prev.firstName,
              lastName: profile.last_name || prev.lastName,
              phone: profile.phone || prev.phone,
              nationality: profile.nationality || prev.nationality,
              highestDegree: profile.highest_degree || prev.highestDegree,
              fieldOfStudy: profile.field_of_study || prev.fieldOfStudy,
              university: profile.university || prev.university,
              graduationYear: profile.graduation_year?.toString() || prev.graduationYear,
              gpa: profile.gpa?.toString() || prev.gpa,
              targetDegree: profile.target_degree || prev.targetDegree,
              careerObjective: profile.career_objective || prev.careerObjective,
              workExperience: profile.work_experience_category || prev.workExperience,
              budgetRange: profile.budget_range || prev.budgetRange,
              startDate: profile.start_date || prev.startDate,
              scholarshipInterest: profile.scholarship_interest || prev.scholarshipInterest,
              accommodationPreference: profile.accommodation_preference || prev.accommodationPreference,
            }))
          }
        }
      } catch (error) {
        console.error('Error loading existing profile:', error)
        // Don't show error toast as this is optional
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingProfile()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    
    try {
      // Only validate absolute minimum required fields (just first and last name)
      const requiredFields = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      }

      // Check for missing required fields (only name fields)
      const missingFields = []
      if (!requiredFields.firstName) missingFields.push("First Name")
      if (!requiredFields.lastName) missingFields.push("Last Name")

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(", ")}`,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      await saveProfile(true) // Save as completed
      
      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Error completing profile:", error)
      toast({
        title: "Error saving profile",
        description: error instanceof Error ? error.message : "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    
    try {
      await saveProfile(false) // Save as draft
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error saving draft",
        description: error instanceof Error ? error.message : "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const saveProfile = async (isComplete: boolean = false) => {
    // Prepare data - only send fields that have values, no defaults needed
    const profileData: any = {}

    // Personal section - only add if values exist
    if (formData.firstName.trim() || formData.lastName.trim() || formData.phone.trim() || formData.nationality) {
      profileData.personal = {}
      if (formData.firstName.trim()) profileData.personal.firstName = formData.firstName.trim()
      if (formData.lastName.trim()) profileData.personal.lastName = formData.lastName.trim()
      if (formData.phone.trim()) profileData.personal.phone = formData.phone.trim()
      if (formData.nationality) profileData.personal.nationality = formData.nationality
    }

    // Education section - only add if any field has a value
    if (formData.highestDegree || formData.fieldOfStudy.trim() || formData.university.trim() || 
        formData.graduationYear.trim() || formData.gpa.trim()) {
      profileData.education = {}
      if (formData.highestDegree) profileData.education.highestDegree = formData.highestDegree
      if (formData.fieldOfStudy.trim()) profileData.education.fieldOfStudy = formData.fieldOfStudy.trim()
      if (formData.university.trim()) profileData.education.university = formData.university.trim()
      if (formData.graduationYear.trim()) profileData.education.graduationYear = formData.graduationYear.trim()
      if (formData.gpa.trim()) profileData.education.gpa = formData.gpa.trim()
    }

    // Goals section - only add if any field has a value
    if (formData.targetDegree || formData.careerObjective.trim() || formData.workExperience) {
      profileData.goals = {}
      if (formData.targetDegree) profileData.goals.targetDegree = formData.targetDegree
      if (formData.careerObjective.trim()) profileData.goals.careerObjective = formData.careerObjective.trim()
      if (formData.workExperience) profileData.goals.workExperience = formData.workExperience
      // Add a default array for targetPrograms if targetDegree is provided
      if (formData.targetDegree) profileData.goals.targetPrograms = [formData.targetDegree]
      // Add default for preferredCountries if not collected in simple form
      if (formData.targetDegree) profileData.goals.preferredCountries = ["US"]
    }

    // Preferences section - only add if any field has a value
    if (formData.budgetRange || formData.startDate || formData.accommodationPreference || 
        formData.scholarshipInterest !== false) {
      profileData.preferences = {}
      if (formData.budgetRange) profileData.preferences.budgetRange = formData.budgetRange
      if (formData.startDate) profileData.preferences.startDate = formData.startDate
      if (formData.accommodationPreference) profileData.preferences.accommodationPreference = formData.accommodationPreference
      profileData.preferences.scholarshipInterest = formData.scholarshipInterest
      // Add default communication preferences
      if (Object.keys(profileData.preferences).length > 0) {
        profileData.preferences.communicationPreferences = ["email"]
      }
    }

    console.log("Sending profile data:", profileData)

    // Save to Supabase via API
    const response = await fetch('/api/profile/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API Error:", errorData)
      console.error("Response status:", response.status)
      console.error("Response statusText:", response.statusText)
      
      // Show more detailed error message
      const errorMessage = errorData.details ? 
        `${errorData.error}: ${JSON.stringify(errorData.details)}` : 
        errorData.error || 'Failed to save profile'
      
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('Profile saved successfully:', result)
    
    // Show completion percentage in success message
    const completionMsg = result.completion ? 
      `${isComplete ? 'Profile completed!' : 'Draft saved!'} Completion: ${result.completion.percentage}%` : 
      `${isComplete ? 'Profile completed!' : 'Draft saved!'}`
    
    toast({
      title: isComplete ? "Profile Completed!" : "Draft Saved!",
      description: completionMsg,
    })

    return result
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`
                flex items-center justify-center w-8 h-8 rounded-full mr-2
                ${
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "border-2 border-primary"
                      : "border-2 border-muted"
                }
              `}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
              </div>
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-muted-foreground/20">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Select value={formData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div>
                <Label htmlFor="highestDegree">Highest Degree Obtained</Label>
                <Select value={formData.highestDegree} onValueChange={(value) => handleInputChange("highestDegree", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your highest degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="highschool">High School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    placeholder="Computer Science"
                    value={formData.fieldOfStudy}
                    onChange={(e) => handleInputChange("fieldOfStudy", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="university">University/Institution</Label>
                  <Input
                    id="university"
                    placeholder="University of Example"
                    value={formData.university}
                    onChange={(e) => handleInputChange("university", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    placeholder="2022"
                    value={formData.graduationYear}
                    onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <Input
                    id="gpa"
                    placeholder="3.8"
                    value={formData.gpa}
                    onChange={(e) => handleInputChange("gpa", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <Label htmlFor="targetDegree">Target Degree</Label>
                <Select value={formData.targetDegree} onValueChange={(value) => handleInputChange("targetDegree", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your target degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mba">MBA</SelectItem>
                    <SelectItem value="ms">Master of Science</SelectItem>
                    <SelectItem value="ma">Master of Arts</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="careerObjective">Career Objective</Label>
                <Textarea
                  id="careerObjective"
                  placeholder="Describe your career goals and aspirations..."
                  className="min-h-[120px]"
                  value={formData.careerObjective}
                  onChange={(e) => handleInputChange("careerObjective", e.target.value)}
                />
              </div>
              
              <div>
                <Label>Work Experience</Label>
                <RadioGroup 
                  value={formData.workExperience} 
                  onValueChange={(value) => handleInputChange("workExperience", value)}
                  className="flex flex-col space-y-1 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0-2" id="exp-0-2" />
                    <Label htmlFor="exp-0-2">0-2 years</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3-5" id="exp-3-5" />
                    <Label htmlFor="exp-3-5">3-5 years</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6-10" id="exp-6-10" />
                    <Label htmlFor="exp-6-10">6-10 years</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10+" id="exp-10plus" />
                    <Label htmlFor="exp-10plus">10+ years</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div>
                <Label htmlFor="budgetRange">Budget Range (USD/Year)</Label>
                <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange("budgetRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-30k">Under $30,000</SelectItem>
                    <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                    <SelectItem value="50k-70k">$50,000 - $70,000</SelectItem>
                    <SelectItem value="70k-100k">$70,000 - $100,000</SelectItem>
                    <SelectItem value="over-100k">Over $100,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startDate">Preferred Start Date</Label>
                <Select value={formData.startDate} onValueChange={(value) => handleInputChange("startDate", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred start date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall-2025">Fall 2025</SelectItem>
                    <SelectItem value="spring-2026">Spring 2026</SelectItem>
                    <SelectItem value="fall-2026">Fall 2026</SelectItem>
                    <SelectItem value="spring-2027">Spring 2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scholarship"
                  checked={formData.scholarshipInterest}
                  onCheckedChange={(checked) => handleInputChange("scholarshipInterest", checked)}
                />
                <Label htmlFor="scholarship">Interested in Scholarships and Financial Aid</Label>
              </div>
              
              <div>
                <Label>Accommodation Preference</Label>
                <RadioGroup 
                  value={formData.accommodationPreference} 
                  onValueChange={(value) => handleInputChange("accommodationPreference", value)}
                  className="flex flex-col space-y-1 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on-campus" id="accom-on" />
                    <Label htmlFor="accom-on">On-campus housing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="off-campus" id="accom-off" />
                    <Label htmlFor="accom-off">Off-campus housing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no-preference" id="accom-none" />
                    <Label htmlFor="accom-none">No preference</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleSaveDraft} 
              disabled={isSavingDraft}
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Draft"
              )}
            </Button>
          </div>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  Complete <Check className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}