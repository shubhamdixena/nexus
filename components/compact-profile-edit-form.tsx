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
  gmat: z.string().optional(),
  gre: z.string().optional(),
  toefl: z.string().optional(),
  ielts: z.string().optional(),
  gmatDate: z.string().optional(),
  greDate: z.string().optional(),
  toeflDate: z.string().optional(),
  ieltsDate: z.string().optional(),
})

const goalsSchema = z.object({
  targetDegree: z.string().min(1, "Target degree is required"),
  careerObjective: z.string().min(10, "Please provide a detailed career objective"),
  workExperience: z.string().optional(),
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
}

export function CompactProfileEditForm({ section, data, onSave }: CompactProfileEditFormProps) {
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

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: data
  })

  useEffect(() => {
    form.reset(data)
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
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          data: values
        })
      })

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved successfully.",
        })
        onSave(values)
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Special handling for universities section
  if (section === 'universities') {
    return (
      <div className="space-y-4">
        <EnhancedSchoolSelector
          value={data.schoolTargets || []}
          onChange={onSave}
          userId={userId}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Changes to your target schools are saved automatically.
        </p>
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="highestDegree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highest Degree</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                <FormItem className="col-span-2">
                  <FormLabel>University</FormLabel>
                  <FormControl>
                    <Input placeholder="Harvard University" {...field} />
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
                    <Input placeholder="2024" {...field} />
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {section === 'scores' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gmat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GMAT Score</FormLabel>
                  <FormControl>
                    <Input placeholder="720" {...field} />
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
            
            <FormField
              control={form.control}
              name="gre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GRE Score</FormLabel>
                  <FormControl>
                    <Input placeholder="325" {...field} />
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
            
            <FormField
              control={form.control}
              name="toefl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TOEFL Score</FormLabel>
                  <FormControl>
                    <Input placeholder="110" {...field} />
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
            
            <FormField
              control={form.control}
              name="ielts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IELTS Score</FormLabel>
                  <FormControl>
                    <Input placeholder="8.5" {...field} />
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
                      <SelectTrigger>
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
                      <SelectTrigger>
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
            
            <FormField
              control={form.control}
              name="careerObjective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career Objective</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your career goals and aspirations..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description of your career goals and what you hope to achieve
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Experience Summary</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe your work experience..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
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