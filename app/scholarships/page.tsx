"use client"

import { Bookmark, Filter, Globe, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"

function ScholarshipsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    countries: [] as string[],
    fundingTypes: [] as string[],
  })

  const countries = Array.from(new Set(scholarships.map((s) => s.country)))
  const fundingTypes = ["Fully Funded", "Partially Funded", "Merit-based"]

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
  }

  const filteredScholarships = scholarships.filter((scholarship) => {
    // If no country filters are selected, show all countries
    const countryMatch = filters.countries.length === 0 || filters.countries.includes(scholarship.country)

    // For demo purposes, we'll assign funding types based on amount
    const fundingType =
      scholarship.amount > 40000 ? "Fully Funded" : scholarship.amount > 20000 ? "Partially Funded" : "Merit-based"

    // If no funding type filters are selected, show all funding types
    const fundingMatch = filters.fundingTypes.length === 0 || filters.fundingTypes.includes(fundingType)

    return countryMatch && fundingMatch
  })

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
                        {countries.map((country) => (
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
              <Input type="search" placeholder="Search scholarships..." className="pl-8" />
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredScholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

interface Scholarship {
  id: number
  title: string // Scholarship Name
  description: string
  eligibility: string[]
  benefits: string[]
  deadline: string
  applyUrl: string
  officialUrl: string
  // Keep these fields for compatibility with existing UI
  organization?: string
  country?: string
  amount?: number
  degree?: string
  field?: string
}

const scholarships: Scholarship[] = [
  {
    id: 1,
    title: "Amsterdam Excellence Scholarship",
    organization: "University of Amsterdam",
    country: "Netherlands",
    description:
      "Prestigious scholarship offered by the University of Amsterdam for exceptionally talented international students pursuing master's programs. The award aims to attract top global talent and foster academic excellence in a variety of disciplines.",
    amount: 25000,
    deadline: "March 1, 2026",
    degree: "Masters",
    field: "Various",
    eligibility: [
      "Non-EU students with academic excellence (top 10% of their class)",
      "Strong ambition and relevance of the Master's program to future career",
      "Two-year Master's programs have possibility of extension for a second year",
    ],
    benefits: [
      "€25,000 per year (covering tuition and living expenses)",
      "Access to a select community of scholars",
      "Opportunity for special extracurricular activities",
    ],
    applyUrl:
      "https://www.uva.nl/en/education/master-s/scholarships--tuition/scholarships-and-loans/amsterdam-excellence-scholarship/amsterdam-excellence-scholarship.html",
    officialUrl:
      "https://www.uva.nl/en/education/master-s/scholarships--tuition/scholarships-and-loans/amsterdam-excellence-scholarship/amsterdam-excellence-scholarship.html",
  },
  {
    id: 2,
    title: "Global Leaders Scholarship",
    organization: "International Education Foundation",
    country: "United States",
    description:
      "Full scholarship for outstanding students pursuing graduate studies in STEM fields. This scholarship aims to support future leaders who will make significant contributions to technological innovation and scientific advancement.",
    amount: 50000,
    deadline: "March 15, 2024",
    degree: "Masters",
    field: "STEM",
    eligibility: [
      "Minimum GPA of 3.5 on a 4.0 scale",
      "Demonstrated leadership experience",
      "Strong research background",
      "Two letters of recommendation",
    ],
    benefits: [
      "Full tuition coverage",
      "Monthly stipend for living expenses",
      "Research funding allowance",
      "Conference travel support",
    ],
    applyUrl: "https://example.com/global-leaders-scholarship/apply",
    officialUrl: "https://example.com/global-leaders-scholarship",
  },
  {
    id: 3,
    title: "Future Innovators Grant",
    organization: "Tech Innovation Council",
    country: "Canada",
    description:
      "Scholarship for students with innovative ideas in technology and computer science. This grant supports creative thinkers who are developing novel solutions to real-world problems through technology.",
    amount: 25000,
    deadline: "April 30, 2024",
    degree: "Bachelors",
    field: "Computer Science",
    eligibility: [
      "Enrolled in an accredited computer science program",
      "Demonstrated interest in innovation and entrepreneurship",
      "Portfolio of projects or prototypes",
      "One letter of recommendation",
    ],
    benefits: [
      "Partial tuition coverage",
      "Mentorship from industry professionals",
      "Access to innovation labs and resources",
      "Internship opportunities with partner companies",
    ],
    applyUrl: "https://example.com/future-innovators-grant/apply",
    officialUrl: "https://example.com/future-innovators-grant",
  },
  {
    id: 4,
    title: "Women in Business Fellowship",
    organization: "Global Business Association",
    country: "United Kingdom",
    description:
      "Supporting women pursuing MBA and business-related graduate programs. This fellowship aims to increase female representation in business leadership and provides networking opportunities with industry leaders.",
    amount: 35000,
    deadline: "May 20, 2024",
    degree: "MBA",
    field: "Business",
    eligibility: [
      "Identify as female",
      "Minimum 2 years of professional work experience",
      "Accepted to an accredited MBA program",
      "Demonstrated leadership potential",
    ],
    benefits: [
      "Partial tuition coverage",
      "Professional development workshops",
      "Networking events with industry leaders",
      "Mentorship program with successful women executives",
    ],
    applyUrl: "https://example.com/women-in-business-fellowship/apply",
    officialUrl: "https://example.com/women-in-business-fellowship",
  },
]

function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  // Determine funding type based on amount for demo purposes
  const fundingType =
    scholarship.amount && scholarship.amount > 40000
      ? "Fully Funded"
      : scholarship.amount && scholarship.amount > 20000
        ? "Partially Funded"
        : "Merit-based"

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="h-2 bg-primary" />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{scholarship.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {scholarship.organization} • {scholarship.country}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Bookmark className="h-4 w-4" />
            <span className="sr-only">Save scholarship</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {scholarship.amount && (
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
              €{scholarship.amount.toLocaleString()}
            </Badge>
          )}
          {scholarship.degree && <Badge variant="outline">{scholarship.degree}</Badge>}
          {scholarship.field && <Badge variant="outline">{scholarship.field}</Badge>}
          <Badge variant={fundingType === "Fully Funded" ? "default" : "secondary"}>{fundingType}</Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <Button className="w-full" asChild>
          <Link href={`/scholarships/${scholarship.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ScholarshipsPage
