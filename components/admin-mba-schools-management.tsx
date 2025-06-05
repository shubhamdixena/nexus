"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import * as React from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MbaSchoolEditForm } from "./mba-school-edit-form"
import { BulkDataOperations } from "./bulk-data-operations"
import { MoreHorizontal, Plus, Search, MapPin, Trash2, FileEdit, Eye, Loader2, Filter, RotateCcw, ArrowUpDown, CheckSquare, Square } from "lucide-react"

// Add these imports at the top of the file, after the existing imports
import { useToast } from "@/hooks/use-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Define a proper type for MBA School
interface MBASchool {
  id: string
  name: string
  type: string
  location: string
  country: string
  ranking: number
  duration: string
  tuition: string
  total_cost?: string
  description: string
  website?: string
  application_deadline?: string
  class_size?: number
  avg_gmat?: number
  gmat_range?: string
  avg_gpa?: number
  acceptance_rate?: number
  employment_rate?: number
  avg_starting_salary?: string
  top_industries?: string
  start_date?: string
  format?: string
  year1_courses?: string
  year2_courses?: string
  teaching_methodology?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
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
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
})

type MBASchoolFormValues = z.infer<typeof mbaSchoolSchema>

// Template for bulk import
const mbaSchoolImportTemplate: Partial<MBASchool>[] = [
  {
    name: "Example MBA Program",
    type: "Full-time MBA",
    location: "City, State",
    country: "Country",
    ranking: 10,
    duration: "2 years",
    tuition: "$78,700 per year",
    total_cost: "$126,536 per year",
    status: "active",
    description: "Description of the MBA program",
    application_deadline: "2024-09-08",
    class_size: 930,
    avg_gmat: 740,
    gmat_range: "700-770",
    avg_gpa: 3.69,
    acceptance_rate: 11.5,
    employment_rate: 96.7,
    avg_starting_salary: "$175,000",
    top_industries: "Consulting, Financial Services, Technology",
    start_date: "August/September",
    format: "Case method, general management focus",
    year1_courses: "Core curriculum courses",
    year2_courses: "Elective courses",
    teaching_methodology: "Case method, lectures, projects",
    website: "https://www.example.edu/mba",
  },
]

// Add filter and sort interfaces
interface Filters {
  status: string
  type: string
  country: string
  rankingMin: string
  rankingMax: string
}

interface SortConfig {
  key: keyof MBASchool | null
  direction: 'asc' | 'desc'
}

