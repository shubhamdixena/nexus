"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import * as React from "react"
import { Bookmark, BookmarkCheck, Filter, MapPin, Search, X, Loader2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { UniversityRealtimeService } from "@/lib/database-service"
import type { University } from "@/types"

const UniversityExplorer = React.memo(() => {
  // State management
  const [showFilters, setShowFilters] = useState(false)
  const [savedUniversities, setSavedUniversities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  
  // Real database state
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const itemsPerPage = 6
  const maxRetries = 3

  // Ref for search input to reset value on filters reset
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // Memoize filtered universities to prevent recalculation
  const filteredUniversities = useMemo(() => {
    if (!searchQuery.trim()) return universities
    
    return universities.filter(uni =>
      uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.programs?.some(program => 
        program.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }, [universities, searchQuery])

  // Memoize pagination calculations
  const paginatedUniversities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredUniversities.slice(startIndex, endIndex)
  }, [filteredUniversities, currentPage, itemsPerPage])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredUniversities.length / itemsPerPage)
  }, [filteredUniversities.length, itemsPerPage])

  // Fetch universities from database using real-time service
  const fetchUniversities = useCallback(async (showRetryIndicator = false) => {
    try {
      if (showRetryIndicator) {
        setIsRetrying(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await UniversityRealtimeService.getUniversities({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        filters: {
          country: selectedCountry || undefined,
          ranking: selectedRanking || undefined,
          program: selectedProgram || undefined
        }
      })

      if (!response || !response.data) {
        throw new Error('Invalid response from server')
      }
      
      setUniversities(response.data)
      setTotalCount(response.pagination.total)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error('Error fetching universities:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load universities. Please try again.'
      setError(errorMessage)
      
      // Don't clear existing data if this is a retry
      if (!showRetryIndicator) {
        setUniversities([])
        setTotalCount(0)
      }
      
      // Auto-retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchUniversities(true)
        }, Math.pow(2, retryCount) * 1000) // Exponential backoff
      }
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }, [currentPage, searchQuery, selectedCountry, selectedProgram, itemsPerPage, retryCount, maxRetries])

  // Manual retry handler
  const handleRetry = useCallback(async () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      const delay = Math.pow(2, retryCount) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      await fetchUniversities(true)
    }
  }, [retryCount, fetchUniversities, maxRetries])

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      search: '',
      country: '',
      type: '',
      ranking: ''
    })
    setCurrentPage(1)
    setError(null)
    if (searchInputRef.current) {
      searchInputRef.current.value = ''
    }
  }

  // Retry function for error recovery
  const retryFetch = () => {
    setError(null)
    fetchUniversities()
  }

  // Optimize useEffect dependencies
  useEffect(() => {
    fetchUniversities()
  }, [fetchUniversities])

  // Memoize handlers
  const handleSaveUniversity = useCallback((universityId: string) => {
    setSavedUniversities(prev => {
      if (prev.includes(universityId)) {
        return prev.filter(id => id !== universityId)
      }
      return [...prev, universityId]
    })
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleFilterChange = useCallback((filter: string, value: string | null) => {
    setCurrentPage(1) // Reset to first page when filtering
    switch (filter) {
      case 'country':
        setSelectedCountry(value)
        break
      case 'program':
        setSelectedProgram(value)
        break
      case 'ranking':
        setSelectedRanking(value)
        break
    }
  }, [])

  // Debounced search with proper cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1) // Reset to first page on search
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const toggleSaved = useCallback((id: string) => {
    try {
      setSavedUniversities(prev => {
        if (prev.includes(id)) {
          return prev.filter((universityId) => universityId !== id)
        } else {
          return [...prev, id]
        }
      })
    } catch (error) {
      console.error('Error toggling saved university:', error)
    }
  }, [])

  // Real-time subscription for updates
  useEffect(() => {
    const subscription = UniversityRealtimeService.subscribeToUniversities((updatedUniversities) => {
      setUniversities(updatedUniversities)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Get unique countries for filter
  const countries = Array.from(new Set(universities.map((u: University) => u.country)))

  // Get unique programs for filter
  const programs = Array.from(
    new Set(
      universities.flatMap((u: University) =>
        u.programs?.map(
          (p: string) => p.split(" ")[0], // Just get the degree type (MBA, MS, PhD)
        ) || []
      ),
    ),
  )

  // Enhanced error display component
  const ErrorDisplay = () => (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">University Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Discover universities worldwide with detailed profiles and comparison tools
        </p>
      </div>
      
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-4">
          <span>{error}</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchUniversities()}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
            {retryCount < maxRetries && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleRetry}
                disabled={isRetrying}
              >
                Auto Retry ({retryCount}/{maxRetries})
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )

  // Loading display component
  const LoadingDisplay = () => (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading universities...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    </div>
  )

  // Early returns for loading and error states
  if (loading && universities.length === 0) {
    return <LoadingDisplay />
  }

  if (error && universities.length === 0) {
    return <ErrorDisplay />
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Error display for non-blocking errors */}
      {error && universities.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Some data may be outdated: {error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchUniversities()}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">University Explorer</h1>
          <p className="text-muted-foreground mt-2">
            Discover universities worldwide with detailed profiles and comparison tools
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search universities..."
            className="pl-8"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Country</label>
                <Select value={selectedCountry || ""} onValueChange={(value) => handleFilterChange('country', value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Countries</SelectLabel>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Program Type</label>
                <Select value={selectedProgram || ""} onValueChange={(value) => handleFilterChange('program', value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Programs</SelectLabel>
                      {programs.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Ranking Range</label>
                <Select value={selectedRanking || ""} onValueChange={(value) => handleFilterChange('ranking', value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ranking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rankings</SelectLabel>
                      <SelectItem value="1-50">Top 50</SelectItem>
                      <SelectItem value="51-100">51-100</SelectItem>
                      <SelectItem value="101-200">101-200</SelectItem>
                      <SelectItem value="201+">201+</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Universities ({universities.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedUniversities.length})</TabsTrigger>
        </TabsList>

        {/* Enhanced tab content with better loading states */}
        <TabsContent value="all" className="mt-4">
          {loading || isRetrying ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>{isRetrying ? 'Retrying...' : 'Loading...'}</span>
            </div>
          ) : universities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No universities found. Try adjusting your search or filters.</p>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {paginatedUniversities.map((university: University) => (
                  <UniversityCard
                    key={university.id}
                    university={university}
                    isSaved={savedUniversities.includes(university.id)}
                    onToggleSave={() => toggleSaved(university.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    
                    {totalPages > 5 && <PaginationEllipsis />}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {universities
              .filter((university: University) => savedUniversities.includes(university.id))
              .map((university: University) => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  isSaved={true}
                  onToggleSave={() => toggleSaved(university.id)}
                />
              ))}
          </div>
          {savedUniversities.length === 0 && (
            <div className="text-center p-8">
              <p className="text-muted-foreground">You haven't saved any universities yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
})

function UniversityCard({
  university,
  isSaved,
  onToggleSave,
}: {
  university: University
  isSaved: boolean
  onToggleSave: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold line-clamp-1">{university.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{university.location}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggleSave}>
            {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            <span className="sr-only">{isSaved ? "Remove from saved" : "Save university"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          {university.ranking && (
            <div>
              <span className="text-sm font-medium">Ranking:</span>
              <span className="ml-1 text-sm text-muted-foreground">{university.ranking}</span>
            </div>
          )}
          {university.programs_offered && university.programs_offered.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Programs</h4>
              <div className="flex flex-wrap gap-1">
                {university.programs_offered.slice(0, 2).map((program: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {program}
                  </Badge>
                ))}
                {university.programs_offered.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{university.programs_offered.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/universities/${university.id}`}>View Profile</Link>
        </Button>
        {university.website && (
          <a href={university.website} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  )
}

export { UniversityExplorer }
