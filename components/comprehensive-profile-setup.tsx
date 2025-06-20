"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  User,
  GraduationCap,
  Target,
  Settings,
  Trophy,
  Globe,
  DollarSign,
  Calendar,
  Home,
  Bell,
  Plus,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { EnhancedSchoolSelector } from "@/components/enhanced-school-selector"

// Comprehensive schemas for all profile sections - all fields optional
const personalInfoSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().optional(),
})

const educationSchema = z.object({
  highestDegree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.string().optional(),
  gpa: z.string().optional(),
})

const testScoresSchema = z.object({
  gmat: z.string().optional(),
  gre: z.string().optional(),
  toefl: z.string().optional(),
  ielts: z.string().optional(),
  gmatDate: z.string().optional(),
  greDate: z.string().optional(),
  toeflDate: z.string().optional(),
  ieltsDate: z.string().optional(),
})

const careerGoalsSchema = z.object({
  targetDegree: z.string().optional(),
  targetPrograms: z.array(z.string()).optional(),
  careerObjective: z.string().optional(),
  workExperience: z.string().optional(),
  preferredCountries: z.array(z.string()).optional(),
  industryInterests: z.array(z.string()).optional(),
  careerLevel: z.string().optional(),
})

const targetUniversitiesSchema = z.object({
  targetUniversities: z.array(z.object({
    name: z.string(),
    program: z.string(),
    priority: z.string(),
  })).optional(),
})

const scholarshipsSchema = z.object({
  scholarshipInterest: z.boolean().optional(),
  targetScholarships: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
  financialAidNeeded: z.boolean().optional(),
})

const examPlanningSchema = z.object({
  plannedExams: z.array(z.object({
    examType: z.string(),
    plannedDate: z.string(),
    targetScore: z.string(),
  })).optional(),
  currentScores: z.object({
    gmat: z.string().optional(),
    gre: z.string().optional(),
    toefl: z.string().optional(),
    ielts: z.string().optional(),
  }).optional(),
})

const sections = [
  { 
    id: "personal", 
    title: "Personal Information", 
    icon: User, 
    schema: personalInfoSchema,
    description: "Basic personal details and contact information"
  },
  { 
    id: "education", 
    title: "Education Background", 
    icon: GraduationCap, 
    schema: educationSchema,
    description: "Academic qualifications and educational history"
  },
  { 
    id: "scores", 
    title: "Test Scores", 
    icon: Trophy, 
    schema: testScoresSchema,
    description: "Standardized test scores and exam dates"
  },
  { 
    id: "goals", 
    title: "Career Goals", 
    icon: Target, 
    schema: careerGoalsSchema,
    description: "Target programs, career objectives, and aspirations"
  },
  { 
    id: "universities", 
    title: "Target Universities", 
    icon: Globe, 
    schema: targetUniversitiesSchema,
    description: "Universities and programs you're targeting"
  },
  { 
    id: "scholarships", 
    title: "Scholarships & Finance", 
    icon: DollarSign, 
    schema: scholarshipsSchema,
    description: "Financial aid and scholarship targets"
  },
  { 
    id: "exam-planning", 
    title: "Exam Planning", 
    icon: Calendar, 
    schema: examPlanningSchema,
    description: "Planned exams and target scores"
  },
]

