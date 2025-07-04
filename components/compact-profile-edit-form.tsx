"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EnhancedSchoolSelector } from "@/components/enhanced-school-selector"
import { createClient } from "@/lib/supabase/client"

// Compact schemas for form validation
const personalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

const educationSchema = z.object({
  highestDegree: z.string().min(1, "Highest degree is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  university: z.string().min(1, "University is required"),
  graduationYear: z.string().optional(),
  gpa: z.string().optional(),
})

const scoresSchema = z.object({
  // GRE Scores
  greVerbal: z.string().optional(),
  greQuantitative: z.string().optional(),
  greAnalyticalWriting: z.string().optional(),
  greDate: z.string().optional(),
  
  // GMAT Scores
  gmatVerbal: z.string().optional(),
  gmatQuantitative: z.string().optional(),
  gmatIntegratedReasoning: z.string().optional(),
  gmatAWA: z.string().optional(),
  gmatDate: z.string().optional(),
  
  // TOEFL Scores
  toeflReading: z.string().optional(),
  toeflListening: z.string().optional(),
  toeflSpeaking: z.string().optional(),
  toeflWriting: z.string().optional(),
  toeflDate: z.string().optional(),
  
  // IELTS (optional)
  ielts: z.string().optional(),
  ieltsDate: z.string().optional(),
})

const experienceSchema = z.object({
  currentRole: z.string().min(1, "Role is required"),
  currentCompany: z.string().min(1, "Company name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
})

const goalsSchema = z.object({
  targetDegree: z.string().min(1, "Target degree is required"),
  careerLevel: z.string().optional(),
})

const scholarshipsSchema = z.object({
  scholarshipInterest: z.boolean().optional(),
  budgetRange: z.string().optional(),
  financialAidNeeded: z.boolean().optional(),
})

interface CompactProfileEditFormProps {
  section: string
  data: any
  onSave: (data: any) => void
  onDataChange?: (data: any) => void  // New optional prop for non-closing updates
}

export function CompactProfileEditForm({ section, data, onSave, onDataChange }: CompactProfileEditFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const { toast } = useToast()

  // Get schema based on section
  const getSchema = () => {
    switch (section) {
      case 'personal':
        return personalSchema
      case 'education':
        return educationSchema
      case 'experience':
        return experienceSchema
      case 'scores':
        return scoresSchema
      case 'goals':
        return goalsSchema
      case 'scholarships':
        return scholarshipsSchema
      default:
        return z.object({})
    }
  }

  // Ensure all form fields have proper default values to prevent controlled/uncontrolled switching
  const getDefaultValues = () => {
    const defaultValues: any = {}
    
    // Set default values based on section
    if (section === 'personal') {
      defaultValues.firstName = data?.firstName || ''
      defaultValues.lastName = data?.lastName || ''
      defaultValues.email = data?.email || ''
      defaultValues.phone = data?.phone || ''
      defaultValues.dateOfBirth = data?.dateOfBirth || ''
      defaultValues.nationality = data?.nationality || ''
      defaultValues.bio = data?.bio || ''
      defaultValues.linkedinUrl = data?.linkedinUrl || ''
    } else if (section === 'education') {
      defaultValues.highestDegree = data?.highestDegree || ''
      defaultValues.fieldOfStudy = data?.fieldOfStudy || ''
      defaultValues.university = data?.university || ''
      defaultValues.graduationYear = data?.graduationYear || ''
      defaultValues.gpa = data?.gpa || ''
    } else if (section === 'experience') {
      defaultValues.currentRole = data?.currentRole || ''
      defaultValues.currentCompany = data?.currentCompany || ''
      defaultValues.startDate = data?.startDate || ''
      defaultValues.endDate = data?.endDate || ''
    } else if (section === 'scores') {
      defaultValues.greVerbal = data?.greVerbal || ''
      defaultValues.greQuantitative = data?.greQuantitative || ''
      defaultValues.greAnalyticalWriting = data?.greAnalyticalWriting || ''
      defaultValues.greDate = data?.greDate || ''
      defaultValues.gmatVerbal = data?.gmatVerbal || ''
      defaultValues.gmatQuantitative = data?.gmatQuantitative || ''
      defaultValues.gmatIntegratedReasoning = data?.gmatIntegratedReasoning || ''
      defaultValues.gmatAWA = data?.gmatAWA || ''
      defaultValues.gmatDate = data?.gmatDate || ''
      defaultValues.toeflReading = data?.toeflReading || ''
      defaultValues.toeflListening = data?.toeflListening || ''
      defaultValues.toeflSpeaking = data?.toeflSpeaking || ''
      defaultValues.toeflWriting = data?.toeflWriting || ''
      defaultValues.toeflDate = data?.toeflDate || ''
      defaultValues.ielts = data?.ielts || ''
      defaultValues.ieltsDate = data?.ieltsDate || ''
    } else if (section === 'goals') {
      defaultValues.targetDegree = data?.targetDegree || ''
      defaultValues.careerLevel = data?.careerLevel || ''
    } else if (section === 'scholarships') {
      defaultValues.scholarshipInterest = data?.scholarshipInterest || false
      defaultValues.budgetRange = data?.budgetRange || ''
      defaultValues.financialAidNeeded = data?.financialAidNeeded || false
    }
    
    return defaultValues
  }

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues()
  })

  useEffect(() => {
    form.reset(getDefaultValues())
    loadUserData()
  }, [data, form])

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

  const onSubmit = async (values: any) => {
    setIsSaving(true)
    try {
      console.log('Submitting form values:', { section, values })
      
      const response = await fetch('/api/profile/section', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          data: values
        })
      })

      const responseData = await response.json()
      console.log('API Response:', { status: response.status, data: responseData })

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        })
        onSave(values)
      } else {
        console.error('API Error Response:', responseData)
        throw new Error(responseData.error || responseData.details || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      
      // More specific error messaging
      let errorMessage = "Failed to save your changes. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          errorMessage = "Please sign in again to save your changes."
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes('validation')) {
          errorMessage = "Please check your input and try again."
        } else {
          // Show the actual error message for debugging
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Special handling for universities section
  if (section === 'universities') {
    const handleSchoolTargetsChange = (updatedTargets: any[]) => {
      // The school selector has already saved the data to the database
      // Use onDataChange for intermediate updates that shouldn't close the dialog
      if (onDataChange) {
        onDataChange(updatedTargets)
      }
      toast({
        title: "Schools updated",
        description: "Your target schools have been saved successfully.",
      })
    };

    return (
      <div className="space-y-4">
        <EnhancedSchoolSelector
          value={data.schoolTargets || []}
          onChange={handleSchoolTargetsChange}
          userId={userId}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Changes to your target schools are saved automatically. You can continue making changes and close this dialog when you're done.
        </p>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            type="button" 
            onClick={() => {
              // Trigger final refresh and close dialog
              onSave(data.schoolTargets || [])
            }}
          >
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {section === 'personal' && (
          <div className="grid grid-cols-2 gap-4">
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
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="cn">China</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
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
                    <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description about your background and interests
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {section === 'education' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="highestDegree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highest Degree</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select degree" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="professional">Professional Degree</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
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
                      <Input placeholder="Computer Science" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University</FormLabel>
                  <FormControl>
                    <Input placeholder="Harvard University" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year</FormLabel>
                    <FormControl>
                      <Input placeholder="2024" className="h-9" {...field} />
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
                      <Input placeholder="3.8" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {section === 'experience' && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="currentRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title / Role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer, Marketing Manager" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company / Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Google, Microsoft, Acme Corp" className="h-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DatePicker 
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start date"
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DatePicker 
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end date (optional)"
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {section === 'scores' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* GRE Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 text-sm">GRE Scores</h4>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="greVerbal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Verbal</FormLabel>
                      <FormControl>
                        <Input placeholder="161" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="greQuantitative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Quantitative</FormLabel>
                      <FormControl>
                        <Input placeholder="167" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="greAnalyticalWriting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Analytical Writing</FormLabel>
                      <FormControl>
                        <Input placeholder="4.5" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="greDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">GRE Test Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* GMAT Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 text-sm">GMAT Scores</h4>
              <div className="grid grid-cols-4 gap-3">
                <FormField
                  control={form.control}
                  name="gmatVerbal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Verbal</FormLabel>
                      <FormControl>
                        <Input placeholder="40" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gmatQuantitative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Quantitative</FormLabel>
                      <FormControl>
                        <Input placeholder="49" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gmatIntegratedReasoning"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Integrated Reasoning</FormLabel>
                      <FormControl>
                        <Input placeholder="8" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gmatAWA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">AWA</FormLabel>
                      <FormControl>
                        <Input placeholder="5.0" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="gmatDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">GMAT Test Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* TOEFL Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 text-sm">TOEFL Scores</h4>
              <div className="grid grid-cols-4 gap-3">
                <FormField
                  control={form.control}
                  name="toeflReading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Reading</FormLabel>
                      <FormControl>
                        <Input placeholder="28" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="toeflListening"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Listening</FormLabel>
                      <FormControl>
                        <Input placeholder="29" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="toeflSpeaking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Speaking</FormLabel>
                      <FormControl>
                        <Input placeholder="27" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="toeflWriting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Writing</FormLabel>
                      <FormControl>
                        <Input placeholder="26" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="toeflDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">TOEFL Test Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* IELTS Section (Optional) */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 text-sm">IELTS Score (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="ielts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Overall Band Score</FormLabel>
                      <FormControl>
                        <Input placeholder="7.5" className="h-8" {...field} />
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
                      <FormLabel className="text-xs">IELTS Test Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {section === 'goals' && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="targetDegree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Degree</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select target degree" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mba">MBA</SelectItem>
                      <SelectItem value="ms">Master of Science</SelectItem>
                      <SelectItem value="ma">Master of Arts</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="executive-mba">Executive MBA</SelectItem>
                      <SelectItem value="professional">Professional Degree</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="careerLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select career level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (8-15 years)</SelectItem>
                      <SelectItem value="executive">Executive (15+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {section === 'scholarships' && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Range (USD)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scholarshipInterest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
              name="financialAidNeeded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}