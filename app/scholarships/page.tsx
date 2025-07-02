"use client"

import { Bookmark, Filter, Globe, Search, Loader2, Calendar, DollarSign, ExternalLink, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useScholarships } from "@/hooks/use-cached-data"
import { ScholarshipPagination } from "@/components/scholarship-pagination"

// API response scholarship interface (different from the legacy one below)
interface ScholarshipData {
  id: string
  title: string
  organization?: string
  country?: string
  amount?: number | null
  deadline: string
  degree?: string
  field?: string
  description?: string
  eligibility_criteria?: string
  benefits?: string
  fully_funded?: string
  official_url?: string
  apply_url?: string
  status?: string
  created_at: string
  updated_at: string
}

function ScholarshipsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [filters, setFilters] = useState({
    countries: [] as string[],
    fundingTypes: [] as string[],
  })

  // Fetch scholarships using the hook with pagination
  const { data: scholarshipResponse, loading, error, refetch } = useScholarships({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    country: filters.countries.length === 1 ? filters.countries[0] : undefined
  })

  const scholarships = scholarshipResponse?.data || []
  const pagination = scholarshipResponse?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  }

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters])

  // Extract unique countries from fetched data (we'll get all countries for filters)
  const [allCountries, setAllCountries] = useState<string[]>([])
  
  // Fetch all countries for filter dropdown
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/scholarships?limit=100')
        const data = await response.json()
        if (data.success) {
          const countries = Array.from(new Set(
            data.data
              .map((s: ScholarshipData) => s.country)
              .filter((country: string | undefined): country is string => Boolean(country))
          )) as string[]
          setAllCountries(countries)
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error)
      }
    }
    fetchCountries()
  }, [])
  const fundingTypes = ["Fully Funded", "Partially Funded", "Merit-based"]

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const toggleCountryFilter = (country: string) => {
    setFilters((prev) => {
      if (prev.countries.includes(country)) {
        return { ...prev, countries: prev.countries.filter((c) => c !== country) }
      } else {
        return { ...prev, countries: [...prev.countries, country] }
      }
    })
  }

  const toggleFundingTypeFilter = (type: string) => {
    setFilters((prev) => {
      if (prev.fundingTypes.includes(type)) {
        return { ...prev, fundingTypes: prev.fundingTypes.filter((t) => t !== type) }
      } else {
        return { ...prev, fundingTypes: [...prev.fundingTypes, type] }
      }
    })
  }

  const resetFilters = () => {
    setFilters({ countries: [], fundingTypes: [] })
    setSearchTerm("")
  }

  // Apply client-side funding type filter since API doesn't support this yet
  const filteredScholarships = scholarships.filter((scholarship: ScholarshipData) => {
    if (filters.fundingTypes.length === 0) return true

    const isFullyFunded = scholarship.fully_funded === "Yes" || 
      (scholarship.benefits && scholarship.benefits.toLowerCase().includes("full"))
    const isPartiallyFunded = scholarship.benefits && 
      (scholarship.benefits.toLowerCase().includes("partial") || 
       scholarship.benefits.toLowerCase().includes("tuition"))
    
    const fundingType = isFullyFunded ? "Fully Funded" : 
                       isPartiallyFunded ? "Partially Funded" : "Merit-based"

    return filters.fundingTypes.includes(fundingType)
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading scholarships...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">Error loading scholarships: {error}</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scholarship Explorer</h1>
            <p className="text-muted-foreground mt-2">Find scholarships that match your profile and preferences</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bookmark className="mr-2 h-4 w-4" />
              Saved
            </Button>
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters{" "}
                  {(filters.countries.length > 0 || filters.fundingTypes.length > 0) && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {filters.countries.length + filters.fundingTypes.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter Scholarships</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={filters.countries.length === 1 ? filters.countries[0] : ""}
                      onValueChange={(value) => {
                        if (value === "all") {
                          setFilters((prev) => ({ ...prev, countries: [] }))
                        } else {
                          setFilters((prev) => ({ ...prev, countries: [value] }))
                        }
                      }}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {allCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funding-type">Funding Type</Label>
                    <Select
                      value={filters.fundingTypes.length === 1 ? filters.fundingTypes[0] : ""}
                      onValueChange={(value) => {
                        if (value === "all") {
                          setFilters((prev) => ({ ...prev, fundingTypes: [] }))
                        } else {
                          setFilters((prev) => ({ ...prev, fundingTypes: [value] }))
                        }
                      }}
                    >
                      <SelectTrigger id="funding-type">
                        <SelectValue placeholder="Select funding type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Funding Types</SelectItem>
                        {fundingTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="degree-level">Degree Level</Label>
                    <Select>
                      <SelectTrigger id="degree-level">
                        <SelectValue placeholder="Select degree level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Degrees</SelectItem>
                        <SelectItem value="bachelors">Bachelors</SelectItem>
                        <SelectItem value="masters">Masters</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount Range (USD)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" placeholder="Min" className="w-full" />
                      <span>to</span>
                      <Input type="number" placeholder="Max" className="w-full" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Tabs defaultValue="all" className="w-auto">
              <TabsList>
                <TabsTrigger value="all">All Scholarships</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search scholarships..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredScholarships.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No matching scholarships</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters to find more scholarships</p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredScholarships.map((scholarship: ScholarshipData) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
              
              {/* Pagination */}
              <ScholarshipPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                isLoading={loading}
              />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function ScholarshipCard({ scholarship }: { scholarship: ScholarshipData }) {
  // Determine funding type and badges
  const getFundingType = () => {
    if (scholarship?.fully_funded === "Yes") return "Fully Funded"
    if (scholarship?.benefits?.toLowerCase().includes("full")) return "Fully Funded"
    if (scholarship?.benefits?.toLowerCase().includes("partial")) return "Partially Funded"
    if (scholarship?.amount && scholarship.amount > 40000) return "Fully Funded"
    if (scholarship?.amount && scholarship.amount > 20000) return "Partially Funded"
    return "Merit-based"
  }

  const fundingType = getFundingType()

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-3">
          <CardTitle className="text-lg font-semibold leading-tight pr-2 line-clamp-2">
            {scholarship.title}
          </CardTitle>
          <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
        
        <CardDescription className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{scholarship.organization} • {scholarship.country}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4 space-y-4">
        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {scholarship.degree && (
            <Badge variant="secondary" className="text-xs">
              {scholarship.degree}
            </Badge>
          )}
          <Badge variant={fundingType === "Fully Funded" ? "default" : "outline"} className="text-xs">
            {fundingType}
          </Badge>
          {scholarship.field && (
            <Badge variant="outline" className="text-xs">
              {scholarship.field}
            </Badge>
          )}
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600 mr-2" />
              <span className="text-xs text-muted-foreground font-medium">Amount</span>
            </div>
            <p className="text-sm font-semibold">
              {scholarship.amount ? `$${scholarship.amount.toLocaleString()}` : 'Amount varies'}
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-xs text-muted-foreground font-medium">Deadline</span>
            </div>
            <p className="text-sm font-semibold">{scholarship.deadline}</p>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {scholarship.description || `${scholarship.title} offered by ${scholarship.organization}`}
          </p>
        </div>
      </CardContent>

      {/* Action Button */}
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/scholarships/${scholarship.id}`}>
            <span>View Details</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ScholarshipsPage
