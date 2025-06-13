"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Award, DollarSign, Users, Clock, Globe, BookOpen, TrendingUp, Building, GraduationCap, Trophy, Target, Briefcase, Loader2, AlertCircle, Calendar, Heart, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MBASchoolRealtimeService } from '@/lib/realtime-services'
import { type MBASchool } from '@/types'
import { useCompare } from '@/hooks/use-compare'
import { ReportDataButton } from '@/components/report-data-button'

interface MBASchoolComparisonProps {
  schoolIds?: string[]
}

interface ComparisonItem {
  label: string
  icon: React.ElementType
  values: (string | number)[]
  type: 'text' | 'number' | 'percentage' | 'currency' | 'score'
  higherIsBetter?: boolean
}

export function MBASchoolComparison({ schoolIds }: MBASchoolComparisonProps) {
  const [schools, setSchools] = useState<MBASchool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { compareItems } = useCompare()
  
  const schoolsToCompare = useMemo(() => {
    if (schoolIds && schoolIds.length > 0) {
      return schoolIds
    }
    if (compareItems && Array.isArray(compareItems)) {
      return compareItems.map((s: any) => s.id)
    }
    return []
  }, [schoolIds, compareItems])

  useEffect(() => {
    const loadSchools = async () => {
      if (schoolsToCompare.length === 0) {
        setLoading(false)
        setError("No schools selected for comparison")
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await MBASchoolRealtimeService.getMBASchools({ limit: 100 })
        
        if (!response || !response.data) {
          throw new Error('Failed to fetch schools data')
        }

        const filteredSchools = response.data.filter(school => 
          schoolsToCompare.includes(school.id)
        )
        
        if (filteredSchools.length === 0) {
          throw new Error('No schools found for comparison')
        }
        
        setSchools(filteredSchools as unknown as MBASchool[])
      } catch (err) {
        console.error('Error loading schools for comparison:', err)
        setError(err instanceof Error ? err.message : 'Failed to load schools')
      } finally {
        setLoading(false)
      }
    }

    loadSchools()
  }, [schoolsToCompare])

  const getValueColor = (value: any, values: any[], type: string, higherIsBetter: boolean = true) => {
    if (type === 'text') return 'text-gray-900'
    
    const numericValues = values
      .map(v => {
        if (typeof v === 'number') return v
        if (typeof v === 'string') {
          const parsed = parseFloat(v.replace(/[^0-9.-]/g, ''))
          return isNaN(parsed) ? null : parsed
        }
        return null
      })
      .filter(v => v !== null) as number[]

    if (numericValues.length < 2) return 'text-gray-900'

    const currentValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''))
    if (isNaN(currentValue)) return 'text-gray-900'

    const max = Math.max(...numericValues)
    const min = Math.min(...numericValues)
    
    if (max === min) return 'text-gray-900'
    
    if (higherIsBetter) {
      if (currentValue === max) return 'text-green-600 font-semibold'
      if (currentValue === min) return 'text-red-500'
    } else {
      if (currentValue === min) return 'text-green-600 font-semibold'
      if (currentValue === max) return 'text-red-500'
    }
    
    return 'text-gray-900'
  }

  const getBgColor = (value: any, values: any[], type: string, higherIsBetter: boolean = true) => {
    if (type === 'text') return 'bg-gray-50'
    
    const numericValues = values
      .map(v => {
        if (typeof v === 'number') return v
        if (typeof v === 'string') {
          const parsed = parseFloat(v.replace(/[^0-9.-]/g, ''))
          return isNaN(parsed) ? null : parsed
        }
        return null
      })
      .filter(v => v !== null) as number[]

    if (numericValues.length < 2) return 'bg-gray-50'

    const currentValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''))
    if (isNaN(currentValue)) return 'bg-gray-50'

    const max = Math.max(...numericValues)
    const min = Math.min(...numericValues)
    
    if (max === min) return 'bg-gray-50'
    
    if (higherIsBetter) {
      if (currentValue === max) return 'bg-green-50 border-green-200'
      if (currentValue === min) return 'bg-red-50 border-red-200'
    } else {
      if (currentValue === min) return 'bg-green-50 border-green-200'
      if (currentValue === max) return 'bg-red-50 border-red-200'
    }
    
    return 'bg-gray-50'
  }

  const formatValue = (value: any, type: string) => {
    if (!value || value === 'Not specified') return 'Not specified'
    
    switch (type) {
      case 'percentage':
        const num = typeof value === 'string' ? parseFloat(value) : value
        return isNaN(num) ? value : `${num}%`
      case 'currency':
        return value.toString().startsWith('$') ? value : `$${value}`
      case 'score':
      case 'number':
        return value.toString()
      default:
        return value.toString()
    }
  }

  const comparisonSections = useMemo(() => {
    if (!schools.length) return []

    return [
      {
        title: "School Rankings & Recognition",
        items: [
          {
            label: "Global Ranking",
            icon: Trophy,
            values: schools.map(s => s.ranking || 'Not ranked'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "QS MBA Ranking",
            icon: Award,
            values: schools.map(s => s.qs_rank || 'Not ranked'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "FT Global MBA Ranking",
            icon: Award,
            values: schools.map(s => s.ft_rank || 'Not ranked'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "Bloomberg MBA Ranking",
            icon: Award, 
            values: schools.map(s => s.bloomberg_rank || 'Not ranked'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "Classification",
            icon: Award,
            values: schools.map(s => s.classification || s.tier || 'Not specified'),
            type: 'text' as const
          },
          {
            label: "Accreditation",
            icon: CheckCircle,
            values: schools.map(s => (s as any).accreditation || 'AACSB accredited'),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Program Structure",
        items: [
          {
            label: "Duration",
            icon: Clock,
            values: schools.map(s => s.duration || '2 years'),
            type: 'text' as const
          },
          {
            label: "Class Size",
            icon: Users,
            values: schools.map(s => s.class_size || 'Not specified'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "Women Percentage",
            icon: Users,
            values: schools.map(s => s.women_percentage || 'Not specified'),
            type: 'percentage' as const,
            higherIsBetter: true
          },
          {
            label: "International Students",
            icon: Globe,
            values: schools.map(s => s.international_students || 'Not specified'),
            type: 'text' as const
          },
          {
            label: "Start Date",
            icon: Calendar,
            values: schools.map(s => s.start_date || 'August/September'),
            type: 'text' as const
          },
          {
            label: "Format",
            icon: BookOpen,
            values: schools.map(s => s.format || 'Full-time, on-campus'),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Admission Requirements",
        items: [
          {
            label: "Average GMAT",
            icon: Target,
            values: schools.map(s => s.avg_gmat || 'Not specified'),
            type: 'score' as const,
            higherIsBetter: true
          },
          {
            label: "GMAT Range",
            icon: Target,
            values: schools.map(s => s.gmat_range || 'Not specified'),
            type: 'text' as const
          },
          {
            label: "Average GRE",
            icon: Target,
            values: schools.map(s => s.avg_gre || 'Not specified'),
            type: 'score' as const,
            higherIsBetter: true
          },
          {
            label: "Mean GPA",
            icon: GraduationCap,
            values: schools.map(s => s.mean_gpa || s.avg_gpa || 'Not specified'),
            type: 'score' as const,
            higherIsBetter: true
          },
          {
            label: "Acceptance Rate",
            icon: CheckCircle,
            values: schools.map(s => s.acceptance_rate || 'Not specified'),
            type: 'percentage' as const,
            higherIsBetter: false
          },
          {
            label: "Average Work Experience (Years)",
            icon: Briefcase,
            values: schools.map(s => s.avg_work_exp || 'Not specified'),
            type: 'number' as const,
            higherIsBetter: true
          },
          {
            label: "GMAT/GRE Waiver Available",
            icon: CheckCircle,
            values: schools.map(s => s.gmat_gre_waiver ? 'Yes' : 'No'),
            type: 'text' as const
          },
          {
            label: "Application Fee",
            icon: DollarSign,
            values: schools.map(s => s.application_fee || 'Not specified'),
            type: 'currency' as const,
            higherIsBetter: false
          },
          {
            label: "Application Deadlines",
            icon: Calendar,
            values: schools.map(s => s.application_deadlines || s.application_deadline || 'Multiple rounds'),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Costs & Financial Aid",
        items: [
          {
            label: "Annual Tuition",
            icon: DollarSign,
            values: schools.map(s => s.tuition_per_year || s.tuition || 'Not specified'),
            type: 'currency' as const,
            higherIsBetter: false
          },
          {
            label: "Total Program Cost",
            icon: DollarSign,
            values: schools.map(s => s.total_cost || s.tuition || 'Not specified'),
            type: 'currency' as const,
            higherIsBetter: false
          }
        ]
      },
      {
        title: "Academic Programs",
        items: [
          {
            label: "Specializations",
            icon: BookOpen,
            values: schools.map(s => {
              if (Array.isArray(s.specializations)) {
                return s.specializations.join(', ')
              }
              return s.specializations || 'General Management, Finance, Marketing, Strategy'
            }),
            type: 'text' as const
          },
          {
            label: "Teaching Methodology",
            icon: Users,
            values: schools.map(s => s.teaching_methodology || 'Case studies, lectures, group projects'),
            type: 'text' as const
          },
          {
            label: "Global Focus",
            icon: Globe,
            values: schools.map(s => s.global_focus || 'International exchange programs'),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Career Outcomes",
        items: [
          {
            label: "Employment in 3 Months",
            icon: TrendingUp,
            values: schools.map(s => s.employment_in_3_months || s.employment_rate || 'Not specified'),
            type: 'percentage' as const,
            higherIsBetter: true
          },
          {
            label: "Average Starting Salary",
            icon: DollarSign,
            values: schools.map(s => s.avg_starting_salary || 'Not specified'),
            type: 'currency' as const,
            higherIsBetter: true
          },
          {
            label: "Weighted Salary",
            icon: DollarSign,
            values: schools.map(s => s.weighted_salary || 'Not specified'),
            type: 'currency' as const,
            higherIsBetter: true
          },
          {
            label: "Salary Increase",
            icon: TrendingUp,
            values: schools.map(s => s.salary_increase || 'Not specified'),
            type: 'percentage' as const,
            higherIsBetter: true
          },
          {
            label: "Top Hiring Companies",
            icon: Building,
            values: schools.map(s => s.top_hiring_companies || s.top_industries || 'Not specified'),
            type: 'text' as const
          },
          {
            label: "Career Services",
            icon: Heart,
            values: schools.map(s => s.career_services || 'Comprehensive career support'),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Alumni Network",
        items: [
          {
            label: "Alumni Network Strength",
            icon: Users,
            values: schools.map(s => s.alumni_network_strength || s.alumni_network || 'Not specified'),
            type: 'text' as const
          },
          {
            label: "Alumni Support",
            icon: Heart,
            values: schools.map(s => s.alumni_support || 'Career mentorship and networking events'),
            type: 'text' as const
          },
          {
            label: "Notable Alumni",
            icon: Trophy,
            values: schools.map(s => s.notable_alumni || 'Business leaders and entrepreneurs'),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Student Life & Community",
        items: [
          {
            label: "Campus Life",
            icon: Heart,
            values: schools.map(s => s.campus_life || 'Vibrant campus community'),
            type: 'text' as const
          },
          {
            label: "Student Clubs",
            icon: Users,
            values: schools.map(s => (s as any).student_clubs || '100+ clubs and organizations'),
            type: 'text' as const
          },
          {
            label: "Class Profile",
            icon: Users,
            values: schools.map(s => s.class_profile || 'Diverse, international student body'),
            type: 'text' as const
          }
        ]
      }
    ]
  }, [schools])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
            <div className="space-y-2">
              <p className="text-xl font-semibold">Loading comparison...</p>
              <p className="text-sm text-muted-foreground">Fetching school data for detailed comparison</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || schools.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/mba-schools" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to MBA Schools
            </Link>
          </Button>
        </div>
        
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-4">
            <span>{error || 'No schools selected for comparison'}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/mba-schools">
                  Browse MBA Schools
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/mba-schools" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to MBA Schools
          </Link>
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">MBA School Comparison</h1>
          <p className="text-muted-foreground">
            Comprehensive side-by-side comparison of {schools.length} MBA programs
          </p>
        </div>

        {/* School Headers */}
        <div className={`grid gap-6 mb-8 ${schools.length === 2 ? 'grid-cols-2' : schools.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {schools.map((school) => (
            <Card key={school.id} className="text-center">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{school.name}</CardTitle>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Badge variant="outline">#{school.ranking}</Badge>
                  <Badge variant="secondary">{school.classification || school.tier || 'MBA'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{school.location}, {school.country}</p>
                <div className="mt-3">
                  <ReportDataButton 
                    dataType="mba_school"
                    dataId={school.id}
                    dataTable="mba_schools"
                    currentData={school}
                    variant="outline"
                    size="sm"
                  />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Comparison Sections */}
      <div className="space-y-8">
        {comparisonSections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="text-xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <div className="flex items-center gap-2 mb-3">
                      <item.icon className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">{item.label}</h3>
                    </div>
                    <div className={`grid gap-3 ${schools.length === 2 ? 'grid-cols-2' : schools.length === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                      {item.values.map((value, schoolIndex) => (
                        <div 
                          key={schoolIndex} 
                          className={`p-4 rounded-lg border transition-all ${getBgColor(value, item.values, item.type, item.higherIsBetter)}`}
                        >
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            {schools[schoolIndex]?.name}
                          </div>
                          <div className={`text-sm ${getValueColor(value, item.values, item.type, item.higherIsBetter)}`}>
                            {formatValue(value, item.type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}