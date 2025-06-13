"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard-layout"

// Prevent static generation
export const dynamic = 'force-dynamic'

// Define validation schema
const mbaSchoolSchema = z.object({
  name: z.string().min(2, { message: "School name must be at least 2 characters" }),
  type: z.string().min(1, { message: "Program type is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  ranking: z.coerce.number().int().positive({ message: "Ranking must be a positive number" }).optional().or(z.literal("")),
  duration: z.string().min(1, { message: "Duration is required" }),
  tuition: z.string().min(1, { message: "Tuition information is required" }),
  total_cost: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  application_deadline: z.string().optional(),
  class_size: z.coerce.number().int().positive({ message: "Class size must be a positive number" }).optional().or(z.literal("")),
  avg_gmat: z.coerce.number().int().min(200, { message: "GMAT score must be at least 200" }).max(800, { message: "GMAT score cannot exceed 800" }).optional().or(z.literal("")),
  gmat_range: z.string().optional(),
  avg_gpa: z.coerce.number().min(0, { message: "GPA must be positive" }).max(4.0, { message: "GPA cannot exceed 4.0" }).optional().or(z.literal("")),
  acceptance_rate: z.coerce.number().min(0, { message: "Acceptance rate must be at least 0%" }).max(100, { message: "Acceptance rate cannot exceed 100%" }).optional().or(z.literal("")),
  employment_rate: z.coerce.number().min(0, { message: "Employment rate must be at least 0%" }).max(100, { message: "Employment rate cannot exceed 100%" }).optional().or(z.literal("")),
  avg_starting_salary: z.string().optional(),
  top_industries: z.string().optional(),
  start_date: z.string().optional(),
  format: z.string().optional(),
  specializations: z.string().optional(),
  teaching_methodology: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  global_focus: z.string().optional(),
  faculty_size: z.string().optional(),
  research_centers: z.string().optional(),
  work_experience_requirement: z.string().optional(),
  application_requirements: z.string().optional(),
  international_students: z.string().optional(),
  alumni_network: z.string().optional(),
  campus_life: z.string().optional(),
  career_services: z.string().optional(),
  notable_alumni: z.string().optional(),
  student_clubs: z.string().optional(),
})

type MBASchoolFormValues = z.infer<typeof mbaSchoolSchema>

export default function AddMBASchoolPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize form
  const form = useForm<MBASchoolFormValues>({
    resolver: zodResolver(mbaSchoolSchema),
    defaultValues: {
      name: "",
      type: "Full-time MBA",
      location: "",
      country: "",
      ranking: "",
      duration: "2 years",
      tuition: "",
      total_cost: "",
      description: "",
      application_deadline: "",
      class_size: "",
      avg_gmat: "",
      gmat_range: "",
      avg_gpa: "",
      acceptance_rate: "",
      employment_rate: "",
      avg_starting_salary: "",
      top_industries: "",
      start_date: "August/September",
      format: "Full-time, on-campus",
      specializations: "",
      teaching_methodology: "",
      website: "",
      global_focus: "",
      faculty_size: "",
      research_centers: "",
      work_experience_requirement: "",
      application_requirements: "",
      international_students: "",
      alumni_network: "",
      campus_life: "",
      career_services: "",
      notable_alumni: "",
      student_clubs: "",
    },
  })

  const onSubmit = async (values: MBASchoolFormValues) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Convert form values to the expected format
      const mbaSchoolData = {
        name: values.name,
        type: values.type,
        location: values.location,
        country: values.country,
        ranking: values.ranking ? Number(values.ranking) : null,
        duration: values.duration,
        tuition: values.tuition,
        total_cost: values.total_cost || "",
        description: values.description,
        application_deadline: values.application_deadline || "",
        class_size: values.class_size ? Number(values.class_size) : null,
        avg_gmat: values.avg_gmat ? Number(values.avg_gmat) : null,
        gmat_range: values.gmat_range || "",
        avg_gpa: values.avg_gpa ? Number(values.avg_gpa) : null,
        acceptance_rate: values.acceptance_rate ? Number(values.acceptance_rate) : null,
        employment_rate: values.employment_rate ? Number(values.employment_rate) : null,
        avg_starting_salary: values.avg_starting_salary || "",
        top_industries: values.top_industries || "",
        start_date: values.start_date || "",
        format: values.format || "",
        specializations: values.specializations ? values.specializations.split(',').map(s => s.trim()) : [],
        teaching_methodology: values.teaching_methodology || "",
        website: values.website || "",
        global_focus: values.global_focus || "",
        faculty_size: values.faculty_size || "",
        research_centers: values.research_centers || "",
        work_experience_requirement: values.work_experience_requirement || "",
        application_requirements: values.application_requirements || "",
        international_students: values.international_students || "",
        alumni_network: values.alumni_network || "",
        campus_life: values.campus_life || "",
        career_services: values.career_services || "",
        notable_alumni: values.notable_alumni || "",
        student_clubs: values.student_clubs || "",
        status: 'active'
      }

      const response = await fetch('/api/admin/mba-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mbaSchoolData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const newSchool = await response.json()
      
      toast({
        title: "MBA School Added",
        description: `${values.name} has been successfully added.`,
      })

      // Reset form
      form.reset()
      
      // Redirect to settings page
      router.push('/settings')
    } catch (error) {
      console.error('Error creating MBA school:', error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setFormError(`Failed to add MBA school: ${errorMessage}`)
      toast({
        title: "Error",
        description: "Failed to add new MBA school. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/settings" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Add New MBA School</h1>
            <p className="text-muted-foreground">
              Create a comprehensive MBA program profile in the system.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>MBA School Information</CardTitle>
            <CardDescription>
              Please fill in the comprehensive details for the new MBA program. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="admissions">Admissions</TabsTrigger>
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="outcomes">Outcomes & Life</TabsTrigger>
                  </TabsList>

                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>School Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Harvard Business School" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Program Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select program type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Full-time MBA">Full-time MBA</SelectItem>
                                  <SelectItem value="Part-time MBA">Part-time MBA</SelectItem>
                                  <SelectItem value="Executive MBA">Executive MBA</SelectItem>
                                  <SelectItem value="Online MBA">Online MBA</SelectItem>
                                  <SelectItem value="Accelerated MBA">Accelerated MBA</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ranking"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Global Ranking</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="e.g., 1" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Boston, MA" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., United States" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 2 years" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., August/September" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="format"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Format</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Full-time, on-campus" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="tuition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tuition *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., $75,000 per year" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="total_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Cost (with living expenses)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., $120,000 per year" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Official Website</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., https://www.hbs.edu/mba" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} placeholder="Brief description of the MBA program..." />
                            </FormControl>
                            <FormDescription>
                              Provide a comprehensive overview of the MBA program
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Admissions Tab */}
                  <TabsContent value="admissions" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Admissions Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="avg_gmat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Average GMAT</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="e.g., 730" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gmat_range"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GMAT Range</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 700-770" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="avg_gpa"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Average GPA</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.01" placeholder="e.g., 3.7" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="acceptance_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Acceptance Rate (%)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.1" placeholder="e.g., 11.5" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="class_size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class Size</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" placeholder="e.g., 930" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="application_deadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application Deadline</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., April 1 (Round 3)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="work_experience_requirement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Experience Requirement</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Average 5 years, typical range 3-7 years" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="application_requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application Requirements</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} placeholder="e.g., GMAT/GRE, essays, recommendations, transcripts, interview" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Curriculum Tab */}
                  <TabsContent value="curriculum" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Curriculum & Faculty</h3>
                      
                      <FormField
                        control={form.control}
                        name="specializations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specializations</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Finance, Marketing, Strategy, Technology (comma-separated)" />
                            </FormControl>
                            <FormDescription>
                              Enter specializations separated by commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teaching_methodology"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teaching Methodology</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Case method (80%), lectures, simulations, group projects" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="global_focus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Global Focus</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Global immersion experiences, international study trips" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="faculty_size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Faculty Size</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 200+ distinguished faculty members" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="research_centers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Research Centers</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 15+ research centers and institutes" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Outcomes & Life Tab */}
                  <TabsContent value="outcomes" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Career Outcomes</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="employment_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employment Rate (%)</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" step="0.1" placeholder="e.g., 93.5" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="avg_starting_salary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Average Starting Salary</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., $175,000" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="top_industries"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Top Industries</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Consulting, Financial Services, Technology" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="career_services"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Career Services</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} placeholder="Comprehensive career support including workshops, employer connections, alumni mentoring..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <h3 className="text-lg font-semibold mt-6">Student Life</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="international_students"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>International Students</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 39% from 72 countries" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="student_clubs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Clubs</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 100+ professional and social clubs" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="alumni_network"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alumni Network</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., 46,000+ alumni globally" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="campus_life"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campus Life</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} placeholder="Vibrant campus community with diverse activities..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notable_alumni"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notable Alumni</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} placeholder="Distinguished alumni including business leaders, entrepreneurs..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/settings')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding MBA School...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Add MBA School
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}