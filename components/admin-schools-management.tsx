"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Plus, Search, BookOpen, Building, MapPin, Trash2, Edit, FileEdit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SchoolEditForm } from "./school-edit-form"
import { BulkDataOperations } from "./bulk-data-operations"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define proper types for the data structures
interface School {
  id: string
  name: string
  type: string
  location: string
  country: string
  ranking: number
  programs?: number
  status: 'active' | 'inactive'
  description?: string
  website?: string
  created_at?: string
  updated_at?: string
}

interface Program {
  id: string
  schoolId: string
  name: string
  type: string
  duration: string
  tuition: string
  status: 'active' | 'inactive'
}

interface MBASchoolData {
  id: string
  name: string
  type: string
  location: string
  country: string
  ranking: number
  duration: string
  tuition: string
  totalCost?: string
  status: 'active' | 'inactive'
  description?: string
  website?: string
  applicationDeadline?: string
  classSize?: number
  averageGMAT?: number
  gmatRange?: string
  averageGPA?: number
  acceptanceRate?: number
  employmentRate?: number
  averageSalary?: string
  industries?: string
  startDate?: string
  format?: string
  year1Courses?: string
  year2Courses?: string
  teachingMethodology?: string
  globalFocus?: string
  facultySize?: string
  researchCenters?: string
  admissionRequirements?: string
  workExperience?: string
  applicationComponents?: string
  classProfile?: string
  internationalStudents?: string
  alumniNetwork?: string
  campusLife?: string
}

// Templates for bulk import - keep minimal examples
const schoolImportTemplate = [
  {
    name: "Example University",
    type: "University",
    location: "City, State",
    country: "Country",
    ranking: 10,
    status: "active",
    description: "Description of the university",
    website: "https://www.example.edu",
  },
]

const mbaSchoolImportTemplate = [
  {
    name: "Example MBA Program",
    type: "Full-time MBA",
    location: "City, State",
    country: "Country",
    ranking: 10,
    duration: "2 years",
    tuition: "$78,700 per year",
    totalCost: "$126,536 per year",
    status: "active",
    description: "Description of the MBA program",
    website: "https://www.example.edu/mba",
  },
]

const programImportTemplate = [
  {
    schoolId: "1", // Must match an existing school ID
    name: "Program Name",
    type: "Full-time",
    duration: "2 years",
    tuition: "$50,000 per year",
    status: "active",
  },
]