// Memoize expensive operations and prevent unnecessary re-renders
const AdminMbaSchoolsManagement = React.memo(() => {
  const [mbaSchools, setMbaSchools] = useState<MBASchool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<MBASchool | null>(null)
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false)
  const [isDeleteSchoolOpen, setIsDeleteSchoolOpen] = useState(false)
  const [isViewSchoolOpen, setIsViewSchoolOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<MBASchool | null>(null)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    status: '',
    type: '',
    country: '',
    rankingMin: '',
    rankingMax: ''
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })
  const { toast } = useToast()

  // Initialize form for adding a new school
  const form = useForm<MBASchoolFormValues>({
    resolver: zodResolver(mbaSchoolSchema),
    defaultValues: {
      name: "",
      type: "Full-time MBA",
      location: "",
      country: "",
      ranking: 0,
      duration: "",
      tuition: "",
      totalCost: "",
      description: "",
      website: "",
    },
  })

  // Memoize filtered and sorted data
  const filteredAndSortedSchools = useMemo(() => {
    let filtered = mbaSchools.filter(school => {
      const matchesSearch = !searchTerm.trim() || 
        school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.country?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = !filters.status || school.status === filters.status
      const matchesType = !filters.type || school.type === filters.type
      const matchesCountry = !filters.country || school.country?.toLowerCase().includes(filters.country.toLowerCase())
      const matchesRankingMin = !filters.rankingMin || school.ranking >= parseInt(filters.rankingMin)
      const matchesRankingMax = !filters.rankingMax || school.ranking <= parseInt(filters.rankingMax)

      return matchesSearch && matchesStatus && matchesType && matchesCountry && matchesRankingMin && matchesRankingMax
    })

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]
        
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [mbaSchools, searchTerm, filters, sortConfig])

  // Memoize the load function to prevent recreation on every render
  const loadMBASchools = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/mba-schools?page=${page}&limit=10&search=${encodeURIComponent(search)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setMbaSchools(result.data || [])
      setTotalPages(result.totalPages || 1)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error loading MBA schools:', error)
      toast({
        title: "Error",
        description: "Failed to load MBA schools. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load data on component mount
  useEffect(() => {
    loadMBASchools()
  }, [loadMBASchools])

  // Optimize search debouncing with proper cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) { // Only search if searchTerm has been set
        loadMBASchools(1, searchTerm)
      }
    }, 300) // Reduced from 500ms for better UX

    return () => clearTimeout(timer)
  }, [searchTerm, loadMBASchools])

  // Memoize handlers to prevent recreation
  const handleSchoolSelect = useCallback((school: MBASchool) => {
    if (isEditingMode) return
    setSelectedSchool(school)
  }, [isEditingMode])

  const handleEditStart = useCallback((school: MBASchool) => {
    try {
      setEditingSchool(school)
      setIsEditingMode(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load school data for editing. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleViewSchool = useCallback((school: MBASchool) => {
    try {
      setSelectedSchool(school)
      setIsViewSchoolOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load school details. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Save edited school - Replace MBASchoolRealtimeService with API call
  const handleSaveSchool = async (updatedSchool: MBASchool) => {
    try {
      const response = await fetch(`/api/admin/mba-schools/${updatedSchool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSchool),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Reload the data to reflect changes
      await loadMBASchools(currentPage, searchTerm)

      // If the edited school is the selected school, update it
      if (selectedSchool && selectedSchool.id === updatedSchool.id) {
        setSelectedSchool(result)
      }

      setEditingSchool(null)
      setIsEditingMode(false)

      toast({
        title: "School Updated",
        description: `${updatedSchool.name} has been successfully updated.`,
      })
    } catch (error) {
      console.error('Error updating MBA school:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update school information. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSchool(null)
    setIsEditingMode(false)
  }

  // Handle adding a new school - Replace MBASchoolRealtimeService with API call
  const onSubmit = async (values: MBASchoolFormValues) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Convert form values to MBA school format
      const newSchoolData = {
        name: values.name,
        type: values.type,
        location: values.location,
        country: values.country,
        ranking: values.ranking,
        duration: values.duration,
        tuition: values.tuition,
        total_cost: values.totalCost || "",
        description: values.description,
        application_deadline: values.applicationDeadline || "",
        class_size: values.classSize || 0,
        avg_gmat: values.averageGMAT || 0,
        gmat_range: values.gmatRange || "",
        avg_gpa: values.averageGPA || 0,
        acceptance_rate: values.acceptanceRate || 0,
        employment_rate: values.employmentRate || 0,
        avg_starting_salary: values.averageStartingSalary || "",
        top_industries: values.topIndustries || "",
        start_date: values.startDate || "",
        format: values.format || "",
        year1_courses: values.year1Courses || "",
        year2_courses: values.year2Courses || "",
        teaching_methodology: values.teachingMethodology || "",
        website: values.website || "",
      }

      const response = await fetch('/api/admin/mba-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchoolData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const newSchool = await response.json()
      
      // Reload data to show the new school
      await loadMBASchools(currentPage, searchTerm)
      
      setIsAddSchoolOpen(false)
      form.reset()

      toast({
        title: "School Added",
        description: `${values.name} has been successfully added.`,
      })
    } catch (error) {
      console.error('Error creating MBA school:', error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setFormError(`Failed to add school: ${errorMessage}`)
      toast({
        title: "Error",
        description: "Failed to add new school. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting a school - Replace MBASchoolRealtimeService with API call
  const handleDeleteSchool = async () => {
    if (!selectedSchool) return

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/admin/mba-schools/${selectedSchool.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const schoolName = selectedSchool.name
      
      // Reload data to reflect deletion
      await loadMBASchools(currentPage, searchTerm)
      
      setSelectedSchool(null)
      setIsDeleteSchoolOpen(false)

      toast({
        title: "School Deleted",
        description: `${schoolName} has been successfully removed.`,
      })
    } catch (error) {
      console.error('Error deleting MBA school:', error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Delete Failed",
        description: `Failed to delete school: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle bulk import of MBA schools - Replace MBASchoolRealtimeService with API calls
  const handleBulkImportMbaSchools = async (importedSchools: Partial<MBASchool>[]) => {
    try {
      // Validate imported data
      const validationErrors: string[] = []

      importedSchools.forEach((school, index) => {
        if (!school.name) validationErrors.push(`Row ${index + 1}: School name is required`)
        if (!school.location) validationErrors.push(`Row ${index + 1}: Location is required`)
        if (!school.country) validationErrors.push(`Row ${index + 1}: Country is required`)
        if (school.ranking && (isNaN(Number(school.ranking)) || Number(school.ranking) <= 0)) {
          validationErrors.push(`Row ${index + 1}: Ranking must be a positive number`)
        }
      })

      if (validationErrors.length > 0) {
        toast({
          title: "Import Failed",
          description: `${validationErrors.length} validation errors found. Please check your data.`,
          variant: "destructive",
        })
        console.error("Validation errors:", validationErrors)
        return
      }

      // Create schools one by one using API calls
      for (const schoolData of importedSchools) {
        const response = await fetch('/api/admin/mba-schools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...schoolData,
            status: schoolData.status || 'active'
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to import school: ${schoolData.name}`)
        }
      }

      // Reload data to show imported schools
      await loadMBASchools(currentPage, searchTerm)

      toast({
        title: "Import Successful",
        description: `${importedSchools.length} schools have been imported.`,
      })
    } catch (error) {
      console.error('Error importing MBA schools:', error)
      toast({
        title: "Import Failed",
        description: "Failed to import schools. Please check your data format and try again.",
        variant: "destructive",
      })
    }
  }

  // Handle sorting
  const handleSort = useCallback((key: keyof MBASchool) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Handle status toggle
  const handleStatusToggle = useCallback(async (schoolId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      
      const response = await fetch(`/api/admin/mba-schools/${schoolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update local state
      setMbaSchools(prev => prev.map(school => 
        school.id === schoolId ? { ...school, status: newStatus as 'active' | 'inactive' } : school
      ))

      toast({
        title: "Status Updated",
        description: `School status changed to ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Handle bulk operations
  const handleBulkStatusUpdate = useCallback(async (newStatus: 'active' | 'inactive') => {
    if (selectedSchoolIds.length === 0) return

    try {
      setIsSubmitting(true)
      
      // Update all selected schools
      const promises = selectedSchoolIds.map(id => 
        fetch(`/api/admin/mba-schools/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
      )

      await Promise.all(promises)

      // Update local state
      setMbaSchools(prev => prev.map(school => 
        selectedSchoolIds.includes(school.id) ? { ...school, status: newStatus } : school
      ))

      setSelectedSchoolIds([])
      
      toast({
        title: "Bulk Update Complete",
        description: `${selectedSchoolIds.length} schools updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error('Error bulk updating:', error)
      toast({
        title: "Bulk Update Failed",
        description: "Failed to update schools. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedSchoolIds, toast])

  const handleBulkDelete = useCallback(async () => {
    if (selectedSchoolIds.length === 0) return

    try {
      setIsSubmitting(true)
      
      const promises = selectedSchoolIds.map(id => 
        fetch(`/api/admin/mba-schools/${id}`, {
          method: 'DELETE',
        })
      )

      await Promise.all(promises)

      // Update local state
      setMbaSchools(prev => prev.filter(school => !selectedSchoolIds.includes(school.id)))
      setSelectedSchoolIds([])
      
      toast({
        title: "Bulk Delete Complete",
        description: `${selectedSchoolIds.length} schools deleted.`,
      })
    } catch (error) {
      console.error('Error bulk deleting:', error)
      toast({
        title: "Bulk Delete Failed",
        description: "Failed to delete schools. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedSchoolIds, toast])

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (selectedSchoolIds.length === filteredAndSortedSchools.length) {
      setSelectedSchoolIds([])
    } else {
      setSelectedSchoolIds(filteredAndSortedSchools.map(school => school.id))
    }
  }, [selectedSchoolIds.length, filteredAndSortedSchools])

  const handleSelectSchool = useCallback((schoolId: string) => {
    setSelectedSchoolIds(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    )
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: '',
      type: '',
      country: '',
      rankingMin: '',
      rankingMax: ''
    })
    setSearchTerm('')
    setSortConfig({ key: null, direction: 'asc' })
  }, [])

  // Get unique values for filter dropdowns
  const uniqueCountries = useMemo(() => 
    Array.from(new Set(mbaSchools.map(school => school.country).filter(Boolean))), 
    [mbaSchools]
  )

  const uniqueTypes = useMemo(() => 
    Array.from(new Set(mbaSchools.map(school => school.type).filter(Boolean))), 
    [mbaSchools]
  )

  // If in editing mode, show the edit form
  if (isEditingMode && editingSchool) {
    return <MbaSchoolEditForm school={editingSchool} onSave={handleSaveSchool} onCancel={handleCancelEdit} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">MBA Schools Management</CardTitle>
          <CardDescription>Manage MBA programs and their comprehensive details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <Button onClick={() => setIsAddSchoolOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add MBA School
                </Button>
                <BulkDataOperations
                  entityType="MBA Schools"
                  onImport={handleBulkImportMbaSchools}
                  exportData={mbaSchools}
                  importTemplate={mbaSchoolImportTemplate}
                />
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filters</CardTitle>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="status-filter">Status</Label>
                      <Select value={filters.status || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="type-filter">Program Type</Label>
                      <Select value={filters.type || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === "all" ? "" : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {uniqueTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="country-filter">Country</Label>
                      <Select value={filters.country || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value === "all" ? "" : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="All countries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {uniqueCountries.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="ranking-min">Min Ranking</Label>
                      <Input
                        id="ranking-min"
                        type="number"
                        placeholder="1"
                        value={filters.rankingMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, rankingMin: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ranking-max">Max Ranking</Label>
                      <Input
                        id="ranking-max"
                        type="number"
                        placeholder="100"
                        value={filters.rankingMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, rankingMax: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bulk Actions */}
            {selectedSchoolIds.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {selectedSchoolIds.length} school(s) selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkStatusUpdate('active')}
                        disabled={isSubmitting}
                      >
                        Activate Selected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkStatusUpdate('inactive')}
                        disabled={isSubmitting}
                      >
                        Deactivate Selected
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={isSubmitting}
                      >
                        Delete Selected
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedSchoolIds.length === filteredAndSortedSchools.length && filteredAndSortedSchools.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 font-semibold">
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('type')} className="h-auto p-0 font-semibold">
                        Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('location')} className="h-auto p-0 font-semibold">
                        Location
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('ranking')} className="h-auto p-0 font-semibold">
                        Ranking
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>GMAT</TableHead>
                    <TableHead>Acceptance</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('status')} className="h-auto p-0 font-semibold">
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading MBA schools...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedSchools.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                        No MBA schools found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedSchools.map((school) => (
                      <TableRow
                        key={school.id}
                        className={selectedSchool?.id === school.id ? "bg-muted/50" : ""}
                        onClick={() => handleSchoolSelect(school)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedSchoolIds.includes(school.id)}
                            onCheckedChange={() => handleSelectSchool(school.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                            {school.location}, {school.country}
                          </div>
                        </TableCell>
                        <TableCell>#{school.ranking}</TableCell>
                        <TableCell>{school.avg_gmat || 'N/A'}</TableCell>
                        <TableCell>{school.acceptance_rate ? `${school.acceptance_rate}%` : 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusToggle(school.id, school.status)
                            }}
                          >
                            <Badge variant={school.status === "active" ? "default" : "secondary"}>
                              {school.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewSchool(school)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
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
                                    handleViewSchool(school)
                                  }}
                                  className="text-blue-600 dark:text-blue-400"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditStart(school)
                                  }}
                                >
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedSchool(school)
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadMBASchools(currentPage - 1, searchTerm)}
                    disabled={currentPage <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadMBASchools(currentPage + 1, searchTerm)}
                    disabled={currentPage >= totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add School Dialog */}
      <Dialog
        open={isAddSchoolOpen}
        onOpenChange={(open) => {
          setIsAddSchoolOpen(open)
          if (!open) {
            form.reset()
            setFormError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New MBA School</DialogTitle>
            <DialogDescription>Enter the details for the new MBA program.</DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectValue placeholder="Select program type" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location*</FormLabel>
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
                      <FormLabel>Country*</FormLabel>
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
                        <Input {...field} placeholder="e.g., 2 years" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tuition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tuition*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., $78,000 per year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalCost"
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

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., https://www.school.edu/mba" />
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
                    <FormDescription>Provide a brief overview of the MBA program.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="averageGMAT"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average GMAT</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="200" max="800" />
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
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddSchoolOpen(false)
                    form.reset()
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
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete School Dialog */}
      <Dialog open={isDeleteSchoolOpen} onOpenChange={setIsDeleteSchoolOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete MBA School</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this MBA school? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <div className="py-4">
              <p className="font-medium">{selectedSchool.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedSchool.location}, {selectedSchool.country}
              </p>
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
            <Button type="button" variant="destructive" onClick={handleDeleteSchool} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View School Dialog - Keep this part unchanged */}
      <Dialog open={isViewSchoolOpen} onOpenChange={setIsViewSchoolOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>MBA School Details</DialogTitle>
            <DialogDescription>Comprehensive information about the MBA program.</DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{selectedSchool.name}</h3>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {selectedSchool.location}, {selectedSchool.country}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">#{selectedSchool.ranking} Ranking</Badge>
                  <Badge variant={selectedSchool.status === "active" ? "default" : "secondary"}>
                    {selectedSchool.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Program Type</h4>
                    <p>{selectedSchool.type}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Duration</h4>
                    <p>{selectedSchool.duration}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Tuition</h4>
                    <p>{selectedSchool.tuition}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Total Cost</h4>
                    <p>{selectedSchool.total_cost}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Website</h4>
                    <p className="text-blue-600 hover:underline">
                      <a href={selectedSchool.website} target="_blank" rel="noopener noreferrer">
                        {selectedSchool.website}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Class Size</h4>
                    <p>{selectedSchool.class_size} students</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Average GMAT</h4>
                    <p>
                      {selectedSchool.avg_gmat} (Range: {selectedSchool.gmat_range})
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Average GPA</h4>
                    <p>{selectedSchool.avg_gpa}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Acceptance Rate</h4>
                    <p>{selectedSchool.acceptance_rate}%</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Employment Rate</h4>
                    <p>{selectedSchool.employment_rate}%</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Description</h4>
                <p className="mt-1">{selectedSchool.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Year 1 Courses</h4>
                  <p className="mt-1">{selectedSchool.year1_courses}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Year 2 Courses</h4>
                  <p className="mt-1">{selectedSchool.year2_courses}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Teaching Methodology</h4>
                  <p className="mt-1">{selectedSchool.teaching_methodology}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Format</h4>
                  <p className="mt-1">{selectedSchool.format}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Top Industries</h4>
                  <p className="mt-1">{selectedSchool.top_industries}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Average Starting Salary</h4>
                  <p className="mt-1">{selectedSchool.avg_starting_salary}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsViewSchoolOpen(false)}>
              Close
            </Button>
            {selectedSchool && (
              <Button
                type="button"
                onClick={() => {
                  setIsViewSchoolOpen(false)
                  handleEditStart(selectedSchool)
                }}
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Edit School
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

export { AdminMbaSchoolsManagement }
