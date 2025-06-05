"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
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

// Comprehensive schemas for all profile sections
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().min(1, "Please select your nationality"),
  bio: z.string().optional(),
  linkedinUrl: z.string().optional(),
})

const educationSchema = z.object({
  highestDegree: z.string().min(1, "Please select your highest degree"),
  fieldOfStudy: z.string().min(2, "Please enter your field of study"),
  university: z.string().min(2, "Please enter your university name"),
  graduationYear: z.string().regex(/^\d{4}$/, "Please enter a valid year"),
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
  targetDegree: z.string().min(1, "Please select your target degree"),
  targetPrograms: z.array(z.string()).optional().default([]),
  careerObjective: z.string().min(10, "Please describe your career objective"),
  workExperience: z.string().min(1, "Please select your work experience"),
  preferredCountries: z.array(z.string()).optional().default([]),
  industryInterests: z.array(z.string()).optional(),
  careerLevel: z.string().optional(),
})

const preferencesSchema = z.object({
  budgetRange: z.string().min(1, "Please select your budget range"),
  startDate: z.string().min(1, "Please select your preferred start date"),
  scholarshipInterest: z.boolean().default(false),
  accommodationPreference: z.string().min(1, "Please select your accommodation preference"),
  communicationPreferences: z.array(z.string()).optional().default([]),
  studyMode: z.string().optional(),
  locationPreference: z.string().optional(),
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
    id: "preferences", 
    title: "Preferences", 
    icon: Settings, 
    schema: preferencesSchema,
    description: "Study preferences, budget, and communication settings"
  },
]

interface ProfileSetupModalProps {
  children: React.ReactNode
  onProfileUpdate?: () => void
}

