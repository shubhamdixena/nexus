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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  GraduationCap,
  Target,
  University,
  Trophy,
  DollarSign,
  Calendar,
  BookOpen,
  Plus,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Enhanced schemas with new target fields
const personalInfoSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  bio: z.string().optional(),
})

const academicGoalsSchema = z.object({
  targetDegree: z.string().optional(),
  targetPrograms: z.array(z.string()).optional(),
  careerObjective: z.string().optional(),
  preferredCountries: z.array(z.string()).optional(),
  workExperience: z.string().optional(),
})

const targetUniversitiesSchema = z.object({
  targetUniversities: z.array(z.object({
    name: z.string(),
    program: z.string(),
    priority: z.string(),
  })).optional(),
})

const targetScholarshipsSchema = z.object({
  scholarshipInterest: z.boolean().optional(),
  targetScholarships: z.array(z.object({
    name: z.string(),
    type: z.string(),
    amount: z.string(),
  })).optional(),
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

const timelineSchema = z.object({
  applicationYear: z.string().optional(),
  applicationRound: z.string().optional(),
  startDate: z.string().optional(),
  importantDates: z.array(z.object({
    event: z.string(),
    date: z.string(),
    priority: z.string(),
  })).optional(),
})

const sections = [
  { 
    id: "personal", 
    title: "Personal Information", 
    icon: User, 
    schema: personalInfoSchema,
    description: "Basic personal details"
  },
  { 
    id: "goals", 
    title: "Academic Goals", 
    icon: GraduationCap, 
    schema: academicGoalsSchema,
    description: "Degree and career objectives"
  },
  { 
    id: "universities", 
    title: "Target Universities", 
    icon: University, 
    schema: targetUniversitiesSchema,
    description: "Universities and programs you're targeting"
  },
  { 
    id: "scholarships", 
    title: "Scholarships & Finance", 
    icon: DollarSign, 
    schema: targetScholarshipsSchema,
    description: "Financial aid and scholarship targets"
  },
  { 
    id: "exams", 
    title: "Exam Planning", 
    icon: BookOpen, 
    schema: examPlanningSchema,
    description: "Test scores and exam planning"
  },
  { 
    id: "timeline", 
    title: "Application Timeline", 
    icon: Calendar, 
    schema: timelineSchema,
    description: "Important dates and deadlines"
  },
]

export function EnhancedProfileSetup() {
  const [activeTab, setActiveTab] = useState("personal")
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Initialize empty form data
  useEffect(() => {
    setFormData({
      personal: { firstName: "", lastName: "", phone: "", nationality: "", bio: "" },
      goals: { targetDegree: "", targetPrograms: [], careerObjective: "", preferredCountries: [], workExperience: "" },
      universities: { targetUniversities: [] },
      scholarships: { scholarshipInterest: false, targetScholarships: [], budgetRange: "", financialAidNeeded: false },
      exams: { plannedExams: [], currentScores: {} },
      timeline: { applicationYear: "", applicationRound: "", startDate: "", importantDates: [] }
    })
  }, [])

  const saveSection = async (sectionId: string, data: any) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [sectionId]: data }),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast({
        title: "Section saved",
        description: `${sections.find(s => s.id === sectionId)?.title} updated successfully`,
      })
      return true
    } catch (error) {
      toast({
        title: "Error saving",
        description: "Failed to save section. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.title}</span>
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
  const form = useForm({
    resolver: zodResolver(section.schema),
    defaultValues: data,
  })

  const onSubmit = async (values: any) => {
    const success = await onSave(values)
    if (success) {
      form.reset(values)
    }
  }

  const renderFields = () => {
    switch (section.id) {
      case "personal":
        return <PersonalInfoFields form={form} />
      case "goals":
        return <AcademicGoalsFields form={form} />
      case "universities":
        return <TargetUniversitiesFields form={form} />
      case "scholarships":
        return <ScholarshipsFields form={form} />
      case "exams":
        return <ExamPlanningFields form={form} />
      case "timeline":
        return <TimelineFields form={form} />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <section.icon className="h-5 w-5" />
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderFields()}
            <Button type="submit" disabled={isLoading || isSaving}>
              {isSaving ? "Saving..." : "Save Section"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function PersonalInfoFields({ form }: { form: any }) {
  return (
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
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input placeholder="+1 (555) 123-4567" {...field} />
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
            <FormControl>
              <Input placeholder="United States" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="md:col-span-2">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about yourself..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

function AcademicGoalsFields({ form }: { form: any }) {
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
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mba">MBA</SelectItem>
                  <SelectItem value="ms">Master of Science</SelectItem>
                  <SelectItem value="ma">Master of Arts</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
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
                    <SelectValue placeholder="Select experience" />
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
              <Textarea placeholder="Describe your career goals..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

function TargetUniversitiesFields({ form }: { form: any }) {
  const [universities, setUniversities] = useState([
    { name: "", program: "", priority: "high" }
  ])

  const addUniversity = () => {
    setUniversities([...universities, { name: "", program: "", priority: "medium" }])
  }

  const removeUniversity = (index: number) => {
    const updated = universities.filter((_, i) => i !== index)
    setUniversities(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Target Universities</h3>
        <Button type="button" onClick={addUniversity} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add University
        </Button>
      </div>
      
      {universities.map((uni, index) => (
        <Card key={index} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">University Name</label>
              <Input 
                placeholder="Harvard Business School"
                value={uni.name}
                onChange={(e) => {
                  const updated = [...universities]
                  updated[index].name = e.target.value
                  setUniversities(updated)
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Program</label>
              <Input 
                placeholder="MBA"
                value={uni.program}
                onChange={(e) => {
                  const updated = [...universities]
                  updated[index].program = e.target.value
                  setUniversities(updated)
                }}
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium">Priority</label>
                <Select 
                  value={uni.priority}
                  onValueChange={(value) => {
                    const updated = [...universities]
                    updated[index].priority = value
                    setUniversities(updated)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {universities.length > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeUniversity(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function ScholarshipsFields({ form }: { form: any }) {
  return (
    <div className="space-y-6">
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
                I'm interested in scholarships and financial aid
              </FormLabel>
            </div>
          </FormItem>
        )}
      />

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
              </SelectContent>
            </Select>
            <FormMessage />
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
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}

function ExamPlanningFields({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Current Test Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentScores.gmat"
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
            name="currentScores.gre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GRE Score</FormLabel>
                <FormControl>
                  <Input placeholder="330" {...field} />
                </FormControl>
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
                  <Input placeholder="110" {...field} />
                </FormControl>
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
                  <Input placeholder="8.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Planned Exams</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add exams you plan to take or retake to improve your scores
        </p>
        {/* Add dynamic planned exams fields here */}
      </div>
    </div>
  )
}

function TimelineFields({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="applicationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Year</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="applicationRound"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Round</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="round1">Round 1 (Sept-Oct)</SelectItem>
                  <SelectItem value="round2">Round 2 (Jan-Feb)</SelectItem>
                  <SelectItem value="round3">Round 3 (Apr-May)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Start Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 