export function AdminSchoolsManagement() {
  // Initialize with properly typed empty arrays
  const [schools, setSchools] = useState<School[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [mbaSchools, setMbaSchools] = useState<MBASchoolData[]>([])
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [selectedMbaSchool, setSelectedMbaSchool] = useState<MBASchoolData | null>(null)
  
  // Dialog states
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false)
  const [isDeleteSchoolOpen, setIsDeleteSchoolOpen] = useState(false)
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false)
  const [isEditProgramOpen, setIsEditProgramOpen] = useState(false)
  const [isDeleteProgramOpen, setIsDeleteProgramOpen] = useState(false)
  const [isAddMbaSchoolOpen, setIsAddMbaSchoolOpen] = useState(false)
  const [isDeleteMbaSchoolOpen, setIsDeleteMbaSchoolOpen] = useState(false)
  const [isEditMbaSchoolOpen, setIsEditMbaSchoolOpen] = useState(false)
  
  const [activeTab, setActiveTab] = useState("universities")
  const [editingSchool, setEditingSchool] = useState<any>(null)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [editingMbaSchool, setEditingMbaSchool] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load schools from API
  const loadSchools = async (page = 1, search = "") => {
    try {
      const response = await fetch(`/api/admin/schools?page=${page}&limit=10&search=${encodeURIComponent(search)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setSchools(result.data || [])
    } catch (error) {
      console.error('Error loading schools:', error)
      toast({
        title: "Error",
        description: "Failed to load schools. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Load MBA schools from API
  const loadMBASchools = async (page = 1, search = "") => {
    try {
      const response = await fetch(`/api/admin/mba-schools?page=${page}&limit=50&search=${encodeURIComponent(search)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setMbaSchools(result.data || [])
    } catch (error) {
      console.error('Error loading MBA schools:', error)
      toast({
        title: "Error",
        description: "Failed to load MBA schools. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadSchools()
    loadMBASchools()
  }, [])

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSchools(1, searchTerm)
      loadMBASchools(1, searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Filter functions
  const filteredSchools = schools.filter(
    (school) =>
      school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.country?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPrograms = programs.filter((program) => selectedSchool && program.schoolId === selectedSchool.id)

  const filteredMbaSchools = mbaSchools.filter(
    (school) =>
      school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.country?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle school selection
  const handleSchoolSelect = (school: any) => {
    if (isEditingMode) return // Don't select if in edit mode

    setSelectedSchool(school)
    setSelectedProgram(null)
  }

  // Start editing a school
  const handleEditStart = (school: any) => {
    setEditingSchool(school)
    setIsEditingMode(true)
  }

  // Save edited school
  const handleSaveSchool = async (updatedSchool: any) => {
    try {
      const response = await fetch(`/api/admin/schools/${updatedSchool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedSchool.name,
          type: updatedSchool.type,
          location: updatedSchool.location,
          country: updatedSchool.country,
          ranking: updatedSchool.ranking,
          website: updatedSchool.website,
          description: updatedSchool.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Reload schools to reflect changes
      await loadSchools(1, searchTerm)

      // If the edited school is the selected school, update it
      if (selectedSchool && selectedSchool.id === updatedSchool.id) {
        setSelectedSchool(result)
      }

      setEditingSchool(null)
      setIsEditingMode(false)

      toast({
        title: "Success",
        description: `${updatedSchool.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error('Error updating school:', error)
      toast({
        title: "Error",
        description: "Failed to update school. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSchool(null)
    setIsEditingMode(false)
  }

  // Handle adding a new school
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      const schoolData = {
        name: formData.get("name") as string,
        type: formData.get("type") as string,
        location: formData.get("location") as string,
        country: formData.get("country") as string,
        ranking: Number.parseInt(formData.get("ranking") as string),
        description: (formData.get("description") as string) || "",
        website: (formData.get("website") as string) || "",
      }

      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const newSchool = await response.json()
      
      // Reload schools to show the new one
      await loadSchools(1, searchTerm)
      
      setIsAddSchoolOpen(false)
      
      toast({
        title: "Success",
        description: `${schoolData.name} has been added successfully.`,
      })
    } catch (error) {
      console.error("Error adding school:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setFormError(`Failed to add school: ${errorMessage}`)
      
      toast({
        title: "Error",
        description: "Failed to add school. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting a school
  const handleDeleteSchool = async () => {
    if (!selectedSchool) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/schools/${selectedSchool.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const schoolName = selectedSchool.name
      
      // Reload schools to reflect deletion
      await loadSchools(1, searchTerm)
      
      setSelectedSchool(null)
      setIsDeleteSchoolOpen(false)
      
      toast({
        title: "Success",
        description: `${schoolName} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting school:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      
      toast({
        title: "Error",
        description: `Failed to delete school: ${errorMessage}`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle adding a new program
  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newProgram: Program = {
      id: (programs.length + 1).toString(),
      schoolId: selectedSchool.id,
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      duration: formData.get("duration") as string,
      tuition: formData.get("tuition") as string,
      status: "active" as const,
    }

    setPrograms([...programs, newProgram])

    // Update school program count
    const updatedSchool: School = {
      ...selectedSchool,
      programs: (selectedSchool.programs || 0) + 1,
    }

    setSchools(schools.map((school) => (school.id === selectedSchool.id ? updatedSchool : school)))
    setSelectedSchool(updatedSchool)

    setIsAddProgramOpen(false)
  }

  // Handle editing a program
  const handleEditProgram = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProgram) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const updatedProgram: Program = {
      ...selectedProgram,
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      duration: formData.get("duration") as string,
      tuition: formData.get("tuition") as string,
      status: formData.get("status") as "active" | "inactive",
    }

    setPrograms(programs.map((program) => (program.id === selectedProgram.id ? updatedProgram : program)))
    setSelectedProgram(updatedProgram)
    setIsEditProgramOpen(false)
  }

  // Handle deleting a program
  const handleDeleteProgram = () => {
    if (!selectedProgram || !selectedSchool) return

    setPrograms(programs.filter((program) => program.id !== selectedProgram.id))

    // Update school program count
    const updatedSchool: School = {
      ...selectedSchool,
      programs: Math.max((selectedSchool.programs || 0) - 1, 0),
    }

    setSchools(schools.map((school) => (school.id === selectedSchool.id ? updatedSchool : school)))
    setSelectedSchool(updatedSchool)

    setSelectedProgram(null)
    setIsDeleteProgramOpen(false)
  }

  // Handle MBA school selection
  const handleMbaSchoolSelect = (school: any) => {
    if (isEditingMode) return // Don't select if in edit mode

    setSelectedMbaSchool(school)
  }

  // Start editing an MBA school
  const handleEditMbaSchoolStart = (school: any) => {
    setEditingMbaSchool(school)
    setIsEditMbaSchoolOpen(true)
  }

  // Save edited MBA school
  const handleSaveMbaSchool = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMbaSchool) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const updatedMbaSchool = {
      ...editingMbaSchool,
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      location: formData.get("location") as string,
      country: formData.get("country") as string,
      ranking: Number.parseInt(formData.get("ranking") as string),
      duration: formData.get("duration") as string,
      tuition: formData.get("tuition") as string,
      totalCost: formData.get("totalCost") as string,
      description: formData.get("description") as string,
      applicationDeadline: formData.get("applicationDeadline") as string,
      classSize: Number.parseInt(formData.get("classSize") as string),
      averageGMAT: Number.parseInt(formData.get("averageGMAT") as string),
      gmatRange: formData.get("gmatRange") as string,
      averageGPA: Number.parseFloat(formData.get("averageGPA") as string),
      acceptanceRate: Number.parseFloat(formData.get("acceptanceRate") as string),
      employmentRate: Number.parseFloat(formData.get("employmentRate") as string),
      averageSalary: formData.get("averageSalary") as string,
      industries: formData.get("industries") as string,
      startDate: formData.get("startDate") as string,
      format: formData.get("format") as string,
      year1Courses: formData.get("year1Courses") as string,
      year2Courses: formData.get("year2Courses") as string,
      teachingMethodology: formData.get("teachingMethodology") as string,
      globalFocus: formData.get("globalFocus") as string,
      facultySize: formData.get("facultySize") as string,
      researchCenters: formData.get("researchCenters") as string,
      admissionRequirements: formData.get("admissionRequirements") as string,
      workExperience: formData.get("workExperience") as string,
      applicationComponents: formData.get("applicationComponents") as string,
      classProfile: formData.get("classProfile") as string,
      internationalStudents: formData.get("internationalStudents") as string,
      alumniNetwork: formData.get("alumniNetwork") as string,
      campusLife: formData.get("campusLife") as string,
      website: formData.get("website") as string,
      status: formData.get("status") as string,
    }

    setMbaSchools(mbaSchools.map((school) => (school.id === updatedMbaSchool.id ? updatedMbaSchool : school)))

    // If the edited school is the selected school, update it
    if (selectedMbaSchool && selectedMbaSchool.id === updatedMbaSchool.id) {
      setSelectedMbaSchool(updatedMbaSchool)
    }

    setEditingMbaSchool(null)
    setIsEditMbaSchoolOpen(false)
  }

  // Handle adding a new MBA school
  const handleAddMbaSchool = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newMbaSchool: MBASchoolData = {
      id: (mbaSchools.length + 1).toString(),
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      location: formData.get("location") as string,
      country: formData.get("country") as string,
      ranking: Number.parseInt(formData.get("ranking") as string),
      duration: formData.get("duration") as string,
      tuition: formData.get("tuition") as string,
      totalCost: formData.get("totalCost") as string,
      status: "active" as const,
      description: formData.get("description") as string,
      applicationDeadline: formData.get("applicationDeadline") as string,
      classSize: Number.parseInt(formData.get("classSize") as string),
      averageGMAT: Number.parseInt(formData.get("averageGMAT") as string),
      gmatRange: formData.get("gmatRange") as string,
      averageGPA: Number.parseFloat(formData.get("averageGPA") as string),
      acceptanceRate: Number.parseFloat(formData.get("acceptanceRate") as string),
      employmentRate: Number.parseFloat(formData.get("employmentRate") as string),
      averageSalary: formData.get("averageSalary") as string,
      industries: formData.get("industries") as string,
      startDate: formData.get("startDate") as string,
      format: formData.get("format") as string,
      year1Courses: formData.get("year1Courses") as string,
      year2Courses: formData.get("year2Courses") as string,
      teachingMethodology: formData.get("teachingMethodology") as string,
      globalFocus: (formData.get("globalFocus") as string) || "",
      facultySize: (formData.get("facultySize") as string) || "",
      researchCenters: (formData.get("researchCenters") as string) || "",
      admissionRequirements: (formData.get("admissionRequirements") as string) || "",
      workExperience: (formData.get("workExperience") as string) || "",
      applicationComponents: (formData.get("applicationComponents") as string) || "",
      classProfile: (formData.get("classProfile") as string) || "",
      internationalStudents: (formData.get("internationalStudents") as string) || "",
      alumniNetwork: (formData.get("alumniNetwork") as string) || "",
      campusLife: (formData.get("campusLife") as string) || "",
      website: formData.get("website") as string,
    }

    setMbaSchools([...mbaSchools, newMbaSchool])
    setIsAddMbaSchoolOpen(false)
  }

  // Handle bulk import of programs
  const handleBulkImportPrograms = (importedPrograms: any[]) => {
    if (!selectedSchool) return

    // Generate new IDs for imported programs and set the schoolId
    const newPrograms = importedPrograms.map((program, index) => ({
      ...program,
      id: (programs.length + index + 1).toString(),
      schoolId: selectedSchool.id,
      status: program.status || "active",
    }))

    setPrograms([...programs, ...newPrograms])

    // Update school program count
    const updatedSchool = {
      ...selectedSchool,
      programs: (selectedSchool.programs || 0) + newPrograms.length,
    }

    setSchools(schools.map((school) => (school.id === selectedSchool.id ? updatedSchool : school)))
    setSelectedSchool(updatedSchool)
  }

  // If in editing mode, show the edit form
  if (isEditingMode) {
    if (editingSchool) {
      return <SchoolEditForm school={editingSchool} onSave={handleSaveSchool} onCancel={handleCancelEdit} />
    }
    if (editingMbaSchool) {
      return <SchoolEditForm school={editingMbaSchool} onSave={handleSaveSchool} onCancel={handleCancelEdit} />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Schools & Programs Management</CardTitle>
          <CardDescription>Manage universities, business schools, and their academic programs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="universities">
                <Building className="mr-2 h-4 w-4" />
                Universities
              </TabsTrigger>
              <TabsTrigger value="mba-schools">
                <BookOpen className="mr-2 h-4 w-4" />
                MBA Schools
              </TabsTrigger>
              <TabsTrigger value="programs" disabled={!selectedSchool}>
                <BookOpen className="mr-2 h-4 w-4" />
                Programs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="universities" className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search schools..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddSchoolOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add School
                  </Button>
                  <BulkDataOperations
                    entityType="Schools"
                    onImport={(data) => setSchools([...schools, ...data])}
                    exportData={schools}
                    importTemplate={schoolImportTemplate}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Ranking</TableHead>
                      <TableHead>Programs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                          No schools found. Add your first school to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSchools.map((school) => (
                        <TableRow
                          key={school.id}
                          className={selectedSchool?.id === school.id ? "bg-muted/50" : ""}
                          onClick={() => handleSchoolSelect(school)
                          }
                        >
                          <TableCell className="font-medium">{school.name}</TableCell>
                          <TableCell>{school.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                              {school.location}, {school.country}
                            </div>
                          </TableCell>
                          <TableCell>#{school.ranking}</TableCell>
                          <TableCell>{school.programs || 0}</TableCell>
                          <TableCell>
                            <Badge variant={school.status === "active" ? "default" : "secondary"}>
                              {school.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditStart(school)
                                }}
                              >
                                <FileEdit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActiveTab("programs")
                                    }}
                                    className="text-blue-600 dark:text-blue-400"
                                  >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Manage Programs
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setIsDeleteSchoolOpen(true)
                                    }}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="mba-schools" className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search MBA schools..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddMbaSchoolOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add MBA School
                  </Button>
                  <BulkDataOperations
                    entityType="MBA Schools"
                    onImport={(data) => setMbaSchools([...mbaSchools, ...data])}
                    exportData={mbaSchools}
                    importTemplate={mbaSchoolImportTemplate}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Ranking</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMbaSchools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                          No MBA schools found. Add your first MBA program to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMbaSchools.map((school) => (
                        <TableRow
                          key={school.id}
                          className={selectedMbaSchool?.id === school.id ? "bg-muted/50" : ""}
                          onClick={() => setSelectedMbaSchool(school)}
                        >
                          <TableCell className="font-medium">{school.name}</TableCell>
                          <TableCell>{school.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                              {school.location}, {school.country}
                            </div>
                          </TableCell>
                          <TableCell>#{school.ranking}</TableCell>
                          <TableCell>{school.duration}</TableCell>
                          <TableCell>
                            <Badge variant={school.status === "active" ? "default" : "secondary"}>
                              {school.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingMbaSchool(school)
                                  setIsEditMbaSchoolOpen(true)
                                }}
                              >
                                <FileEdit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setIsDeleteMbaSchoolOpen(true)
                                    }}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="programs" className="space-y-4">
              {selectedSchool ? (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{selectedSchool.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedSchool.location}, {selectedSchool.country}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setIsAddProgramOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Program
                      </Button>
                      <BulkDataOperations
                        entityType="Programs"
                        onImport={(data) => setPrograms([...programs, ...data])}
                        exportData={filteredPrograms}
                        importTemplate={programImportTemplate}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Tuition</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPrograms.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                              No programs found for this school. Add your first program to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPrograms.map((program) => (
                            <TableRow
                              key={program.id}
                              className={selectedProgram?.id === program.id ? "bg-muted/50" : ""}
                              onClick={() => setSelectedProgram(program)}
                            >
                              <TableCell className="font-medium">{program.name}</TableCell>
                              <TableCell>{program.type}</TableCell>
                              <TableCell>{program.duration}</TableCell>
                              <TableCell>{program.tuition}</TableCell>
                              <TableCell>
                                <Badge variant={program.status === "active" ? "default" : "secondary"}>
                                  {program.status === "active" ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsEditProgramOpen(true)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setIsDeleteProgramOpen(true)}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-6">
                  Select a school from the Universities tab to manage its programs.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add School Dialog */}
      <Dialog open={isAddSchoolOpen} onOpenChange={setIsAddSchoolOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
            <DialogDescription>Add a new university or business school to the platform.</DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddSchool}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">School Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">School Type</Label>
                <Select name="type" defaultValue="Business School">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business School">Business School</SelectItem>
                    <SelectItem value="University">University</SelectItem>
                    <SelectItem value="College">College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ranking">Ranking</Label>
                <Input id="ranking" name="ranking" type="number" min="1" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" placeholder="https://www.example.edu" />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAddSchoolOpen(false)
                  setFormError(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add School"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete School Dialog */}
      <Dialog open={isDeleteSchoolOpen} onOpenChange={setIsDeleteSchoolOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete School</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this school? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <div className="py-4">
              <p className="font-medium">{selectedSchool.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedSchool.location}, {selectedSchool.country}
              </p>
              <p className="text-sm text-muted-foreground mt-2">This will also delete all associated programs.</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteSchoolOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteSchool}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Program Dialog */}
      <Dialog open={isAddProgramOpen} onOpenChange={setIsAddProgramOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Program</DialogTitle>
            <DialogDescription>Add a new academic program to {selectedSchool?.name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProgram}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="programName">Program Name</Label>
                <Input id="programName" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="programType">Program Type</Label>
                <Select name="type" defaultValue="Full-time">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="programDuration">Duration</Label>
                  <Input id="programDuration" name="duration" placeholder="e.g., 2 years" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="programTuition">Tuition</Label>
                  <Input id="programTuition" name="tuition" placeholder="e.g., $50,000/year" required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddProgramOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Program</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog open={isEditProgramOpen} onOpenChange={setIsEditProgramOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>Update the program information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProgram}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editProgramName">Program Name</Label>
                <Input
                  id="editProgramName"
                  name="name"
                  defaultValue={selectedProgram?.name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editProgramType">Program Type</Label>
                <Select name="type" defaultValue={selectedProgram?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editProgramDuration">Duration</Label>
                  <Input
                    id="editProgramDuration"
                    name="duration"
                    defaultValue={selectedProgram?.duration}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editProgramTuition">Tuition</Label>
                  <Input
                    id="editProgramTuition"
                    name="tuition"
                    defaultValue={selectedProgram?.tuition}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editProgramStatus">Status</Label>
                <Select name="status" defaultValue={selectedProgram?.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditProgramOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Program</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Program Dialog */}
      <Dialog open={isDeleteProgramOpen} onOpenChange={setIsDeleteProgramOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this program? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedProgram && (
            <div className="py-4">
              <p className="font-medium">{selectedProgram.name}</p>
              <p className="text-sm text-muted-foreground">{selectedProgram.type}</p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteProgramOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteProgram}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
