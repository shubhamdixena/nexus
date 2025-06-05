"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, Award, Users, FileText, Globe, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UniversityRealtimeService, type University } from "@/lib/realtime-services"

export default function UniversityDetailsPage() {
  return (
    <DashboardLayout>
      <UniversityDetails />
    </DashboardLayout>
  )
}

function UniversityDetails() {
  const params = useParams()
  const universityId = params.id as string
  const [university, setUniversity] = useState<University | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Load university details from API
  useEffect(() => {
    loadUniversityDetails()
  }, [universityId])

  const loadUniversityDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await UniversityRealtimeService.getUniversityById(universityId)
      setUniversity(data)
    } catch (error) {
      console.error('Error loading university details:', error)
      setError('Failed to load university details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center gap-2">
          <Link href="/universities">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Universities
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading university details...</span>
        </div>
      </div>
    )
  }

  if (error || !university) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center gap-2">
          <Link href="/universities">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Universities
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'University not found'}</p>
            <Button onClick={loadUniversityDetails}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/universities">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Universities
          </Button>
        </Link>
      </div>

      {/* University Name and Location */}
      <div>
        <h1 className="text-3xl font-bold">{university.name}</h1>
        <div className="flex items-center mt-2 text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{university.location}, {university.country}</span>
        </div>
        <div className="mt-4">
          {university.website && (
            <Button asChild>
              <a href={university.website} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                Visit Website
              </a>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>University Overview</CardTitle>
              <CardDescription>Key information about {university.name}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-sm text-muted-foreground">{university.type || 'University'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Global Ranking</p>
                    <p className="text-sm text-muted-foreground">#{university.ranking || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {university.status === 'active' ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
              
              {university.description && (
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <p className="text-muted-foreground">{university.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {university.programs && university.programs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Programs</CardTitle>
                <CardDescription>Academic programs offered at {university.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {university.programs.slice(0, 6).map((program) => (
                    <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{program.name}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>{program.type}</span>
                          {program.duration && <span>• {program.duration}</span>}
                          {program.tuition && <span>• {program.tuition}</span>}
                        </div>
                      </div>
                      <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                        {program.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                  {university.programs.length > 6 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm">
                        View All Programs ({university.programs.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Admissions Tab */}
        <TabsContent value="admissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admission Information</CardTitle>
              <CardDescription>General admission requirements and deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Application Periods</p>
                    <p className="text-sm text-muted-foreground">
                      Varies by program. Check individual program pages for specific deadlines.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Required Documents</p>
                    <p className="text-sm text-muted-foreground">
                      Transcripts, test scores, essays, and recommendations typically required.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">International Students</p>
                    <p className="text-sm text-muted-foreground">
                      TOEFL/IELTS scores required for non-native English speakers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Application Fee</p>
                    <p className="text-sm text-muted-foreground">
                      Varies by program. Check specific program requirements.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Admissions</CardTitle>
              <CardDescription>Get in touch with the admissions office</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {university.website && (
                  <Button asChild variant="outline">
                    <a href={university.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit University Website
                    </a>
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">
                  For specific program requirements and deadlines, please visit the university's official website 
                  or contact the respective program admissions offices directly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Programs</CardTitle>
              <CardDescription>All programs offered at {university.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {university.programs && university.programs.length > 0 ? (
                <div className="grid gap-4">
                  {university.programs.map((program) => (
                    <div key={program.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{program.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                            <span className="bg-secondary/50 px-2 py-1 rounded-md">{program.type}</span>
                            {program.duration && (
                              <span className="bg-secondary/50 px-2 py-1 rounded-md">{program.duration}</span>
                            )}
                            {program.tuition && (
                              <span className="bg-secondary/50 px-2 py-1 rounded-md">{program.tuition}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                          {program.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No programs information available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>University Statistics</CardTitle>
              <CardDescription>Key metrics and data about {university.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Global Ranking</p>
                  <p className="text-2xl font-bold">#{university.ranking || 'N/A'}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Programs Offered</p>
                  <p className="text-2xl font-bold">{university.programs?.length || 0}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-2xl font-bold">{university.type || 'University'}</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold">
                    {university.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Program Distribution</h3>
                {university.programs && university.programs.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Full-time', 'Part-time', 'Online', 'Executive'].map((type) => {
                      const count = university.programs?.filter(p => p.type === type).length || 0
                      return (
                        <div key={type} className="p-4 border rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">{type}</p>
                          <p className="text-xl font-bold">{count}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No program data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
