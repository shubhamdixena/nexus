"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MbaSchoolEditFormProps {
  school: any
  onSave: (updatedSchool: any) => void
  onCancel: () => void
}

// Define validation schema
const mbaSchoolSchema = z.object({
  name: z.string().min(2, { message: "School name must be at least 2 characters" }),
  type: z.string().min(1, { message: "Program type is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  ranking: z.coerce.number().int().positive({ message: "Ranking must be a positive number" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  tuition: z.string().min(1, { message: "Tuition information is required" }),
  totalCost: z.string().optional(),
  status: z.string(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  applicationDeadline: z.string().optional(),
  classSize: z.coerce.number().int().positive({ message: "Class size must be a positive number" }).optional(),
  averageGMAT: z.coerce
    .number()
    .int()
    .min(200, { message: "GMAT score must be at least 200" })
    .max(800, { message: "GMAT score cannot exceed 800" })
    .optional(),
  gmatRange: z.string().optional(),
  averageGPA: z.coerce
    .number()
    .min(0, { message: "GPA must be positive" })
    .max(4.0, { message: "GPA cannot exceed 4.0" })
    .optional(),
  acceptanceRate: z.coerce
    .number()
    .min(0, { message: "Acceptance rate must be at least 0%" })
    .max(100, { message: "Acceptance rate cannot exceed 100%" })
    .optional(),
  employmentRate: z.coerce
    .number()
    .min(0, { message: "Employment rate must be at least 0%" })
    .max(100, { message: "Employment rate cannot exceed 100%" })
    .optional(),
  averageStartingSalary: z.string().optional(),
  topIndustries: z.string().optional(),
  startDate: z.string().optional(),
  format: z.string().optional(),
  year1Courses: z.string().optional(),
  year2Courses: z.string().optional(),
  teachingMethodology: z.string().optional(),
  globalFocus: z.string().optional(),
  facultySize: z.string().optional(),
  researchCenters: z.string().optional(),
  applicationRequirements: z.string().optional(),
  internationalStudents: z.string().optional(),
  alumniNetwork: z.string().optional(),
  campusLife: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  notableAlumni: z.string().optional(),
  careerServices: z.string().optional(),
  studentClubs: z.string().optional(),
  housingOptions: z.string().optional(),
  scholarshipsAvailable: z.string().optional(),
  interviewProcess: z.string().optional(),
  topHiringCompanies: z.string().optional(),
})

type MBASchoolFormValues = z.infer<typeof mbaSchoolSchema>

export function MbaSchoolEditForm({ school, onSave, onCancel }: MbaSchoolEditFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize form with school data
  const form = useForm<MBASchoolFormValues>({
    resolver: zodResolver(mbaSchoolSchema),
    defaultValues: {
      name: school.name,
      type: school.type || "Full-time MBA",
      location: school.location,
      country: school.country,
      ranking: school.ranking,
      duration: school.duration,
      tuition: school.tuition,
      totalCost: school.totalCost || "",
      status: school.status || "active",
      description: school.description,
      applicationDeadline: school.applicationDeadline || "",
      classSize: school.classSize || 0,
      averageGMAT: school.averageGMAT || 0,
      gmatRange: school.gmatRange || "",
      averageGPA: school.averageGPA || 0,
      acceptanceRate: school.acceptanceRate || 0,
      employmentRate: school.employmentRate || 0,
      averageStartingSalary: school.averageStartingSalary || "",
      topIndustries: school.topIndustries || "",
      startDate: school.startDate || "",
      format: school.format || "",
      year1Courses: school.year1Courses || "",
      year2Courses: school.year2Courses || "",
      teachingMethodology: school.teachingMethodology || "",
      globalFocus: school.globalFocus || "",
      facultySize: school.facultySize || "",
      researchCenters: school.researchCenters || "",
      applicationRequirements: school.applicationRequirements || "",
      internationalStudents: school.internationalStudents || "",
      alumniNetwork: school.alumniNetwork || "",
      campusLife: school.campusLife || "",
      website: school.website || "",
      notableAlumni: school.notableAlumni || "",
      careerServices: school.careerServices || "",
      studentClubs: school.studentClubs || "",
      housingOptions: school.housingOptions || "",
      scholarshipsAvailable: school.scholarshipsAvailable || "",
      interviewProcess: school.interviewProcess || "",
      topHiringCompanies: school.topHiringCompanies || "",
    },
  })

  // Handle form submission
  const onSubmit = async (values: MBASchoolFormValues) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Combine original school data with updated values
      const updatedSchool = {
        ...school,
        ...values,
      }

      onSave(updatedSchool)

      toast({
        title: "School Updated",
        description: `${updatedSchool.name} has been successfully updated.`,
      })
    } catch (error) {
      setFormError("Failed to update school. Please check your inputs and try again.")
      toast({
        title: "Update Failed",
        description: "Failed to update school information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to MBA Schools List
          </Button>
        </div>
        <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Edit MBA School Profile</CardTitle>
          <CardDescription>Update information for {school.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="admissions">Admissions</TabsTrigger>
                  <TabsTrigger value="outcomes">Outcomes & Life</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name*</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Program Type*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Full-time MBA">Full-time MBA</SelectItem>
                              <SelectItem value="Part-time MBA">Part-time MBA</SelectItem>
                              <SelectItem value="Executive MBA">Executive MBA</SelectItem>
                              <SelectItem value="Online MBA">Online MBA</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location*</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Country*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ranking"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ranking*</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tuition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tuition*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="totalCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Cost (with living expenses)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description*</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
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
                              <Input {...field} />
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
                              <Input {...field} />
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
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Curriculum Tab */}
                <TabsContent value="curriculum" className="space-y-4">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="year1Courses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year 1 Courses</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year2Courses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year 2 Courses</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teachingMethodology"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teaching Methodology</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="globalFocus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Global Focus</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facultySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faculty Size</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="researchCenters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Research Centers</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Admissions Tab */}
                <TabsContent value="admissions" className="space-y-4">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="applicationDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="averageGMAT"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average GMAT</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="averageGPA"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average GPA</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" min="0" max="4.0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="acceptanceRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Acceptance Rate (%)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" max="100" step="0.1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="classSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Size</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="applicationRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Requirements</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="internationalStudents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>International Students (%)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scholarshipsAvailable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scholarships Available</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="interviewProcess"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interview Process</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Outcomes & Life Tab */}
                <TabsContent value="outcomes" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employmentRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Rate (%)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" max="100" step="0.1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="averageStartingSalary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average Starting Salary</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="topHiringCompanies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Top Hiring Companies</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="e.g., McKinsey, Google, Amazon, Goldman Sachs" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="topIndustries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Top Industries</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={2}
                              placeholder="e.g., Consulting, Technology, Finance, Healthcare"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="careerServices"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Career Services</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alumniNetwork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alumni Network</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notableAlumni"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notable Alumni</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="campusLife"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campus Life</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studentClubs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Clubs</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="housingOptions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Housing Options</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
