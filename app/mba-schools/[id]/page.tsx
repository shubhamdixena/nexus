"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Award,
  Users,
  Globe,
  BookOpen,
  GraduationCap,
  Building,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Comprehensive MBA school data with updated Harvard information
const mbaSchools = [
  {
    id: "harvard",
    name: "Harvard Business School",
    location: "Boston, Massachusetts, USA",
    overview: {
      school: "Harvard Business School, Harvard University",
      program: "Master of Business Administration (MBA)",
      duration: "2 years, full-time",
      classSize: 930,
      cost: {
        tuition: "$78,700 per year",
        totalWithLiving: "$126,536 per year (single student)",
      },
      start: "August/September",
      format: "Case method, general management focus",
    },
    curriculum: {
      yearOne: [
        "Finance",
        "Marketing",
        "Operations",
        "Leadership",
        "Strategy",
        "Financial Reporting",
        "Entrepreneurship",
        "Business & Government",
      ],
      yearTwo: "Electives across various business disciplines",
      crossRegistration: ["Other Harvard schools"],
      teaching: "80% case method, simulations, group projects",
      globalFocus: "International course content and immersion opportunities",
    },
    faculty: {
      size: "Large faculty body of distinguished professors",
      researchCenters: ["Multiple centers focused on entrepreneurship, leadership, and other business disciplines"],
    },
    admissions: {
      eligibility: "4-year bachelor's degree equivalent",
      tests: {
        gmat: {
          median: 740,
          range: "700-770 (middle 80%)",
          required: true,
        },
        gre: "Accepted",
      },
      workExperience: "Typical range 3-5 years",
      application: {
        essays: "Required",
        recommendations: "Required",
        transcripts: "Required",
        interview: "By invitation",
      },
      classProfile: {
        usStudents: "65% U.S. citizens",
        women: "44%",
        usStudentsOfColor: "53%",
        averageGPA: 3.69,
        applicationsReceived: 9856,
        international: "Students from 43+ countries, represented by birth",
      },
    },
    careerOutcomes: {
      employmentRate: "High placement rates post-graduation",
      topIndustries: ["Consulting", "Financial Services", "Technology"],
      careerServices: "Comprehensive support including workshops and employer connections",
      alumniNetwork: "46,000+ alumni globally",
    },
    studentLife: {
      campus: "Harvard campus in Boston",
      clubs: "Numerous professional and social clubs",
      diversity: "International students from 43+ countries, represented by birth",
    },
    website: "https://www.hbs.edu/mba",
  },
  {
    id: "stanford",
    name: "Stanford Graduate School of Business",
    location: "Stanford, California, USA",
    overview: {
      school: "Stanford Graduate School of Business, Stanford University",
      program: "Master of Business Administration (MBA)",
      duration: "2 years, full-time",
      classSize: 930,
      cost: {
        tuition: "$78,700 per year",
        totalWithLiving: "$126,536 per year (single student)",
      },
      start: "August/September",
      format: "Case method, general management focus",
    },
    curriculum: {
      yearOne: [
        "Finance",
        "Marketing",
        "Operations",
        "Leadership",
        "Strategy",
        "Financial Reporting",
        "Entrepreneurship",
        "Business & Government",
      ],
      yearTwo: "Electives across various business disciplines",
      crossRegistration: ["Other Stanford schools"],
      teaching: "80% case method, simulations, group projects",
      globalFocus: "International course content and immersion opportunities",
    },
    faculty: {
      size: "Large faculty body of distinguished professors",
      researchCenters: ["Multiple centers focused on entrepreneurship, leadership, and other business disciplines"],
    },
    admissions: {
      eligibility: "4-year bachelor's degree equivalent",
      tests: {
        gmat: {
          median: 740,
          range: "700-770 (middle 80%)",
          required: true,
        },
        gre: "Accepted",
      },
      workExperience: "Typical range 3-5 years",
      application: {
        essays: "Required",
        recommendations: "Required",
        transcripts: "Required",
        interview: "By invitation",
      },
      classProfile: {
        usStudents: "65% U.S. citizens",
        women: "44%",
        usStudentsOfColor: "53%",
        averageGPA: 3.69,
        applicationsReceived: 9856,
        international: "Students from 43+ countries, represented by birth",
      },
    },
    careerOutcomes: {
      employmentRate: "High placement rates post-graduation",
      topIndustries: ["Consulting", "Financial Services", "Technology"],
      careerServices: "Comprehensive support including workshops and employer connections",
      alumniNetwork: "46,000+ alumni globally",
    },
    studentLife: {
      campus: "Stanford campus in Palo Alto",
      clubs: "Numerous professional and social clubs",
      diversity: "International students from 43+ countries, represented by birth",
    },
    website: "https://www.gsb.stanford.edu/programs/mba",
  },
  // Additional schools with the same structure but different names/locations
  {
    id: "wharton",
    name: "Wharton School",
    location: "Philadelphia, Pennsylvania, USA",
    overview: {
      school: "The Wharton School, University of Pennsylvania",
      program: "Master of Business Administration (MBA)",
      duration: "2 years, full-time",
      classSize: 930,
      cost: {
        tuition: "$78,700 per year",
        totalWithLiving: "$126,536 per year (single student)",
      },
      start: "August/September",
      format: "Case method, general management focus",
    },
    // Same structure as Harvard for all other fields
    curriculum: {
      yearOne: [
        "Finance",
        "Marketing",
        "Operations",
        "Leadership",
        "Strategy",
        "Financial Reporting",
        "Entrepreneurship",
        "Business & Government",
      ],
      yearTwo: "Electives across various business disciplines",
      crossRegistration: ["Other Penn schools"],
      teaching: "80% case method, simulations, group projects",
      globalFocus: "International course content and immersion opportunities",
    },
    faculty: {
      size: "Large faculty body of distinguished professors",
      researchCenters: ["Multiple centers focused on entrepreneurship, leadership, and other business disciplines"],
    },
    admissions: {
      eligibility: "4-year bachelor's degree equivalent",
      tests: {
        gmat: {
          median: 740,
          range: "700-770 (middle 80%)",
          required: true,
        },
        gre: "Accepted",
      },
      workExperience: "Typical range 3-5 years",
      application: {
        essays: "Required",
        recommendations: "Required",
        transcripts: "Required",
        interview: "By invitation",
      },
      classProfile: {
        usStudents: "65% U.S. citizens",
        women: "44%",
        usStudentsOfColor: "53%",
        averageGPA: 3.69,
        applicationsReceived: 9856,
        international: "Students from 43+ countries, represented by birth",
      },
    },
    careerOutcomes: {
      employmentRate: "High placement rates post-graduation",
      topIndustries: ["Consulting", "Financial Services", "Technology"],
      careerServices: "Comprehensive support including workshops and employer connections",
      alumniNetwork: "46,000+ alumni globally",
    },
    studentLife: {
      campus: "Penn campus in Philadelphia",
      clubs: "Numerous professional and social clubs",
      diversity: "International students from 43+ countries, represented by birth",
    },
    website: "https://mba.wharton.upenn.edu/",
  },
]