export function ProfileSetupModal({ children, onProfileUpdate }: ProfileSetupModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load existing profile data
  useEffect(() => {
    if (open && user?.id) {
      loadProfileData()
    }
  }, [open, user?.id])

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
            preferences: {
              budgetRange: profile.budget_range || "",
              startDate: profile.start_date || "",
              scholarshipInterest: profile.scholarship_interest || false,
              accommodationPreference: profile.accommodation_preference || "",
              communicationPreferences: profile.communication_preferences || [],
              studyMode: profile.study_mode || "",
              locationPreference: profile.location_preference || "",
            },
          })
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSection = async (sectionId: string, data: any) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile/section", {
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

        if (onProfileUpdate) {
          onProfileUpdate()
        }

        return true
      } else {
        console.error("API Error:", result)
        throw new Error(result.error || result.details || "Failed to save section")
      }
    } catch (error) {
      console.error("Error saving section:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save changes"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Provide comprehensive information to get personalized recommendations
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <TabsTrigger 
                    key={section.id} 
                    value={section.id}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{section.title}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <div className="flex-1 min-h-0">
              {sections.map((section) => (
                <TabsContent key={section.id} value={section.id} className="h-full mt-0">
                  <ScrollArea className="h-full">
                    <div className="pr-4 pb-4">
                      <ProfileSection
                        section={section}
                        data={formData[section.id] || {}}
                        onSave={(data) => saveSection(section.id, data)}
                        isLoading={isLoading}
                        isSaving={isSaving}
                      />
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
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
  const form = useForm({
    resolver: zodResolver(section.schema),
    defaultValues: data,
    mode: "onChange"
  })

  useEffect(() => {
    // Ensure all form fields have proper default values to prevent controlled/uncontrolled issues
    const safeData = {
      ...data
    }
    
    // Ensure arrays are always arrays
    if (section.id === "goals") {
      safeData.targetPrograms = data.targetPrograms || []
      safeData.preferredCountries = data.preferredCountries || []
      safeData.industryInterests = data.industryInterests || []
    }
    
    if (section.id === "preferences") {
      safeData.communicationPreferences = data.communicationPreferences || []
      safeData.scholarshipInterest = data.scholarshipInterest || false
    }
    
    // Ensure strings are never undefined
    Object.keys(safeData).forEach(key => {
      if (typeof safeData[key] === 'undefined') {
        safeData[key] = ""
      }
    })
    
    form.reset(safeData)
  }, [data, form, section.id])

  const onSubmit = async (values: any) => {
    await onSave(values)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
            {section.id === "preferences" && <PreferencesFields form={form} />}
            
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
                    Save Changes
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
              <FormLabel>First Name *</FormLabel>
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
              <FormLabel>Last Name *</FormLabel>
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
            <FormLabel>Email *</FormLabel>
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
            <FormLabel>Nationality *</FormLabel>
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
      <FormField
        control={form.control}
        name="highestDegree"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Highest Degree Obtained *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your highest degree" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="highschool">High School</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fieldOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field of Study *</FormLabel>
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
              <FormLabel>University/Institution *</FormLabel>
              <FormControl>
                <Input placeholder="University of Example" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Graduation Year *</FormLabel>
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
              <FormLabel>GPA</FormLabel>
              <FormControl>
                <Input placeholder="3.8" {...field} />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// Test Scores Fields Component
function TestScoresFields({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">GMAT</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gmat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GMAT Score</FormLabel>
                <FormControl>
                  <Input placeholder="720" {...field} />
                </FormControl>
                <FormDescription>200-800 scale</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gmatDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">GRE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GRE Score</FormLabel>
                <FormControl>
                  <Input placeholder="320" {...field} />
                </FormControl>
                <FormDescription>260-340 scale</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="greDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">English Proficiency</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="toefl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TOEFL Score</FormLabel>
                <FormControl>
                  <Input placeholder="105" {...field} />
                </FormControl>
                <FormDescription>0-120 scale</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="toeflDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ielts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IELTS Score</FormLabel>
                <FormControl>
                  <Input placeholder="7.5" {...field} />
                </FormControl>
                <FormDescription>0-9 scale</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ieltsDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Date</FormLabel>
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
      <FormField
        control={form.control}
        name="targetDegree"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Degree *</FormLabel>
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
              <FormLabel>Target Programs *</FormLabel>
              <FormDescription>Select all that apply</FormDescription>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "Finance",
                "Marketing",
                "Operations",
                "Strategy",
                "Technology Management",
                "Entrepreneurship",
                "Healthcare Management",
                "International Business",
                "Data Analytics",
                "Consulting",
                "Supply Chain",
                "Human Resources"
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
                                : field.onChange(field.value?.filter((value: string) => value !== program))
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">{program}</FormLabel>
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
            <FormLabel>Career Objective *</FormLabel>
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
            <FormLabel>Work Experience *</FormLabel>
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
              <FormLabel>Preferred Countries *</FormLabel>
              <FormDescription>Select all that apply</FormDescription>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                "Japan",
                "South Korea",
                "India"
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
                                : field.onChange(field.value?.filter((value: string) => value !== country))
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">{country}</FormLabel>
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
    </div>
  )
}

// Preferences Fields Component
function PreferencesFields({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="budgetRange"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Budget Range (USD/Year) *</FormLabel>
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
            <FormLabel>Preferred Start Date *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred start date" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="fall-2024">Fall 2024</SelectItem>
                <SelectItem value="spring-2025">Spring 2025</SelectItem>
                <SelectItem value="fall-2025">Fall 2025</SelectItem>
                <SelectItem value="spring-2026">Spring 2026</SelectItem>
                <SelectItem value="fall-2026">Fall 2026</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="studyMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Study Mode</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select study mode" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
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
                Check this if you want to receive information about scholarships and financial aid opportunities.
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
            <FormLabel>Accommodation Preference *</FormLabel>
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
              <FormLabel>Communication Preferences *</FormLabel>
              <FormDescription>How would you like to receive updates?</FormDescription>
            </div>
            <div className="grid grid-cols-2 gap-2">
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
                                : field.onChange(field.value?.filter((value: string) => value !== method))
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
    </div>
  )
}