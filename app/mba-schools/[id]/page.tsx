"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'
import { ArrowLeft, MapPin, Globe, Scale, AlertTriangle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface AlumniData {
  id: string
  name: string
  position: string
  company: string
  description: string
  notable_achievements: string
  alumni_order: number
}

interface ClassProfileData {
  id: string
  class_size: number
  women_percentage: number
  international_students_percentage: number
  mean_gmat: number
  mean_gpa: number
  avg_gre: number
  avg_work_exp_years: number
  avg_starting_salary: string
  tuition_total: string
  top_hiring_companies: string
  employment_in_3_months_percent: number
  weighted_salary: string
  alumni_network_strength: string
}

interface MBASchool {
  id: string
  name: string
  description: string
  location: string
  country: string
  type: string
  class_size: number
  women_percentage: number
  mean_gmat: number
  mean_gpa: number
  avg_gre: number
  avg_work_exp_years: number
  avg_starting_salary: string
  total_cost: string
  application_deadlines: string
  application_deadlines_structured: Array<{round: string, date: string}>
  application_fee: string
  gmat_gre_waiver_available: boolean
  class_profile: string
  admissions_rounds: string
  qs_mba_rank: number
  ft_global_mba_rank: number
  bloomberg_mba_rank: number
  employment_in_3_months_percent: number
  weighted_salary: string
  top_hiring_companies: string
  top_hiring_companies_array: string[]
  alumni_network_strength: string
  notable_alumni: string
  notable_alumni_structured: Array<{name: string, title: string}>
  program_tags: string[]
  specializations: string[]
  status: string
  created_at: string
  updated_at: string
  R1: string
  R2: string
  R3: string
  R4: string
  R5: string
  international_percentage: number
  alumni_data: AlumniData[]
  class_profile_data: ClassProfileData
  alumnus_1?: string
  alumnus_2?: string
  alumnus_3?: string
  alumnus_4?: string
}

const formatCurrency = (value: string | null | undefined) => {
  if (!value || value === 'N/A' || value === '0') return '—'
  // Remove any existing formatting and parse
  const cleanValue = value.toString().replace(/[^\d.-]/g, '')
  const num = parseFloat(cleanValue)
  if (isNaN(num)) return value
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num)
}

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === '' || value === 'N/A') {
    return <span className="text-gray-400">—</span>
  }
  return value
}