export default function MBASchoolDetailsPage() {
  return (
    <DashboardLayout>
      <MBASchoolDetails />
    </DashboardLayout>
  )
}

function MBASchoolDetails() {
  const params = useParams()
  const schoolId = params.id as string
  const [isSaved, setIsSaved] = useState(false)

  const school = mbaSchools.find((s) => s.id === schoolId) || mbaSchools[0]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/mba-schools">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to MBA Schools
          </Button>
        </Link>
      </div>

      {/* School Name and Location */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{school.name}</h1>
          <Badge variant="secondary" className="text-sm">
            MBA Program
          </Badge>
        </div>
        <div className="flex items-center mt-2 text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{school.location}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Button asChild>
            <a href={school.website} target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" />
              Visit Website
            </a>
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Add to Compare
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {school.overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-sm font-medium text-muted-foreground">Class Size</h3>
              <p className="text-2xl font-bold">{school.overview.classSize}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Award className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-sm font-medium text-muted-foreground">Median GMAT</h3>
              <p className="text-2xl font-bold">{school.admissions?.tests?.gmat?.median || "N/A"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-sm font-medium text-muted-foreground">Tuition</h3>
              <p className="text-2xl font-bold">{school.overview.cost.tuition.split(" ")[0]}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
              <p className="text-2xl font-bold">{school.overview.duration.split(",")[0]}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 md:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="student-life">Student Life</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Overview</CardTitle>
              <CardDescription>Key information about the MBA program</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {school.overview && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">School</p>
                      <p className="text-sm text-muted-foreground">{school.overview.school}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{school.overview.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">{school.overview.start}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Tuition</p>
                      <p className="text-sm text-muted-foreground">{school.overview.cost.tuition}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Total Cost</p>
                      <p className="text-sm text-muted-foreground">{school.overview.cost.totalWithLiving}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Class Size</p>
                      <p className="text-sm text-muted-foreground">{school.overview.classSize} students</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Teaching Format</p>
                      <p className="text-sm text-muted-foreground">{school.overview.format}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
              <CardDescription>Program structure and teaching methodology</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {school.curriculum && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Year 1 (Required Courses)</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {school.curriculum.yearOne.map((course, index) => (
                        <li key={index} className="text-muted-foreground">
                          {course}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">Year 2</h3>
                    <p className="text-muted-foreground">{school.curriculum.yearTwo}</p>

                    <h3 className="text-lg font-medium mt-6 mb-3">Teaching Methodology</h3>
                    <p className="text-muted-foreground">{school.curriculum.teaching}</p>

                    <h3 className="text-lg font-medium mt-6 mb-3">Global Focus</h3>
                    <p className="text-muted-foreground">{school.curriculum.globalFocus}</p>

                    <h3 className="text-lg font-medium mt-6 mb-3">Cross-Registration</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {school.curriculum.crossRegistration.map((option, index) => (
                        <li key={index} className="text-muted-foreground">
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admissions Tab */}
        <TabsContent value="admissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admissions</CardTitle>
              <CardDescription>Requirements and class profile</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {school.admissions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Requirements</h3>

                    <div className="mb-4">
                      <h4 className="font-medium">Eligibility</h4>
                      <p className="text-muted-foreground">{school.admissions.eligibility}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium">Test Scores</h4>
                      <div className="ml-4 mt-2">
                        <p>
                          <span className="font-medium">GMAT:</span> Median {school.admissions.tests.gmat.median}{" "}
                          (Range: {school.admissions.tests.gmat.range})
                        </p>
                        <p>
                          <span className="font-medium">GRE:</span> {school.admissions.tests.gre}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium">Work Experience</h4>
                      <p className="text-muted-foreground">{school.admissions.workExperience}</p>
                    </div>

                    <div>
                      <h4 className="font-medium">Application Components</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li className="text-muted-foreground">Essays: {school.admissions.application.essays}</li>
                        <li className="text-muted-foreground">
                          Recommendations: {school.admissions.application.recommendations}
                        </li>
                        <li className="text-muted-foreground">
                          Transcripts: {school.admissions.application.transcripts}
                        </li>
                        <li className="text-muted-foreground">Interview: {school.admissions.application.interview}</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Class Profile</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">U.S. Students</p>
                        <p className="text-muted-foreground">{school.admissions.classProfile.usStudents}</p>
                      </div>
                      <div>
                        <p className="font-medium">Women</p>
                        <p className="text-muted-foreground">{school.admissions.classProfile.women}</p>
                      </div>
                      <div>
                        <p className="font-medium">U.S. Students of Color</p>
                        <p className="text-muted-foreground">{school.admissions.classProfile.usStudentsOfColor}</p>
                      </div>
                      <div>
                        <p className="font-medium">Average GPA</p>
                        <p className="text-muted-foreground">{school.admissions.classProfile.averageGPA}</p>
                      </div>
                      <div>
                        <p className="font-medium">Applications Received</p>
                        <p className="text-muted-foreground">{school.admissions.classProfile.applicationsReceived}</p>
                      </div>
                      <div>
                        <p className="font-medium">International Diversity</p>
                        <p className="text-muted-foreground">{school.admissions.classProfile.international}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Careers Tab */}
        <TabsContent value="careers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Career Outcomes</CardTitle>
              <CardDescription>Employment statistics and career services</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {school.careerOutcomes && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Employment</h3>
                    <p className="text-muted-foreground">{school.careerOutcomes.employmentRate}</p>

                    <h3 className="text-lg font-medium mt-6 mb-3">Top Industries</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {school.careerOutcomes.topIndustries.map((industry, index) => (
                        <li key={index} className="text-muted-foreground">
                          {industry}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Career Services</h3>
                    <p className="text-muted-foreground">{school.careerOutcomes.careerServices}</p>

                    <h3 className="text-lg font-medium mt-6 mb-3">Alumni Network</h3>
                    <p className="text-muted-foreground">{school.careerOutcomes.alumniNetwork}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Tab */}
        <TabsContent value="faculty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Faculty</CardTitle>
              <CardDescription>Academic staff and research centers</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {school.faculty && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Faculty Size</h3>
                  <p className="text-muted-foreground">{school.faculty.size}</p>

                  <h3 className="text-lg font-medium mt-6 mb-3">Research Centers</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {school.faculty.researchCenters.map((center, index) => (
                      <li key={index} className="text-muted-foreground">
                        {center}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Life Tab */}
        <TabsContent value="student-life" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Life</CardTitle>
              <CardDescription>Campus experience and student activities</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {school.studentLife && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Campus</h3>
                    <p className="text-muted-foreground">{school.studentLife.campus}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Clubs & Activities</h3>
                    <p className="text-muted-foreground">{school.studentLife.clubs}</p>

                    <h3 className="text-lg font-medium mt-6 mb-3">Diversity</h3>
                    <p className="text-muted-foreground">{school.studentLife.diversity}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
