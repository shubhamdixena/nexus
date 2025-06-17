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
        
        console.log('All schools from API:', response.data.length)
        console.log('Schools to compare:', schoolsToCompare)
        console.log('Filtered schools found:', filteredSchools.length)
        console.log('First filtered school:', filteredSchools[0])
        
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
    if (type === 'text') return 'text-gray-900 dark:text-gray-100'
    
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

    if (numericValues.length < 2) return 'text-gray-900 dark:text-gray-100'

    const currentValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''))
    if (isNaN(currentValue)) return 'text-gray-900 dark:text-gray-100'

    const max = Math.max(...numericValues)
    const min = Math.min(...numericValues)
    
    if (max === min) return 'text-gray-900 dark:text-gray-100'
    
    if (higherIsBetter) {
      if (currentValue === max) return 'text-green-600 dark:text-green-400 font-semibold'
      if (currentValue === min) return 'text-red-500 dark:text-red-400'
    } else {
      if (currentValue === min) return 'text-green-600 dark:text-green-400 font-semibold'
      if (currentValue === max) return 'text-red-500 dark:text-red-400'
    }
    
    return 'text-gray-900 dark:text-gray-100'
  }

  const getBgColor = (value: any, values: any[], type: string, higherIsBetter: boolean = true) => {
    if (type === 'text') return 'bg-gray-50 dark:bg-gray-800'
    
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

    if (numericValues.length < 2) return 'bg-gray-50 dark:bg-gray-800'

    const currentValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''))
    if (isNaN(currentValue)) return 'bg-gray-50 dark:bg-gray-800'

    const max = Math.max(...numericValues)
    const min = Math.min(...numericValues)
    
    if (max === min) return 'bg-gray-50 dark:bg-gray-800'
    
    if (higherIsBetter) {
      if (currentValue === max) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      if (currentValue === min) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    } else {
      if (currentValue === min) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      if (currentValue === max) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }
    
    return 'bg-gray-50 dark:bg-gray-800'
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
            label: "FT Global MBA Ranking",
            icon: Trophy,
            values: schools.map(s => (s as any).ft_global_mba_rank || 'Not ranked'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "QS MBA Ranking",
            icon: Award,
            values: schools.map(s => (s as any).qs_mba_rank || 'Not ranked'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "Bloomberg MBA Ranking",
            icon: Award, 
            values: schools.map(s => (s as any).bloomberg_mba_rank || 'Not ranked'),
            type: 'number' as const,
            higherIsBetter: false
          }
        ]
      },
      {
        title: "Program Structure",
        items: [
          {
            label: "Class Size",
            icon: Users,
            values: schools.map(s => (s as any).class_size || 'Not specified'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "Women (%)",
            icon: Users,
            values: schools.map(s => (s as any).women ? `${(s as any).women}%` : 'Not specified'),
            type: 'percentage' as const,
            higherIsBetter: true
          },
          {
            label: "International Students (%)",
            icon: Globe,
            values: schools.map(s => (s as any).international_students ? `${(s as any).international_students}%` : 'Not specified'),
            type: 'percentage' as const,
            higherIsBetter: true
          },
          {
            label: "Program Duration",
            icon: Clock,
            values: schools.map(s => (s as any).program_duration || 'Full-time 2 years'),
            type: 'text' as const
          },
          {
            label: "STEM Designation",
            icon: GraduationCap,
            values: schools.map(s => (s as any).stem_designation || 'NA'),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Admissions",
        items: [
          {
            label: "Average GMAT",
            icon: Award,
            values: schools.map(s => (s as any).avg_gmat || 'Not specified'),
            type: 'number' as const,
            higherIsBetter: true
          },
          {
            label: "Average GPA",
            icon: GraduationCap,
            values: schools.map(s => (s as any).avg_gpa || 'Not specified'),
            type: 'number' as const,
            higherIsBetter: true
          },
          {
            label: "Average GRE",
            icon: Award,
            values: schools.map(s => (s as any).avg_gre || 'Not specified'),
            type: 'number' as const,
            higherIsBetter: true
          },
          {
            label: "Work Experience (Years)",
            icon: Briefcase,
            values: schools.map(s => (s as any).avg_work_exp_years || 'Not specified'),
            type: 'number' as const,
            higherIsBetter: false
          },
          {
            label: "Round 1 Deadline",
            icon: Calendar,
            values: schools.map(s => (s as any).r1_deadline || 'Not specified'),
            type: 'text' as const
          },
          {
            label: "Round 2 Deadline",
            icon: Calendar,
            values: schools.map(s => (s as any).r2_deadline || 'Not specified'),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Costs & Financial Aid",
        items: [
          {
            label: "Total Tuition",
            icon: DollarSign,
            values: schools.map(s => {
              if (!(s as any).tuition_total) return 'Not specified'
              return `$${Number((s as any).tuition_total).toLocaleString()}`
            }),
            type: 'currency' as const,
            higherIsBetter: false
          },
          {
            label: "Application Fee",
            icon: DollarSign,
            values: schools.map(s => {
              if (!(s as any).application_fee) return 'Not specified'
              return `$${Number((s as any).application_fee)}`
            }),
            type: 'currency' as const,
            higherIsBetter: false
          },
          {
            label: "Average Starting Salary",
            icon: DollarSign,
            values: schools.map(s => {
              if (!(s as any).avg_starting_salary) return 'Not specified'
              return `$${Number((s as any).avg_starting_salary).toLocaleString()}`
            }),
            type: 'currency' as const,
            higherIsBetter: true
          },
          {
            label: "Weighted Salary (USD)",
            icon: TrendingUp,
            values: schools.map(s => {
              if (!(s as any).weighted_salary_usd) return 'Not specified'
              return `$${Number((s as any).weighted_salary_usd).toLocaleString()}`
            }),
            type: 'currency' as const,
            higherIsBetter: true
          }
        ]
      },
      {
        title: "Career Outcomes",
        items: [
          {
            label: "Employment in 3 Months (%)",
            icon: TrendingUp,
            values: schools.map(s => {
              return (s as any).employment_in_3_months_percent ? `${(s as any).employment_in_3_months_percent}%` : 'Not specified'
            }),
            type: 'percentage' as const,
            higherIsBetter: true
          },
          {
            label: "Top Hiring Companies",
            icon: Building,
            values: schools.map(s => (s as any).top_hiring_companies || 'Not specified'),
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
            values: schools.map(s => (s as any).alumni_network_strength || 'Not specified'),
            type: 'text' as const
          },
          {
            label: "Notable Alumni",
            icon: Trophy,
            values: schools.map(s => 
              [(s as any).alumnus_1, (s as any).alumnus_2, (s as any).alumnus_3, (s as any).alumnus_4]
                .filter(Boolean)
                .join(', ') || 'Business leaders and entrepreneurs'
            ),
            type: 'text' as const
          }
        ]
      },
      {
        title: "Additional Information",
        items: [
          {
            label: "Key Features",
            icon: Heart,
            values: schools.map(s => (s as any).key_features || 'Not specified'),
            type: 'text' as const
          },
          {
            label: "Core Curriculum",
            icon: BookOpen,
            values: schools.map(s => (s as any).core_curriculum || 'Comprehensive business curriculum'),
            type: 'text' as const
          },
          {
            label: "Credits Required",
            icon: GraduationCap,
            values: schools.map(s => (s as any).credits_required || 'Not specified'),
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
          {schools.map((school) => {
            console.log('Rendering school:', school.id, 'business_school:', (school as any).business_school)
            return (
            <Card key={school.id} className="text-center">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{(school as any).business_school || (school as any).name || 'Unknown School'}</CardTitle>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {(school as any).ft_global_mba_rank && <Badge variant="outline">FT #{(school as any).ft_global_mba_rank}</Badge>}
                  {(school as any).qs_mba_rank && <Badge variant="secondary">QS #{(school as any).qs_mba_rank}</Badge>}
                  <Badge variant="outline">MBA</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{(school as any).location}</p>
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
            )
          })}
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
                          <div className={`text-sm font-medium ${getValueColor(value, item.values, item.type, item.higherIsBetter)}`}>
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