export default function MBASchoolDetailsPage() {
  const params = useParams()
  const [school, setSchool] = useState<MBASchool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCombinedCardCollapsed, setIsCombinedCardCollapsed] = useState(true)

  useEffect(() => {
    async function fetchSchool() {
      try {
        const response = await fetch(`/api/mba-schools/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setSchool(result.data)
        } else {
          setError(result.error || 'Failed to fetch school details')
        }
      } catch (err) {
        setError('Failed to load school details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSchool()
    }
  }, [params.id])

  const toggleCombinedCard = () => {
    setIsCombinedCardCollapsed(!isCombinedCardCollapsed)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col min-h-screen p-4 md:p-6 gap-4 bg-gray-50 text-gray-800">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !school) {
    return (
      <DashboardLayout>
        <div className="flex flex-col min-h-screen p-4 md:p-6 gap-4 bg-gray-50 text-gray-800">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-red-600">{error || 'School not found'}</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Main dashboard container with proper overflow handling */}
      <div className="flex flex-col min-h-screen p-4 md:p-6 gap-4 bg-gray-50 text-gray-800 overflow-x-hidden">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/mba-schools">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to MBA Schools
            </Button>
          </Link>
        </div>

        {/* Split Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* University Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl md:text-2xl">{formatValue(school?.name)}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Full-time MBA • Located in {school?.location}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formatValue(school?.location)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Visit Website
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  Compare
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rankings & Performance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rankings & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking Body</TableHead>
                    <TableHead className="text-right">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">QS Global MBA</TableCell>
                    <TableCell className="text-right">
                      {formatValue(school?.qs_mba_rank) !== '—' ? (
                        <Badge variant="secondary">#{school?.qs_mba_rank}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not Ranked</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Financial Times</TableCell>
                    <TableCell className="text-right">
                      {formatValue(school?.ft_global_mba_rank) !== '—' ? (
                        <Badge variant="secondary">#{school?.ft_global_mba_rank}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not Ranked</span>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bloomberg</TableCell>
                    <TableCell className="text-right">
                      {formatValue(school?.bloomberg_mba_rank) !== '—' ? (
                        <Badge variant="secondary">#{school?.bloomberg_mba_rank}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not Ranked</span>
                      )}
                    </TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Program Overview & Tuition - Collapsible Section */}
        <Card>
          <Collapsible open={!isCombinedCardCollapsed} onOpenChange={(open) => setIsCombinedCardCollapsed(!open)}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                <CardTitle className="text-xl">Program Overview & Tuition</CardTitle>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isCombinedCardCollapsed ? "-rotate-90" : "rotate-0"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Program Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Program Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium text-muted-foreground">Type</span>
                          <span className="font-semibold">{formatValue(school?.type)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium text-muted-foreground">Duration</span>
                          <span className="font-semibold">{school?.type === 'Full-time' ? '2 years' : school?.type === 'Part-time' ? '3-4 years' : '1-2 years'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium text-muted-foreground">Start Date</span>
                          <span className="font-semibold">{school?.R1 ? 'September/January' : 'September'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium text-muted-foreground">Class Size</span>
                          <span className="font-semibold">{formatValue(school?.class_size)} {school?.class_size ? 'students' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-medium text-muted-foreground">Location</span>
                          <span className="font-semibold">{school?.location && school?.country ? `${school.location}, ${school.country}` : formatValue(school?.location)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tuition & Fees */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tuition & Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium text-muted-foreground">Total Cost</span>
                          <span className="font-semibold">{formatCurrency(school?.total_cost)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium text-muted-foreground">Application Fee</span>
                          <span className="font-semibold">{formatCurrency(school?.application_fee)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium text-muted-foreground">GMAT Waiver</span>
                          <Badge variant={school?.gmat_gre_waiver_available ? "default" : "secondary"}>
                            {school?.gmat_gre_waiver_available ? "✓ Available" : "✗ Not Available"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium text-muted-foreground">Avg Work Exp</span>
                          <span className="font-semibold">{formatValue(school?.avg_work_exp_years)} {school?.avg_work_exp_years ? 'years' : ''}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-medium text-muted-foreground">Women %</span>
                          <span className="font-semibold">{formatValue(school?.women_percentage)}{school?.women_percentage ? '%' : ''}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Main Content with Tabs */}
        <Card className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="admissions">Admissions</TabsTrigger>
              <TabsTrigger value="careers">Careers</TabsTrigger>
              <TabsTrigger value="profile">Class Profile</TabsTrigger>
              <TabsTrigger value="alumni">Alumni</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <TabsContent value="overview" className="p-4 md:p-6 m-0 h-full">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {formatValue(school.description)}
                    </p>
                  </div>
                  
                  {(school.program_tags?.length > 0 || school.specializations?.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {school.program_tags?.map((tag, index) => (
                        <Badge key={index} variant="default" className="bg-blue-100 text-blue-800">
                          {tag}
                        </Badge>
                      ))}
                      {school.specializations?.map((spec, index) => (
                        <Badge key={index} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                  

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Curriculum Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Core Curriculum</h4>
                          <p className="text-sm text-muted-foreground">
                            Comprehensive foundational courses covering essential business disciplines including finance, marketing, operations, strategy, and leadership. Data will be populated soon.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Electives & Specializations</h4>
                          <p className="text-sm text-muted-foreground">
                            Wide range of elective courses and specialized tracks to customize your MBA experience. Detailed information coming soon.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Experiential Learning</h4>
                          <p className="text-sm text-muted-foreground">
                            Hands-on projects, internships, and consulting opportunities to apply classroom knowledge in real-world settings.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="admissions" className="p-4 md:p-6 m-0 h-full">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {school.R1 && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="font-medium text-base mb-1">Round 1</div>
                            <div className="text-sm text-muted-foreground">{school.R1}</div>
                          </div>
                        )}
                        {school.R2 && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="font-medium text-base mb-1">Round 2</div>
                            <div className="text-sm text-muted-foreground">{school.R2}</div>
                          </div>
                        )}
                        {school.R3 && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="font-medium text-base mb-1">Round 3</div>
                            <div className="text-sm text-muted-foreground">{school.R3}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Required Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Required</Badge>
                            <span className="text-sm">Online Application Form</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Required</Badge>
                            <span className="text-sm">Official Transcripts</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Required</Badge>
                            <span className="text-sm">GMAT/GRE Scores</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Required</Badge>
                            <span className="text-sm">Letters of Recommendation (2-3)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Required</Badge>
                            <span className="text-sm">Resume/CV</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Required</Badge>
                            <span className="text-sm">Essay Questions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Optional</Badge>
                            <span className="text-sm">Interview (if selected)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">International</Badge>
                            <span className="text-sm">TOEFL/IELTS Scores</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Essay Questions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Essay 1: Leadership & Impact</h4>
                            <p className="text-sm text-muted-foreground">
                              Describe a time when you took initiative and led a team or project. What was the outcome and what did you learn about leadership? (500 words)
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Essay 2: Career Goals</h4>
                            <p className="text-sm text-muted-foreground">
                              What are your short-term and long-term career goals? How will this MBA program help you achieve them? (400 words)
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Essay 3: Why This School</h4>
                            <p className="text-sm text-muted-foreground">
                              Why are you interested in this particular MBA program? What specific resources, experiences, or opportunities attract you? (300 words)
                            </p>
                          </div>
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Note:</strong> Specific essay questions for each school will be updated with actual requirements. Please check the official school website for current prompts.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="careers" className="p-4 md:p-6 m-0 h-full">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Employment Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{school.employment_in_3_months_percent || 0}%</div>
                          <div className="text-sm text-muted-foreground mt-1">Employment in 3 Months</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatCurrency(school.avg_starting_salary)}</div>
                          <div className="text-sm text-muted-foreground mt-1">Avg Starting Salary</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatCurrency(school.weighted_salary)}</div>
                          <div className="text-sm text-muted-foreground mt-1">Weighted Salary</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatValue(school.alumni_network_strength)}</div>
                          <div className="text-sm text-muted-foreground mt-1">Alumni Network</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Hiring Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {school.top_hiring_companies_array && school.top_hiring_companies_array.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {school.top_hiring_companies_array.map((company, index) => (
                            <Badge key={index} variant="outline">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{formatValue(school.top_hiring_companies)}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="p-4 md:p-6 m-0 h-full">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Class Composition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">{formatValue(school.international_percentage)}%</div>
                          <div className="text-sm text-muted-foreground">International</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">{formatValue(school.women_percentage)}%</div>
                          <div className="text-sm text-muted-foreground">Women</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">{formatValue(school.class_size)}</div>
                          <div className="text-sm text-muted-foreground">Class Size</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Academic Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatValue(school.mean_gmat)}</div>
                          <div className="text-sm text-muted-foreground mt-1">Mean GMAT</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatValue(school.mean_gpa)}</div>
                          <div className="text-sm text-muted-foreground mt-1">Mean GPA</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatValue(school.avg_gre)}</div>
                          <div className="text-sm text-muted-foreground mt-1">Average GRE</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatValue(school.avg_work_exp_years)}</div>
                          <div className="text-sm text-muted-foreground mt-1">Avg Work Experience</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="alumni" className="p-4 md:p-6 m-0 h-full">
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notable Alumni</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const alumniList = [
                          school.alumnus_1,
                          school.alumnus_2, 
                          school.alumnus_3,
                          school.alumnus_4
                        ].filter(Boolean);
                        
                        return alumniList.length > 0 ? (
                          <div className="space-y-4">
                            {alumniList.map((alumnus, index) => {
                              if (!alumnus) return null;
                              const match = alumnus.match(/^([^(]+)\s*\(([^)]+)\)$/);
                              if (match) {
                                return (
                                  <div key={index} className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-semibold sm:mr-2">{match[1].trim()}</span>
                                    <span className="text-muted-foreground text-sm sm:text-base">— {match[2].trim()}</span>
                                  </div>
                                );
                              }
                              return (
                                <div key={index} className="flex items-start">
                                  <span className="font-semibold">{alumnus.trim()}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No alumni information available</p>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  )
}