export function ComprehensiveProfileSetup() {
  const [activeTab, setActiveTab] = useState("personal")
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Load existing profile data
  useEffect(() => {
    if (user?.id) {
      loadProfileData()
    }
  }, [user?.id])

  const loadProfileData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const { profile } = await response.json()
        if (profile) {
          setFormData({
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
              graduationYear: profile.graduation_year?.toString() || "",
              gpa: profile.gpa?.toString() || "",
            },
            scores: {
              gmat: profile.test_scores?.gmat || "",
              gre: profile.test_scores?.gre || "",
              toefl: profile.test_scores?.toefl || "",
              ielts: profile.test_scores?.ielts || "",
              gmatDate: profile.test_scores?.gmatDate || "",
              greDate: profile.test_scores?.greDate || "",
              toeflDate: profile.test_scores?.toeflDate || "",
              ieltsDate: profile.test_scores?.ieltsDate || "",
            },
            goals: {
              targetDegree: profile.target_degree || "",
              targetPrograms: profile.target_programs || [],
              careerObjective: profile.career_objective || "",
              workExperience: profile.work_experience_category || "",
              preferredCountries: profile.preferred_countries || [],
              industryInterests: profile.industry_interests || [],
              careerLevel: profile.career_level || "",
            },
            universities: {
              targetUniversities: profile.target_universities || [],
            },
            scholarships: {
              scholarshipInterest: profile.scholarship_interest || false,
              targetScholarships: profile.target_scholarships || [],
              budgetRange: profile.budget_range || "",
              financialAidNeeded: profile.financial_aid_needed || false,
            },
            "exam-planning": {
              plannedExams: profile.planned_exams || [],
              currentScores: profile.current_scores || {},
            },
          })
        } else {
          // Initialize with default empty values if no profile exists
          initializeEmptyFormData()
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      initializeEmptyFormData()
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeEmptyFormData = () => {
    setFormData({
      personal: {
        firstName: "",
        lastName: "",
        email: user?.email || "",
        phone: "",
        dateOfBirth: "",
        nationality: "",
        bio: "",
        linkedinUrl: "",
      },
      education: {
        highestDegree: "",
        fieldOfStudy: "",
        university: "",
        graduationYear: "",
        gpa: "",
      },
      scores: {
        gmat: "",
        gre: "",
        toefl: "",
        ielts: "",
        gmatDate: "",
        greDate: "",
        toeflDate: "",
        ieltsDate: "",
      },
      goals: {
        targetDegree: "",
        targetPrograms: [],
        careerObjective: "",
        workExperience: "",
        preferredCountries: [],
        industryInterests: [],
        careerLevel: "",
      },
      universities: {
        targetUniversities: [],
      },
      scholarships: {
        scholarshipInterest: false,
        targetScholarships: [],
        budgetRange: "",
        financialAidNeeded: false,
      },
      "exam-planning": {
        plannedExams: [],
        currentScores: {},
      },
    })
  }

  const saveSection = async (sectionId: string, data: any) => {
    setIsSaving(true)
    
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: sectionId,
          data: data,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: `${sections.find(s => s.id === sectionId)?.title} updated successfully`,
        })
        
        // Update local form data
        setFormData(prev => ({
          ...prev,
          [sectionId]: data
        }))

        return true
      } else {
        console.error("API Error:", result)
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save changes. Please try again.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Error saving section:", error)
      toast({
        title: "Save Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteProfile = async () => {
    try {
      setIsSaving(true)
      
      // Save all sections data in the format expected by the complete API
      const profileData: any = {}

      if (formData.personal) {
        profileData.personal = formData.personal
      }
      if (formData.education) {
        profileData.education = formData.education
      }
      if (formData.scores) {
        profileData.scores = formData.scores
      }
      if (formData.goals) {
        profileData.goals = formData.goals
      }

      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Profile Completed!",
          description: `Your profile is ${result.completion?.percentage || 100}% complete.`,
        })
        
        // Redirect to home page
        router.push("/")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to complete profile")
      }
    } catch (error) {
      console.error("Error completing profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center gap-2 text-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{section.title}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <ProfileSection
              section={section}
              data={formData[section.id] || {}}
              onSave={(data) => saveSection(section.id, data)}
              isLoading={isLoading}
              isSaving={isSaving}
            />
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 flex justify-between items-center border-t pt-6">
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button 
          onClick={handleCompleteProfile}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Complete Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

interface ProfileSectionProps {
  section: typeof sections[0]
  data: any
  onSave: (data: any) => Promise<boolean>
  isLoading: boolean
  isSaving: boolean
}

function ProfileSection({ section, data, onSave, isLoading, isSaving }: ProfileSectionProps) {
  // Create safe default values based on section type
  const getSafeDefaults = (sectionId: string) => {
    const baseDefaults: Record<string, any> = {
      personal: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        nationality: "",
        bio: "",
        linkedinUrl: "",
      },
      education: {
        highestDegree: "",
        fieldOfStudy: "",
        university: "",
        graduationYear: "",
        gpa: "",
      },
      scores: {
        gmat: "",
        gre: "",
        toefl: "",
        ielts: "",
        gmatDate: "",
        greDate: "",
        toeflDate: "",
        ieltsDate: "",
      },
      goals: {
        targetDegree: "",
        targetPrograms: [],
        careerObjective: "",
        workExperience: "",
        preferredCountries: [],
        industryInterests: [],
        careerLevel: "",
      },
    }
    return baseDefaults[sectionId] || {}
  }

  // Merge data with safe defaults
  const safeData = {
    ...getSafeDefaults(section.id),
    ...data
  }

  const form = useForm({
    resolver: zodResolver(section.schema),
    defaultValues: safeData,
    mode: "onChange"
  })

  useEffect(() => {
    // Reset form with safe data whenever data changes
    form.reset(safeData)
  }, [data, form, section.id])

  const onSubmit = async (values: any) => {
    await onSave(values)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <section.icon className="h-5 w-5" />
          <div>
            <CardTitle>{section.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {section.id === "personal" && <PersonalInfoFields form={form} />}
            {section.id === "education" && <EducationFields form={form} />}
            {section.id === "scores" && <TestScoresFields form={form} />}
            {section.id === "goals" && <CareerGoalsFields form={form} />}
            {section.id === "universities" && <TargetUniversitiesFields form={form} />}
            {section.id === "scholarships" && <ScholarshipsFields form={form} />}
            {section.id === "exam-planning" && <ExamPlanningFields form={form} />}
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Section
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Personal Information Fields Component
function PersonalInfoFields({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
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
              <FormLabel>Last Name</FormLabel>
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
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="john.doe@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="nationality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nationality</FormLabel>
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
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="sg">Singapore</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="linkedinUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn URL</FormLabel>
            <FormControl>
              <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
            </FormControl>
            <FormDescription>Optional</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us about yourself..." 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormDescription>Optional</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// Education Fields Component
function EducationFields({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="highestDegree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Highest Degree</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your highest degree" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="associate">Associate Degree</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD/Doctorate</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fieldOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field of Study</FormLabel>
              <FormControl>
                <Input placeholder="Computer Science" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="university"
          render={({ field }) => (
            <FormItem>
              <FormLabel>University</FormLabel>
              <FormControl>
                <Input placeholder="University of XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Graduation Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="gpa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GPA</FormLabel>
            <FormControl>
              <Input placeholder="3.5" {...field} />
            </FormControl>
            <FormDescription>Optional</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// Test Scores Fields Component
function TestScoresFields({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">GMAT</h4>
          <FormField
            control={form.control}
            name="gmat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GMAT Score</FormLabel>
                <FormControl>
                  <Input placeholder="700" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gmatDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GMAT Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">GRE</h4>
          <FormField
            control={form.control}
            name="gre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GRE Score</FormLabel>
                <FormControl>
                  <Input placeholder="320" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="greDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GRE Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">TOEFL</h4>
          <FormField
            control={form.control}
            name="toefl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TOEFL Score</FormLabel>
                <FormControl>
                  <Input placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="toeflDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TOEFL Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">IELTS</h4>
          <FormField
            control={form.control}
            name="ielts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IELTS Score</FormLabel>
                <FormControl>
                  <Input placeholder="7.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ieltsDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IELTS Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}

// Career Goals Fields Component
function CareerGoalsFields({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="targetDegree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Degree</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target degree" />
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
          name="workExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Experience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="2-5">2-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="careerObjective"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Career Objective</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your career goals and objectives..." 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="targetPrograms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Programs</FormLabel>
            <FormControl>
              <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business Administration</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="preferredCountries"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Countries</FormLabel>
            <FormControl>
              <Select onValueChange={(value) => field.onChange([value])} defaultValue={field.value?.[0]}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

 // Target Universities Fields Component
function TargetUniversitiesFields({ form }: { form: any }) {
  const [targets, setTargets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get current user ID
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    loadUserData()
    loadSchoolTargets()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadSchoolTargets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/school-targets')
      if (response.ok) {
        const data = await response.json()
        setTargets(data.targets || [])
      }
    } catch (error) {
      console.error('Error loading school targets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTargetsChange = async (newTargets: any[]) => {
    setTargets(newTargets)
    
    // Auto-save targets to database
    try {
      // For now, just update the local state
      // The EnhancedSchoolSelector component handles the API calls
    } catch (error) {
      console.error('Error saving targets:', error)
    }
  }

  if (isLoading || !userId) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading your target schools...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <EnhancedSchoolSelector
      value={targets}
      onChange={handleTargetsChange}
      userId={userId}
    />
  )
}

// Scholarships Fields Component  
function ScholarshipsFields({ form }: { form: any }) {
  const [targetScholarships, setTargetScholarships] = useState([""]);

  const addScholarship = () => {
    setTargetScholarships([...targetScholarships, ""]);
  };

  const removeScholarship = (index: number) => {
    const updated = targetScholarships.filter((_, i) => i !== index);
    setTargetScholarships(updated);
  };

  const updateScholarship = (index: number, value: string) => {
    const updated = [...targetScholarships];
    updated[index] = value;
    setTargetScholarships(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">💰 Financial Planning & Scholarships</h3>
        
        <FormField
          control={form.control}
          name="scholarshipInterest"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I'm actively seeking scholarships and financial aid
                </FormLabel>
                <FormDescription>
                  Check this if you want to receive scholarship recommendations
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budgetRange"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Total Budget Range (USD)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your budget range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="under-50k">Under $50,000</SelectItem>
                  <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                  <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                  <SelectItem value="150k-200k">$150,000 - $200,000</SelectItem>
                  <SelectItem value="over-200k">Over $200,000</SelectItem>
                  <SelectItem value="no-limit">No budget constraints</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Include tuition, living expenses, and other costs
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="financialAidNeeded"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I need financial aid to pursue my studies
                </FormLabel>
                <FormDescription>
                  This helps us prioritize need-based scholarships
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">🏆 Target Scholarships</h4>
          <Button type="button" onClick={addScholarship} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Scholarship
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          List specific scholarships you're targeting (e.g., "Fulbright", "Rhodes Scholarship", "Merit-based aid")
        </p>

        {targetScholarships.map((scholarship, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              placeholder="Scholarship name or type"
              value={scholarship}
              onChange={(e) => updateScholarship(index, e.target.value)}
            />
            {targetScholarships.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeScholarship(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Exam Planning Fields Component
function ExamPlanningFields({ form }: { form: any }) {
  const [plannedExams, setPlannedExams] = useState([
    { examType: "", plannedDate: "", targetScore: "" }
  ]);

  const addExam = () => {
    setPlannedExams([...plannedExams, { examType: "", plannedDate: "", targetScore: "" }]);
  };

  const removeExam = (index: number) => {
    const updated = plannedExams.filter((_, i) => i !== index);
    setPlannedExams(updated);
  };

  const updateExam = (index: number, field: string, value: string) => {
    const updated = [...plannedExams];
    updated[index] = { ...updated[index], [field]: value };
    setPlannedExams(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">📚 Current Test Scores</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your current test scores if you have already taken these exams
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentScores.gmat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GMAT Score</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 720" {...field} />
                </FormControl>
                <FormDescription>Total score (200-800)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentScores.gre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GRE Score</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 330" {...field} />
                </FormControl>
                <FormDescription>Combined Verbal + Quantitative (260-340)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentScores.toefl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TOEFL Score</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 110" {...field} />
                </FormControl>
                <FormDescription>Total score (0-120)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentScores.ielts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IELTS Score</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 8.0" {...field} />
                </FormControl>
                <FormDescription>Overall band score (0-9)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">🎯 Planned Exams</h3>
          <Button type="button" onClick={addExam} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Exam
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Plan your upcoming exams and set target scores to track your preparation progress
        </p>

        {plannedExams.map((exam, index) => (
          <Card key={index} className="p-4 mb-4 border-l-4 border-l-green-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Exam Type</label>
                <Select
                  value={exam.examType}
                  onValueChange={(value) => updateExam(index, 'examType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmat">GMAT</SelectItem>
                    <SelectItem value="gre">GRE</SelectItem>
                    <SelectItem value="toefl">TOEFL</SelectItem>
                    <SelectItem value="ielts">IELTS</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Planned Date</label>
                <Input
                  type="date"
                  value={exam.plannedDate}
                  onChange={(e) => updateExam(index, 'plannedDate', e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Target Score</label>
                  <Input
                    placeholder="Target score"
                    value={exam.targetScore}
                    onChange={(e) => updateExam(index, 'targetScore', e.target.value)}
                  />
                </div>
                {plannedExams.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExam(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 