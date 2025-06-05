"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Bookmark, BookmarkCheck, Filter, MapPin, Search, X, Loader2, AlertCircle, RefreshCw } from "lucide-react"
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
import { MBASchoolRealtimeService, type MBASchool } from "@/lib/realtime-services"

export function MBASchoolsExplorer() {
  const [showFilters, setShowFilters] = useState(false)
  const [savedSchools, setSavedSchools] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null)
  const [selectedMBACategory, setSelectedMBACategory] = useState<string | null>(null)
  
  // State for API data
  const [mbaSchools, setMbaSchools] = useState<MBASchool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const itemsPerPage = 6
  const maxRetries = 3

  // Load MBA schools from API
  useEffect(() => {
    loadMBASchools()
  }, [currentPage, searchQuery, selectedCountry, selectedRanking, selectedMBACategory])

  const loadMBASchools = useCallback(async (showRetryIndicator = false) => {
    try {
      if (showRetryIndicator) {
        setIsRetrying(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        country: selectedCountry || undefined,
        ranking: selectedRanking || undefined,
        category: selectedMBACategory || undefined,
      }

      const response = await MBASchoolRealtimeService.getMBASchools(params)
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server')
      }

      setMbaSchools(response.data)
      setTotalPages(response.pagination?.totalPages || 1)
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error('Error loading MBA schools:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while loading MBA schools'
      
      setError(errorMessage)
      setMbaSchools([])
      setTotalPages(1)
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }, [currentPage, searchQuery, selectedCountry, selectedRanking, selectedMBACategory, itemsPerPage])

  // Auto-retry mechanism with exponential backoff
  const handleRetry = useCallback(async () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay))
      await loadMBASchools(true)
    }
  }, [retryCount, loadMBASchools, maxRetries])

  const toggleSaved = useCallback((id: string) => {
    try {
      setSavedSchools(prev => {
        if (prev.includes(id)) {
          return prev.filter((schoolId) => schoolId !== id)
        } else {
          return [...prev, id]
        }
      })
    } catch (error) {
      console.error('Error toggling saved school:', error)
    }
  }, [])

  // Real-time subscription for updates
  useEffect(() => {
    const subscription = MBASchoolRealtimeService.subscribeToMBASchools((updatedSchools) => {
      setMbaSchools(updatedSchools)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const resetFilters = () => {
    setSelectedCountry(null)
    setSelectedRanking(null)
    setSelectedMBACategory(null)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Get unique countries for filter
  const countries = Array.from(new Set(mbaSchools.map((s) => s.country)))

  // Group MBA schools by category
  const m7Schools = mbaSchools.filter((s) => s.category === "M7")
  const t15Schools = mbaSchools.filter((s) => s.category === "T15")
  const savedSchoolsData = mbaSchools.filter((school) => savedSchools.includes(school.id))

  // Enhanced error display component
  const ErrorDisplay = () => (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">MBA Schools Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Discover top MBA programs worldwide with detailed profiles and comparison tools
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
              onClick={() => loadMBASchools()}
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

  // Enhanced loading display
  const LoadingDisplay = () => (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">MBA Schools Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Discover top MBA programs worldwide with detailed profiles and comparison tools
        </p>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading MBA schools...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    </div>
  )

  // Early returns for loading and error states
  if (loading && mbaSchools.length === 0) {
    return <LoadingDisplay />
  }

  if (error && mbaSchools.length === 0) {
    return <ErrorDisplay />
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Error display for non-blocking errors */}
      {error && mbaSchools.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Some data may be outdated: {error}</span>
            <Button variant="outline" size="sm" onClick={() => loadMBASchools()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MBA Schools Explorer</h1>
          <p className="text-muted-foreground mt-2">
            Discover top MBA programs worldwide with detailed profiles and comparison tools
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
            placeholder="Search MBA schools..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="country">Country</label>
                <Select value={selectedCountry || "any"} onValueChange={(value) => setSelectedCountry(value === "any" ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="ranking">Ranking</label>
                <Select value={selectedRanking || "any"} onValueChange={(value) => setSelectedRanking(value === "any" ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ranking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1-10">Top 10</SelectItem>
                    <SelectItem value="11-25">Top 25</SelectItem>
                    <SelectItem value="26-50">Top 50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="mba-category">MBA Category</label>
                <Select value={selectedMBACategory || "any"} onValueChange={(value) => setSelectedMBACategory(value === "any" ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="M7">M7 Schools</SelectItem>
                    <SelectItem value="T15">T15 Schools</SelectItem>
                    <SelectItem value="T25">T25 Schools</SelectItem>
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
          <TabsTrigger value="all">All Schools ({mbaSchools.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedSchoolsData.length})</TabsTrigger>
          <TabsTrigger value="m7">M7 Schools ({m7Schools.length})</TabsTrigger>
          <TabsTrigger value="t15">T15 Schools ({t15Schools.length})</TabsTrigger>
        </TabsList>

        {/* Enhanced tab content with better loading states */}
        <TabsContent value="all" className="mt-4">
          {loading || isRetrying ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>{isRetrying ? 'Retrying...' : 'Loading...'}</span>
            </div>
          ) : mbaSchools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No MBA schools found. Try adjusting your search or filters.</p>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mbaSchools.map((school) => (
                  <MBASchoolCard
                    key={school.id}
                    school={school}
                    isSaved={savedSchools.includes(school.id)}
                    onToggleSave={() => toggleSaved(school.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink isActive={pageNumber === currentPage} onClick={() => setCurrentPage(pageNumber)}>
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    {totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink isActive={totalPages === currentPage} onClick={() => setCurrentPage(totalPages)}>
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
          {savedSchoolsData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No saved schools yet. Click the bookmark icon on any school to save it.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedSchoolsData.map((school) => (
                <MBASchoolCard
                  key={school.id}
                  school={school}
                  isSaved={true}
                  onToggleSave={() => toggleSaved(school.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* M7 Schools Tab */}
        <TabsContent value="m7" className="mt-4">
          {m7Schools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No M7 schools found.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {m7Schools.map((school) => (
                <MBASchoolCard
                  key={school.id}
                  school={school}
                  isSaved={savedSchools.includes(school.id)}
                  onToggleSave={() => toggleSaved(school.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* T15 Schools Tab */}
        <TabsContent value="t15" className="mt-4">
          {t15Schools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No T15 schools found.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {t15Schools.map((school) => (
                <MBASchoolCard
                  key={school.id}
                  school={school}
                  isSaved={savedSchools.includes(school.id)}
                  onToggleSave={() => toggleSaved(school.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MBASchoolCard({
  school,
  isSaved,
  onToggleSave,
}: {
  school: MBASchool
  isSaved: boolean
  onToggleSave: () => void
}) {
  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold line-clamp-1">{school.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{school.location}, {school.country}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggleSave}>
            {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            <span className="sr-only">{isSaved ? "Remove from saved" : "Save school"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium">Ranking:</span>
            <span className="ml-1 text-sm text-muted-foreground">#{school.ranking}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-muted-foreground block">Avg. GMAT</span>
              <span className="font-medium">{school.avg_gmat || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Class Size</span>
              <span className="font-medium">{school.class_size || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Acceptance Rate</span>
              <span className="font-medium">{school.acceptance_rate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Tuition</span>
              <span className="font-medium">{school.tuition_per_year || 'N/A'}</span>
            </div>
          </div>
          <Badge variant="secondary" className="mt-2">
            {school.category}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/mba-schools/${school.id}`}>View MBA Program</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
