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
  Bell
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
        <TabsList className="grid w-full grid-cols-4 mb-6">
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

 