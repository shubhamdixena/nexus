"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'
import { ArrowLeft, MapPin, Globe, Scale, AlertTriangle, Circle, DollarSign, CreditCard, FileCheck, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CompareButton } from '@/components/compare-button'
import { ReportDataButton } from '@/components/report-data-button'


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
  business_school: string
  location: string
  class_size: number
  women?: number
  avg_gmat?: number
  avg_gpa?: string
  avg_gre?: number
  avg_work_exp_years?: string
  avg_starting_salary?: string
  tuition_total?: string
  application_fee?: string
  r1_deadline?: string
  r2_deadline?: string
  r3_deadline?: string
  ft_global_mba_rank?: number
  qs_mba_rank?: number
  bloomberg_mba_rank?: number
  employment_in_3_months_percent?: number
  top_hiring_companies?: string
  alumni_network_strength?: string
  program_duration?: string
  stem_designation?: string
  international_students?: number
  weighted_salary_usd?: string
  alumnus_1?: string
  alumnus_2?: string
  alumnus_3?: string
  alumnus_4?: string
  core_curriculum?: string
  credits_required?: string
  key_features?: string
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

const formatDate = (dateString: string | undefined) => {
  if (!dateString || dateString === 'N/A') return dateString || 'N/A'
  
  try {
    // Handle different date formats
    let date: Date
    
    // Try parsing various formats
    if (dateString.includes('/')) {
      // MM/DD/YYYY or DD/MM/YYYY
      date = new Date(dateString)
    } else if (dateString.includes('-')) {
      // YYYY-MM-DD
      date = new Date(dateString)
    } else {
      // Assume it's already in a readable format
      return dateString
    }
    
    if (isNaN(date.getTime())) {
      return dateString // Return original if parsing fails
    }
    
    // Format as "12 July 2024"
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch (error) {
    return dateString // Return original if any error occurs
  }
}

export default function MBASchoolDetailsPage() {
  const params = useParams()
  const [school, setSchool] = useState<MBASchool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


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
              <CardTitle className="text-xl md:text-2xl">
                {formatValue(school?.business_school)}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Full-time MBA • Located in {school?.location}
              </div>
              {school?.description && (
                <div className="text-sm text-gray-700 mt-3 leading-relaxed">
                  {/* Clean up description to remove redundant information that's already in key_features */}
                  {school.description.replace(/^[^.]*#1[^.]*\.\s*/, '').trim()}
                </div>
              )}
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
                <CompareButton 
                  school={{
                    id: school.id,
                    name: school?.business_school || '',
                    type: 'Full-time MBA',
                    location: school?.location || '',
                    country: '',
                    ranking: school?.qs_mba_rank || school?.ft_global_mba_rank || school?.bloomberg_mba_rank || 0
                  }}
                  variant="outline"
                  size="sm"
                />
                <ReportDataButton
                  dataType="mba_school"
                  dataId={school.id}
                  dataTable="mba_schools"
                  currentData={school}
                  variant="outline"
                  size="sm"
                />
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Program Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Program Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Program Type</label>
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-sm">
                                {school?.type?.replace('MBA', '').trim() || 'Full-time'}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Duration Options</label>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {school?.program_duration ? (
                                school.program_duration.includes('or') || school.program_duration.includes(';') ? (
                                  school.program_duration.split(/[;,]|or/).map((duration, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {duration.trim()}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    {school.program_duration}
                                  </Badge>
                                )
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {school?.type === 'Full-time' ? '2 years' : school?.type === 'Part-time' ? '3-4 years' : '1-2 years'}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Credits Required</label>
                            <div className="mt-1">
                              <span className="text-lg font-medium">{formatValue(school?.credits_required)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Key Features */}
                    {school?.key_features && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Key Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {school.key_features.includes(',') ? (
                              <div className="grid grid-cols-1 gap-3">
                                {school.key_features.split(',').map((feature, index) => (
                                  <div key={index} className="flex items-start space-x-3">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-muted-foreground">{feature.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-start space-x-3">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {school.key_features}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Core Curriculum */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Core Curriculum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {school?.core_curriculum ? (
                            school.core_curriculum.includes(',') ? (
                              <div className="grid grid-cols-1 gap-3">
                                {school.core_curriculum.split(',').map((course, index) => (
                                  <div key={index} className="flex items-start space-x-3">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-muted-foreground">{course.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-start space-x-3">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {school.core_curriculum}
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="flex items-start space-x-3">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Comprehensive foundational courses covering essential business disciplines including finance, marketing, operations, strategy, and leadership.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Specializations */}
                    {(school.specializations && school.specializations.length > 0) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Specializations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {school.specializations.map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="admissions" className="p-4 md:p-6 m-0 h-full">
                <div className="space-y-6">
                  {/* Tuition & Fees */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Tuition & Fees
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm font-medium text-muted-foreground">Total Cost</span>
                          </div>
                          <div className="text-2xl font-bold">{formatCurrency(school?.tuition_total || school?.total_cost)}</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm font-medium text-muted-foreground">Application Fee</span>
                          </div>
                          <div className="text-2xl font-bold">{formatCurrency(school?.application_fee)}</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <FileCheck className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm font-medium text-muted-foreground">GMAT/GRE Waiver</span>
                          </div>
                          <div className="flex items-center justify-center">
                            {school?.gmat_gre_waiver_available ? (
                              <Badge variant="default" className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Not Available
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Application Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {(school.r1_deadline || school.R1) && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="font-medium text-base mb-1">Round 1</div>
                            <div className="text-sm text-muted-foreground">{formatDate(school.r1_deadline || school.R1)}</div>
                          </div>
                        )}
                        {(school.r2_deadline || school.R2) && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="font-medium text-base mb-1">Round 2</div>
                            <div className="text-sm text-muted-foreground">{formatDate(school.r2_deadline || school.R2)}</div>
                          </div>
                        )}
                        {(school.r3_deadline || school.R3) && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="font-medium text-base mb-1">Round 3</div>
                            <div className="text-sm text-muted-foreground">{formatDate(school.r3_deadline || school.R3)}</div>
                          </div>
                        )}
                        {(school.r4_deadline || school.R4) && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="font-medium text-base mb-1">Round 4</div>
                            <div className="text-sm text-muted-foreground">{formatDate(school.r4_deadline || school.R4)}</div>
                          </div>
                        )}
                        {(school.r5_deadline || school.R5) && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <div className="font-medium text-base mb-1">Round 5</div>
                            <div className="text-sm text-muted-foreground">{formatDate(school.r5_deadline || school.R5)}</div>
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
                        <CardTitle className="text-lg">Application Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Application Fee</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(school?.application_fee)}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Admissions Rounds</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatValue(school?.admissions_rounds || `${school?.r1_deadline ? 'Round 1' : ''}${school?.r2_deadline ? ', Round 2' : ''}${school?.r3_deadline ? ', Round 3' : ''}${school?.r4_deadline ? ', Round 4' : ''}${school?.r5_deadline ? ', Round 5' : ''}` || 'Multiple rounds available')}
                            </p>
                          </div>
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Note:</strong> For specific essay questions, application requirements, and current deadlines, please check the official school website.
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
                          <div className="text-2xl font-bold">{formatCurrency(school.weighted_salary_usd || school.weighted_salary)}</div>
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
                          <div className="text-3xl font-bold mb-2">
                            {formatValue(school.international_students || school.international_percentage)}{(school.international_students || school.international_percentage) ? '%' : ''}
                          </div>
                          <div className="text-sm text-muted-foreground">International</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {formatValue(school.women || school.women_percentage)}{(school.women || school.women_percentage) ? '%' : ''}
                          </div>
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
                          <div className="text-2xl font-bold">{formatValue(school.avg_gre || 'N/A')}</div>
                          <div className="text-sm text-muted-foreground mt-1">Average GRE</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{formatValue(school.avg_work_exp_years)} {school.avg_work_exp_years ? 'yrs' : ''}</div>
                          <div className="text-sm text-muted-foreground mt-1">Avg Work Experience</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="alumni" className="p-4 md:p-6 m-0 h-full">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notable Alumni</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        // First check if we have real-time alumni data
                        if (school.alumni_data && school.alumni_data.length > 0) {
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {school.alumni_data
                                .sort((a, b) => (a.alumni_order || 0) - (b.alumni_order || 0))
                                .map((alumnus, index) => (
                                  <Card key={alumnus.id || index} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="space-y-3">
                                        <div>
                                          <h4 className="font-semibold text-lg text-gray-900">{alumnus.name}</h4>
                                          <p className="text-sm text-muted-foreground">
                                            {alumnus.position} at {alumnus.company}
                                          </p>
                                        </div>
                                        {alumnus.description && (
                                          <p className="text-sm text-gray-600 leading-relaxed">{alumnus.description}</p>
                                        )}
                                        {alumnus.notable_achievements && (
                                          <div className="flex flex-wrap gap-1">
                                            <Badge variant="secondary" className="text-xs">
                                              {alumnus.notable_achievements}
                                            </Badge>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          );
                        }
                        
                        // Fallback to static alumni fields
                        const alumniList = [
                          school.alumnus_1,
                          school.alumnus_2, 
                          school.alumnus_3,
                          school.alumnus_4
                        ].filter(Boolean);
                        
                        return alumniList.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {alumniList.map((alumnus, index) => {
                              if (!alumnus) return null;
                              const match = alumnus.match(/^([^(]+)\s*\(([^)]+)\)$/);
                              if (match) {
                                return (
                                  <Card key={index} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-900">{match[1].trim()}</h4>
                                        <p className="text-sm text-muted-foreground">{match[2].trim()}</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              }
                              return (
                                <Card key={index} className="hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <h4 className="font-semibold text-gray-900">{alumnus.trim()}</h4>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No alumni information available</p>
                          </div>
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
