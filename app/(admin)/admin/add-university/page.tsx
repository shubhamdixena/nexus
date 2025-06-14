"use client"

// Prevent static generation
export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define validation schema
const universitySchema = z.object({
  name: z.string().min(2, { message: "University name must be at least 2 characters" }),
  type: z.string().min(1, { message: "Institution type is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  ranking: z.coerce.number().int().positive({ message: "Ranking must be a positive number" }).optional().or(z.literal("")),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).optional().or(z.literal("")),
  established_year: z.coerce.number().int().min(1800, { message: "Established year must be after 1800" }).max(new Date().getFullYear(), { message: "Established year cannot be in the future" }).optional().or(z.literal("")),
  student_population: z.coerce.number().int().positive({ message: "Student population must be a positive number" }).optional().or(z.literal("")),
  campus_size: z.string().optional(),
  accreditation: z.string().optional(),
})

type UniversityFormValues = z.infer<typeof universitySchema>

export default function AddUniversityPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize form
  const form = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
      name: "",
      type: "University",
      location: "",
      country: "",
      ranking: "",
      website: "",
      description: "",
      established_year: "",
      student_population: "",
      campus_size: "",
      accreditation: "",
    },
  })

  const onSubmit = async (values: UniversityFormValues) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Convert form values to the expected format
      const universityData = {
        name: values.name,
        type: values.type,
        location: values.location,
        country: values.country,
        ranking: values.ranking ? Number(values.ranking) : null,
        website: values.website || null,
        description: values.description || null,
        established_year: values.established_year ? Number(values.established_year) : null,
        student_population: values.student_population ? Number(values.student_population) : null,
        campus_size: values.campus_size || null,
        accreditation: values.accreditation || null,
        status: 'active'
      }

      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(universityData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const newUniversity = await response.json()
      
      toast({
        title: "University Added",
        description: `${values.name} has been successfully added.`,
      })

      // Reset form
      form.reset()
      
      // Redirect to settings page
      router.push('/settings')
    } catch (error) {
      console.error('Error creating university:', error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setFormError(`Failed to add university: ${errorMessage}`)
      toast({
        title: "Error",
        description: "Failed to add new university. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/settings" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Add New University</h1>
            <p className="text-muted-foreground">
              Create a new university or educational institution in the system.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>University Information</CardTitle>
            <CardDescription>
              Please fill in the details for the new university. Fields marked with * are required.
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
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>University Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Harvard University" />
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
                          <FormLabel>Institution Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select institution type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="University">University</SelectItem>
                              <SelectItem value="Business School">Business School</SelectItem>
                              <SelectItem value="College">College</SelectItem>
                              <SelectItem value="Institute">Institute</SelectItem>
                              <SelectItem value="Academy">Academy</SelectItem>
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
                          <FormDescription>
                            Overall ranking position (if available)
                          </FormDescription>
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
                            <Input {...field} placeholder="e.g., Cambridge, MA" />
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

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Official Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., https://www.harvard.edu" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="established_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Established Year</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="e.g., 1636" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="student_population"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Population</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="e.g., 23000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="campus_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campus Size</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 200 acres" />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4}
                            placeholder="Provide a comprehensive description of the university, its history, achievements, and unique features..." 
                          />
                        </FormControl>
                        <FormDescription>
                          A detailed description of the university (minimum 10 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accreditation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accreditation</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., AACSB, AMBA, EQUIS" />
                        </FormControl>
                        <FormDescription>
                          Major accreditations and certifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        Adding University...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Add University
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