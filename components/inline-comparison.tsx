"use client"

import React, { useState } from "react"
import { X, Globe, MapPin, Award, Users, DollarSign, Calendar, GraduationCap, Building, GitCompare, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCompare } from "@/hooks/use-compare"

interface ComparisonField {
  label: string
  key: string
  type: 'text' | 'number' | 'badge' | 'link' | 'currency' | 'percentage' | 'list'
  icon?: any
  category: 'basic' | 'academic' | 'financial' | 'outcomes'
}

const comparisonFields: ComparisonField[] = [
  // Basic Information
  { label: "Program Type", key: "type", type: "badge", icon: GraduationCap, category: "basic" },
  { label: "Location", key: "location", type: "text", icon: MapPin, category: "basic" },
  { label: "Duration", key: "duration", type: "text", icon: Calendar, category: "basic" },
  { label: "Class Size", key: "class_size", type: "number", icon: Users, category: "basic" },
  
  // Academic
  { label: "Ranking", key: "ranking", type: "number", icon: Award, category: "academic" },
  { label: "Average GMAT", key: "avg_gmat", type: "number", icon: Award, category: "academic" },
  { label: "GMAT Range", key: "gmat_range", type: "text", category: "academic" },
  { label: "Average GPA", key: "avg_gpa", type: "number", category: "academic" },
  { label: "Acceptance Rate", key: "acceptance_rate", type: "percentage", category: "academic" },
  
  // Financial
  { label: "Tuition", key: "tuition", type: "currency", icon: DollarSign, category: "financial" },
  { label: "Total Cost", key: "total_cost", type: "currency", icon: DollarSign, category: "financial" },
  
  // Outcomes
  { label: "Employment Rate", key: "employment_rate", type: "percentage", category: "outcomes" },
  { label: "Average Starting Salary", key: "avg_starting_salary", type: "currency", category: "outcomes" },
  { label: "Top Industries", key: "top_industries", type: "list", category: "outcomes" },
]

const categoryTitles = {
  basic: "Program Details",
  academic: "Academic Profile", 
  financial: "Cost & Fees",
  outcomes: "Career Outcomes"
}

interface InlineComparisonProps {
  className?: string
}

export function InlineComparison({ className = "" }: InlineComparisonProps) {
  const { compareItems, removeFromCompare, clearCompare, compareCount } = useCompare()
  const [isExpanded, setIsExpanded] = useState(false)

  const renderFieldValue = (item: any, field: ComparisonField) => {
    const value = item[field.key]
    
    if (!value || value === '' || value === 0) {
      return <span className="text-muted-foreground text-sm">N/A</span>
    }

    switch (field.type) {
      case 'number':
        return <span className="font-semibold">{value}</span>
      
      case 'badge':
        return <Badge variant="outline" className="text-xs">{value}</Badge>
      
      case 'link':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
          >
            <Globe className="h-3 w-3" />
            Visit
          </a>
        )
      
      case 'currency':
        return <span className="font-semibold text-green-600">{value}</span>
      
      case 'percentage':
        return <span className="font-semibold">{value}%</span>
      
      case 'list':
        const items = String(value).split(',').slice(0, 3)
        return (
          <div className="space-y-1">
            {items.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs mr-1">
                {item.trim()}
              </Badge>
            ))}
          </div>
        )
      
      default:
        return <span className="text-sm">{value}</span>
    }
  }

  if (compareCount === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-2">No Schools Selected for Comparison</h3>
            <p className="text-muted-foreground text-sm">
              Select schools using the "Compare" button to see a detailed comparison here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                School Comparison ({compareCount} schools)
              </CardTitle>
              <CardDescription>
                Side-by-side comparison of your selected MBA programs
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Expand Details
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={clearCompare}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* School Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {compareItems.map((school) => (
          <Card key={school.id} className="relative group hover:shadow-md transition-shadow">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeFromCompare(school.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-base line-clamp-2 pr-8">{school.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {school.location}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ranking</span>
                <Badge variant="secondary">#{school.ranking}</Badge>
              </div>
              
              {school.avg_gmat && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg GMAT</span>
                  <span className="text-sm font-medium">{school.avg_gmat}</span>
                </div>
              )}
              
              {school.tuition && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tuition</span>
                  <span className="text-sm font-medium text-green-600">{school.tuition}</span>
                </div>
              )}
              
              <Link href={`/mba-schools/${school.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Comparison (Expandable) */}
      {isExpanded && (
        <div className="space-y-6">
          {Object.entries(categoryTitles).map(([category, title]) => {
            const categoryFields = comparisonFields.filter(field => field.category === category)
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {categoryFields[0]?.icon && React.createElement(categoryFields[0].icon, { className: "h-5 w-5" })}
                    {title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {categoryFields.map((field) => (
                      <div key={field.key} className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${compareItems.length}, 1fr)` }}>
                        <div className="flex items-center gap-2 font-medium text-sm">
                          {field.icon && React.createElement(field.icon, { className: "h-4 w-4 text-muted-foreground" })}
                          {field.label}
                        </div>
                        
                        {compareItems.map((school) => (
                          <div key={school.id} className="flex items-center justify-center p-3 bg-muted/30 rounded-md">
                            {renderFieldValue(school, field)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick Stats Summary */}
      {compareCount >= 2 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">GMAT Range</h4>
                <p className="text-lg font-bold">
                  {Math.min(...compareItems.map(s => s.avg_gmat || 0).filter(Boolean))} - {Math.max(...compareItems.map(s => s.avg_gmat || 0))}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Ranking Range</h4>
                <p className="text-lg font-bold">
                  #{Math.min(...compareItems.map(s => s.ranking || 999).filter(Boolean))} - #{Math.max(...compareItems.map(s => s.ranking || 0))}
                </p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Countries</h4>
                <p className="text-lg font-bold">
                  {new Set(compareItems.map(s => s.country)).size} countries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}