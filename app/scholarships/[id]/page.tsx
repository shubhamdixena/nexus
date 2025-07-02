"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, ExternalLink, Globe, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"

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

export default function ScholarshipDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [scholarship, setScholarship] = useState<ScholarshipData | null>(null)
  const [similarScholarships, setSimilarScholarships] = useState<ScholarshipData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const scholarshipId = params.id as string

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/scholarships/${scholarshipId}`)
        const data = await response.json()
        
        if (data.success) {
          setScholarship(data.data)
          // Fetch similar scholarships
          fetchSimilarScholarships(data.data)
        } else {
          setError(data.message || 'Failed to fetch scholarship')
        }
      } catch (err) {
        setError('Failed to fetch scholarship details')
        console.error('Error fetching scholarship:', err)
      } finally {
        setLoading(false)
      }
    }

    const fetchSimilarScholarships = async (currentScholarship: ScholarshipData) => {
      try {
        const response = await fetch(`/api/scholarships?limit=10&field=${currentScholarship.field}`)
        const data = await response.json()
        
        if (data.success) {
          // Filter out current scholarship and take first 3
          const similar = data.data
            .filter((s: ScholarshipData) => s.id !== currentScholarship.id)
            .slice(0, 3)
          setSimilarScholarships(similar)
        }
      } catch (err) {
        console.error('Error fetching similar scholarships:', err)
      }
    }

    if (scholarshipId) {
      fetchScholarship()
    }
  }, [scholarshipId])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading scholarship details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !scholarship) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scholarships
            </Button>
          </div>
          <Card className="mx-auto max-w-3xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Scholarship Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The scholarship you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/scholarships">View All Scholarships</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Determine funding type based on amount and other criteria
  const getFundingType = () => {
    if (scholarship?.fully_funded === "Yes") return "Fully Funded"
    if (scholarship?.benefits?.toLowerCase().includes("full")) return "Fully Funded"
    if (scholarship?.benefits?.toLowerCase().includes("partial")) return "Partially Funded"
    if (scholarship?.amount && scholarship.amount > 40000) return "Fully Funded"
    if (scholarship?.amount && scholarship.amount > 20000) return "Partially Funded"
    return "Merit-based"
  }

  const fundingType = getFundingType()

  // Parse eligibility criteria and benefits if they're strings
  const parseListString = (str?: string): string[] => {
    if (!str) return []
    // Try to parse as JSON array first, otherwise split by common delimiters
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // If not JSON, split by bullet points, newlines, or semicolons
      return str.split(/[•\n;]/).filter(item => item.trim()).map(item => item.trim())
    }
    return [str]
  }

  const eligibilityCriteria = parseListString(scholarship?.eligibility_criteria)
  const benefitsList = parseListString(scholarship?.benefits)

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scholarships
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{scholarship.title}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" />
                      {scholarship.organization} • {scholarship.country}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                    <span className="sr-only">{isSaved ? "Remove from saved" : "Save scholarship"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{scholarship.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Eligibility Requirements</h3>
                  {eligibilityCriteria.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {eligibilityCriteria.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Eligibility criteria not specified</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Benefits</h3>
                  {benefitsList.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {benefitsList.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Benefits information not specified</p>
                  )}
                </div>

                <div className="pt-4 flex gap-2">
                  {scholarship.apply_url ? (
                    <Button className="flex-1" asChild>
                      <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Apply Now
                      </a>
                    </Button>
                  ) : (
                    <Button className="flex-1" disabled>
                      Application Link Not Available
                    </Button>
                  )}
                  {scholarship.official_url ? (
                    <Button className="flex-1" variant="outline" asChild>
                      <a href={scholarship.official_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="mr-2 h-4 w-4" />
                        Official Website
                      </a>
                    </Button>
                  ) : (
                    <Button className="flex-1" variant="outline" disabled>
                      Official Link Not Available
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scholarship Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                  <p className="text-xl font-bold">
                    {scholarship.amount ? `$${scholarship.amount.toLocaleString()}` : 'Amount varies'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Application Deadline</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{scholarship.deadline}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Degree Level</h3>
                  <Badge variant="outline">{scholarship.degree}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Field of Study</h3>
                  <Badge variant="outline">{scholarship.field}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Funding Type</h3>
                  <Badge variant={fundingType === "Fully Funded" ? "default" : "secondary"}>{fundingType}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Similar Scholarships</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {similarScholarships.length > 0 ? (
                  similarScholarships.map((s: ScholarshipData) => (
                    <div key={s.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <Link href={`/scholarships/${s.id}`} className="hover:underline font-medium">
                        {s.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">{s.organization}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {s.degree}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {s.field}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No similar scholarships found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
