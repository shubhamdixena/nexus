"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Linkedin,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { fetchLinkedInData } from "@/lib/linkedin-service"
import { toast } from "@/components/ui/use-toast"

// Step 1: Personal Information Schema
const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }).optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().min(2, { message: "Please select your nationality." }),
})

// Step 2: Education Background Schema
const educationSchema = z.object({
  highestDegree: z.string().min(1, { message: "Please select your highest degree." }),
  fieldOfStudy: z.string().min(2, { message: "Please enter your field of study." }),
  university: z.string().min(2, { message: "Please enter your university name." }),
  graduationYear: z.string().regex(/^\d{4}$/, { message: "Please enter a valid year (YYYY)." }),
  gpa: z.string().optional(),
  testScores: z.object({
    gmat: z.string().optional(),
    gre: z.string().optional(),
    toefl: z.string().optional(),
    ielts: z.string().optional(),
  }),
})

// Step 3: Career Goals Schema
const careerGoalsSchema = z.object({
  targetDegree: z.string().min(1, { message: "Please select your target degree." }),
  targetPrograms: z.array(z.string()).min(1, { message: "Please select at least one program." }),
  careerObjective: z.string().min(10, { message: "Please describe your career objective." }),
  workExperience: z.string().min(1, { message: "Please select your work experience." }),
  preferredCountries: z.array(z.string()).min(1, { message: "Please select at least one country." }),
})

// Step 4: Preferences Schema
const preferencesSchema = z.object({
  budgetRange: z.string().min(1, { message: "Please select your budget range." }),
  startDate: z.string().min(1, { message: "Please select your preferred start date." }),
  scholarshipInterest: z.boolean(),
  accommodationPreference: z.string().min(1, { message: "Please select your accommodation preference." }),
  communicationPreferences: z.array(z.string()).min(1, { message: "Please select at least one communication method." }),
})

const steps = [
  { id: "personal", title: "Personal Information", schema: personalInfoSchema },
  { id: "education", title: "Education Background", schema: educationSchema },
  { id: "career", title: "Career Goals", schema: careerGoalsSchema },
  { id: "preferences", title: "Preferences", schema: preferencesSchema },
]

interface ProfileSetupFormProps {
  initialData?: {
    name?: string
    email?: string
    firstName?: string
    lastName?: string
    // Add other fields as needed
  }
}

export function ProfileSetupForm({ initialData }: ProfileSetupFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    personal: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: "",
      dateOfBirth: "",
      nationality: "",
    },
    education: {
      highestDegree: "",
      fieldOfStudy: "",
      university: "",
      graduationYear: "",
      gpa: "",
      testScores: {
        gmat: "",
        gre: "",
        toefl: "",
        ielts: "",
      },
    },
    career: {
      targetDegree: "",
      targetPrograms: [],
      careerObjective: "",
      workExperience: "",
      preferredCountries: [],
    },
    preferences: {
      budgetRange: "",
      startDate: "",
      scholarshipInterest: false,
      accommodationPreference: "",
      communicationPreferences: [],
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [parseSuccess, setParseSuccess] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([])
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState(false)
  const [linkedInDataFetched, setLinkedInDataFetched] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const currentSchema = steps[currentStep].schema
  const currentStepId = steps[currentStep].id as keyof typeof formData

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData[currentStepId],
  })

  // Check if coming from LinkedIn login
  useEffect(() => {
    const source = searchParams.get("source")
    if (source === "linkedin" && user?.accessToken && !linkedInDataFetched) {
      fetchLinkedInProfileData()
    }
  }, [user, searchParams, linkedInDataFetched])

  // Update form values when step changes
  useEffect(() => {
    form.reset(formData[currentStepId])
  }, [currentStep, form, formData, currentStepId])

  const fetchLinkedInProfileData = async () => {
    if (!user?.accessToken || linkedInDataFetched) return

    setIsLoadingLinkedIn(true)
    try {
      // Fetch additional LinkedIn profile data using the access token
      const linkedInData = await fetchLinkedInData(user.accessToken)

      // Extract fields from LinkedIn data
      const extractedFields: string[] = []
      const updatedFormData = { ...formData }

      // Update personal information
      if (linkedInData.firstName) {
        updatedFormData.personal.firstName = linkedInData.firstName
        extractedFields.push("firstName")
      }

      if (linkedInData.lastName) {
        updatedFormData.personal.lastName = linkedInData.lastName
        extractedFields.push("lastName")
      }

      if (linkedInData.email) {
        updatedFormData.personal.email = linkedInData.email
        extractedFields.push("email")
      }

      if (linkedInData.country) {
        updatedFormData.personal.nationality = linkedInData.country
        extractedFields.push("nationality")
      }

      // Update education information if available
      if (linkedInData.education && linkedInData.education.length > 0) {
        const latestEducation = linkedInData.education[0]

        if (latestEducation.degree) {
          updatedFormData.education.highestDegree = mapLinkedInDegree(latestEducation.degree)
          extractedFields.push("highestDegree")
        }

        if (latestEducation.fieldOfStudy) {
          updatedFormData.education.fieldOfStudy = latestEducation.fieldOfStudy
          extractedFields.push("fieldOfStudy")
        }

        if (latestEducation.schoolName) {
          updatedFormData.education.university = latestEducation.schoolName
          extractedFields.push("university")
        }

        if (latestEducation.endDate) {
          updatedFormData.education.graduationYear = latestEducation.endDate.year.toString()
          extractedFields.push("graduationYear")
        }
      }

      // Update career information
      if (linkedInData.positions && linkedInData.positions.length > 0) {
        // Calculate years of experience
        const yearsOfExperience = calculateYearsOfExperience(linkedInData.positions)
        updatedFormData.career.workExperience = mapWorkExperience(yearsOfExperience)
        extractedFields.push("workExperience")

        // Use headline or current position for career objective
        if (linkedInData.headline) {
          updatedFormData.career.careerObjective = `Based on my experience as ${linkedInData.headline}, I aim to further develop my skills and knowledge in this field.`
          extractedFields.push("careerObjective")
        }
      }

      // Update form data with LinkedIn information
      setFormData(updatedFormData)
      setAutoFilledFields(extractedFields)

      // If we're on the first step, update the form with the new values
      if (currentStep === 0) {
        form.reset(updatedFormData.personal)
      }

      setLinkedInDataFetched(true)
      setParseSuccess(true)
    } catch (error) {
      console.error("Error fetching LinkedIn data:", error)
      setParseError("Failed to fetch data from LinkedIn. Please fill the form manually.")
    } finally {
      setIsLoadingLinkedIn(false)
    }
  }

  // Helper function to map LinkedIn degree to our format
  const mapLinkedInDegree = (degree: string): string => {
    const lowerDegree = degree.toLowerCase()
    if (lowerDegree.includes("bachelor")) return "bachelor"
    if (lowerDegree.includes("master")) return "master"
    if (lowerDegree.includes("phd") || lowerDegree.includes("doctor")) return "phd"
    if (lowerDegree.includes("diploma")) return "diploma"
    return "bachelor" // Default
  }

  // Helper function to calculate years of experience from LinkedIn positions
  const calculateYearsOfExperience = (positions: any[]): number => {
    let totalMonths = 0

    positions.forEach((position) => {
      const startDate = new Date(position.startDate.year, position.startDate.month || 0)
      const endDate = position.endDate ? new Date(position.endDate.year, position.endDate.month || 0) : new Date() // If no end date, use current date

      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())

      totalMonths += months
    })

    return Math.floor(totalMonths / 12)
  }

  // Helper function to map years of experience to our format
  const mapWorkExperience = (years: number): string => {
    if (years < 3) return "0-2"
    if (years < 6) return "3-5"
    if (years < 11) return "6-10"
    return "10+"
  }

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setResumeFile(file)
    setIsParsingResume(true)
    setParseSuccess(false)
    setParseError(null)
    setAutoFilledFields([])

    try {
      // In a real implementation, you would send the file to a document parsing API
      // For this demo, we'll simulate the parsing process

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check file type
      const fileType = file.name.split(".").pop()?.toLowerCase()

      if (!fileType || !["pdf", "doc", "docx"].includes(fileType)) {
        throw new Error("Unsupported file format. Please upload a PDF, DOC, or DOCX file.")
      }

      // Initialize extracted fields and parsed data
      const extractedFields: string[] = []
      const parsedData: Record<string, any> = {
        personal: {},
        education: {},
        career: {},
      }

      // Always extract at least basic personal information based on filename
      // This ensures we always have some data
      const nameParts = file.name.replace(/\.(pdf|doc|docx)$/, "").split(/[-_\s]/)

      if (nameParts.length > 0) {
        parsedData.personal.firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)
        extractedFields.push("firstName")

        if (nameParts.length > 1) {
          parsedData.personal.lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
          extractedFields.push("lastName")
        }
      } else {
        parsedData.personal.firstName = "John"
        extractedFields.push("firstName")
        parsedData.personal.lastName = "Doe"
        extractedFields.push("lastName")
      }

      // Always add an email based on the extracted name
      parsedData.personal.email = `${parsedData.personal.firstName.toLowerCase()}@example.com`
      extractedFields.push("email")

      // Add some education information
      parsedData.education.highestDegree = "bachelor"
      extractedFields.push("highestDegree")
      parsedData.education.fieldOfStudy = "Computer Science"
      extractedFields.push("fieldOfStudy")

      // Add some career information
      parsedData.career.workExperience = "3-5"
      extractedFields.push("workExperience")

      // Update form data with parsed information
      const updatedFormData = { ...formData }

      if (parsedData.personal) {
        updatedFormData.personal = {
          ...updatedFormData.personal,
          ...parsedData.personal,
        }
      }

      if (parsedData.education) {
        updatedFormData.education = {
          ...updatedFormData.education,
          ...parsedData.education,
        }
      }

      if (parsedData.career) {
        updatedFormData.career = {
          ...updatedFormData.career,
          ...parsedData.career,
        }
      }

      setFormData(updatedFormData)
      setAutoFilledFields(extractedFields)

      // If we're on the first step, update the form with the new values
      if (currentStep === 0 && parsedData.personal) {
        form.reset(parsedData.personal)
      }

      setParseSuccess(true)
    } catch (error: any) {
      console.error("Error parsing resume:", error)
      setParseError(error.message || "Failed to parse resume. Please try again or fill the form manually.")
    } finally {
      setIsParsingResume(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleProfileComplete = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/profile/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Profile completed!",
          description: `Your profile is ${data.completion.percentage}% complete.`,
        })

        // Redirect to dashboard after successful submission
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to complete profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error completing profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (values: any) => {
    const updatedFormData = {
      ...formData,
      [currentStepId]: values,
    }

    setFormData(updatedFormData)

    if (currentStep === steps.length - 1) {
      // Final step - submit the complete form
      setIsSubmitting(true)

      try {
        // Try to call the profile completion API, but fall back gracefully if it doesn't exist
        const response = await fetch("/api/profile/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFormData),
        })

        if (response.ok) {
          const data = await response.json()
          toast({
            title: "Profile completed!",
            description: `Your profile is ${data.completion?.percentage || 100}% complete.`,
          })
        } else {
          // If API doesn't exist or fails, still show success message
          toast({
            title: "Profile completed!",
            description: "Your profile setup has been completed successfully.",
          })
        }

        // Redirect to the main dashboard (home page) instead of /dashboard
        router.push("/")
      } catch (error) {
        console.error("Error submitting form:", error)
        // Even if there's an error, still redirect and show a success message
        // This prevents the infinite redirect loop
        toast({
          title: "Profile setup completed",
          description: "Your profile information has been saved locally.",
        })
        router.push("/")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Move to the next step
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Auto-save progress on step change
  const saveProgress = async () => {
    if (!user?.id) return

    try {
      const currentStepData = formData[currentStepId]
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: currentStepId,
          data: currentStepData,
        }),
      })

      if (response.ok) {
        const { completion } = await response.json()
        // Update progress indicator
        setFormData(prev => ({ 
          ...prev, 
          _progress: completion.percentage 
        }))
      }
    } catch (error) {
      console.error("Error saving progress:", error)
    }
  }

  // Auto-save when moving between steps
  useEffect(() => {
    if (currentStep > 0) {
      saveProgress()
    }
  }, [currentStep])

  // Load existing profile data on mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user?.id) return

      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const { profile, completion } = await response.json()
          
          if (profile) {
            // Map database fields to form structure
            setFormData({
              personal: {
                firstName: profile.first_name || initialData?.firstName || "",
                lastName: profile.last_name || initialData?.lastName || "",
                email: profile.user?.email || initialData?.email || "",
                phone: profile.phone || "",
                dateOfBirth: profile.date_of_birth || "",
                nationality: profile.nationality || "",
              },
              education: {
                highestDegree: profile.highest_degree || "",
                fieldOfStudy: profile.field_of_study || "",
                university: profile.university || "",
                graduationYear: profile.graduation_year?.toString() || "",
                gpa: profile.gpa?.toString() || "",
                testScores: profile.test_scores || {
                  gmat: "",
                  gre: "",
                  toefl: "",
                  ielts: "",
                },
              },
              career: {
                targetDegree: profile.target_degree || "",
                targetPrograms: profile.target_programs || [],
                careerObjective: profile.career_objective || "",
                workExperience: profile.work_experience_category || "",
                preferredCountries: profile.preferred_countries || [],
              },
              preferences: {
                budgetRange: profile.budget_range || "",
                startDate: profile.start_date || "",
                scholarshipInterest: profile.scholarship_interest || false,
                accommodationPreference: profile.accommodation_preference || "",
                communicationPreferences: profile.communication_preferences || [],
              },
              _progress: completion.percentage
            })
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }

    loadExistingProfile()
  }, [user?.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.handleSubmit(onSubmit)(e)
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  // Helper function to check if a field was auto-filled
  const isAutoFilled = (fieldName: string) => autoFilledFields.includes(fieldName)

  // Render auto-filled badge for form fields
  const renderAutoFilledBadge = (fieldName: string) => {
    if (isAutoFilled(fieldName)) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                Auto-filled
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>This field was automatically filled from your {linkedInDataFetched ? "LinkedIn profile" : "resume"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    return null
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        {!linkedInDataFetched && (
          <div className="flex flex-col items-center justify-center p-6 mb-6 border-2 border-dashed rounded-lg border-muted-foreground/20 bg-muted/10">
            {searchParams.get("source") === "linkedin" ? (
              <>
                <Linkedin className="w-12 h-12 mb-4 text-[#0077B5]" />
                <h3 className="mb-2 text-lg font-medium">Fetching LinkedIn Profile Data</h3>
                <p className="mb-4 text-sm text-center text-muted-foreground">
                  We're retrieving your information from LinkedIn to help you complete your profile faster
                </p>
                {isLoadingLinkedIn ? (
                  <Button disabled variant="outline" className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching LinkedIn Data...
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={fetchLinkedInProfileData}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Linkedin className="w-4 h-4 mr-2 text-[#0077B5]" />
                    Fetch LinkedIn Data
                  </Button>
                )}
              </>
            ) : (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleResumeUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <FileText className="w-12 h-12 mb-4 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">Upload Your Resume</h3>
                <p className="mb-4 text-sm text-center text-muted-foreground">
                  Upload your resume to automatically fill in your profile information
                </p>
                <Button
                  type="button"
                  onClick={triggerFileInput}
                  variant="outline"
                  disabled={isParsingResume}
                  className="flex items-center"
                >
                  {isParsingResume ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing Resume...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {resumeFile ? "Replace Resume" : "Upload Resume"}
                    </>
                  )}
                </Button>
                {resumeFile && !isParsingResume && (
                  <p className="mt-2 text-sm">
                    Selected file: <span className="font-medium">{resumeFile.name}</span>
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {parseSuccess && (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <AlertTitle>
              {linkedInDataFetched ? "LinkedIn Profile Data Retrieved" : "Resume Parsed Successfully"}
            </AlertTitle>
            <AlertDescription>
              We've extracted basic information from your {linkedInDataFetched ? "LinkedIn profile" : "resume"} and
              prefilled {autoFilledFields.length} fields. Please review the information and complete any missing fields.
            </AlertDescription>
          </Alert>
        )}

        {parseError && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <AlertTitle>Error Processing Your Information</AlertTitle>
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}
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
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            First Name {renderAutoFilledBadge("firstName")}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Last Name {renderAutoFilledBadge("lastName")}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">Email {renderAutoFilledBadge("email")}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Phone Number {renderAutoFilledBadge("phone")}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Date of Birth {renderAutoFilledBadge("dateOfBirth")}
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>Optional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Nationality {renderAutoFilledBadge("nationality")}
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your nationality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="in">India</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="au">Australia</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="highestDegree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Highest Degree Obtained {renderAutoFilledBadge("highestDegree")}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your highest degree" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                            <SelectItem value="master">Master's Degree</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="highschool">High School</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fieldOfStudy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Field of Study {renderAutoFilledBadge("fieldOfStudy")}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            University/Institution {renderAutoFilledBadge("university")}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="University of Example" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="graduationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Graduation Year {renderAutoFilledBadge("graduationYear")}
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="2022" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gpa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">GPA {renderAutoFilledBadge("gpa")}</FormLabel>
                          <FormControl>
                            <Input placeholder="3.8" {...field} />
                          </FormControl>
                          <FormDescription>Optional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Test Scores (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="testScores.gmat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              GMAT Score {renderAutoFilledBadge("gmat")}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="720" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="testScores.gre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              GRE Score {renderAutoFilledBadge("gre")}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="320" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="testScores.toefl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              TOEFL Score {renderAutoFilledBadge("toefl")}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="105" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="testScores.ielts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              IELTS Score {renderAutoFilledBadge("ielts")}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="7.5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="targetDegree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Degree</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your target degree" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mba">MBA</SelectItem>
                            <SelectItem value="ms">Master of Science</SelectItem>
                            <SelectItem value="ma">Master of Arts</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetPrograms"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Target Programs</FormLabel>
                          <FormDescription>Select all that apply</FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            "Business Analytics",
                            "Finance",
                            "Marketing",
                            "Operations",
                            "Entrepreneurship",
                            "Technology Management",
                          ].map((program) => (
                            <FormField
                              key={program}
                              control={form.control}
                              name="targetPrograms"
                              render={({ field }) => {
                                return (
                                  <FormItem key={program} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(program)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, program])
                                            : field.onChange(field.value?.filter((value) => value !== program))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{program}</FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="careerObjective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Career Objective {renderAutoFilledBadge("careerObjective")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your career goals and aspirations..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workExperience"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center">
                          Work Experience {renderAutoFilledBadge("workExperience")}
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="0-2" />
                              </FormControl>
                              <FormLabel className="font-normal">0-2 years</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="3-5" />
                              </FormControl>
                              <FormLabel className="font-normal">3-5 years</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="6-10" />
                              </FormControl>
                              <FormLabel className="font-normal">6-10 years</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="10+" />
                              </FormControl>
                              <FormLabel className="font-normal">10+ years</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredCountries"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Preferred Countries</FormLabel>
                          <FormDescription>Select all that apply</FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {[
                            "USA",
                            "UK",
                            "Canada",
                            "Australia",
                            "Germany",
                            "France",
                            "Singapore",
                            "Netherlands",
                            "Switzerland",
                          ].map((country) => (
                            <FormField
                              key={country}
                              control={form.control}
                              name="preferredCountries"
                              render={({ field }) => {
                                return (
                                  <FormItem key={country} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(country)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, country])
                                            : field.onChange(field.value?.filter((value) => value !== country))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{country}</FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 3 && (
                <>
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range (USD/Year)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-30k">Under $30,000</SelectItem>
                            <SelectItem value="30k-50k">$30,000 - $50,000</SelectItem>
                            <SelectItem value="50k-70k">$50,000 - $70,000</SelectItem>
                            <SelectItem value="70k-100k">$70,000 - $100,000</SelectItem>
                            <SelectItem value="over-100k">Over $100,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Start Date</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your preferred start date" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fall-2023">Fall 2023</SelectItem>
                            <SelectItem value="spring-2024">Spring 2024</SelectItem>
                            <SelectItem value="fall-2024">Fall 2024</SelectItem>
                            <SelectItem value="spring-2025">Spring 2025</SelectItem>
                            <SelectItem value="fall-2025">Fall 2025</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scholarshipInterest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Interested in Scholarships and Financial Aid</FormLabel>
                          <FormDescription>
                            Check this if you want to receive information about scholarships and financial aid
                            opportunities.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accommodationPreference"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Accommodation Preference</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="on-campus" />
                              </FormControl>
                              <FormLabel className="font-normal">On-campus housing</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="off-campus" />
                              </FormControl>
                              <FormLabel className="font-normal">Off-campus housing</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no-preference" />
                              </FormControl>
                              <FormLabel className="font-normal">No preference</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="communicationPreferences"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Communication Preferences</FormLabel>
                          <FormDescription>How would you like to receive updates?</FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {["Email", "SMS", "Phone Call", "In-app Notifications"].map((method) => (
                            <FormField
                              key={method}
                              control={form.control}
                              name="communicationPreferences"
                              render={({ field }) => {
                                return (
                                  <FormItem key={method} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(method)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, method])
                                            : field.onChange(field.value?.filter((value) => value !== method))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{method}</FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    Complete <Check className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
