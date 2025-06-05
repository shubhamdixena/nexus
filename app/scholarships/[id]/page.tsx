"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, ExternalLink, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useState } from "react"

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

// This would typically come from an API or database
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

export default function ScholarshipDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)

  const scholarshipId = Number(params.id)
  const scholarship = scholarships.find((s) => s.id === scholarshipId)

  if (!scholarship) {
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

  // Determine funding type based on amount for demo purposes
  const fundingType =
    scholarship.amount > 40000 ? "Fully Funded" : scholarship.amount > 20000 ? "Partially Funded" : "Merit-based"

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
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {scholarship.eligibility.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {scholarship.benefits.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button className="flex-1" asChild>
                    <a href={scholarship.applyUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Apply Now
                    </a>
                  </Button>
                  <Button className="flex-1" variant="outline" asChild>
                    <a href={scholarship.officialUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Official Website
                    </a>
                  </Button>
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
                  <p className="text-xl font-bold">${scholarship.amount.toLocaleString()}</p>
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
                {scholarships
                  .filter(
                    (s) =>
                      s.id !== scholarship.id && (s.field === scholarship.field || s.degree === scholarship.degree),
                  )
                  .slice(0, 3)
                  .map((s) => (
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
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
