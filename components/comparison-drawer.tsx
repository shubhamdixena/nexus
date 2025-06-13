"use client"

import { useState, useEffect } from "react"
import { X, GitCompare, ChevronUp, ChevronDown, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCompare } from "@/hooks/use-compare"
import { cn } from "@/lib/utils"

export function ComparisonDrawer() {
  const { compareItems, removeFromCompare, clearCompare, compareCount } = useCompare()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Show/hide drawer based on compareCount
  useEffect(() => {
    if (compareCount > 0) {
      setIsVisible(true)
      // Auto-expand when reaching 2 items
      if (compareCount >= 2) {
        setIsExpanded(true)
      }
    } else {
      setIsVisible(false)
      setIsExpanded(false)
    }
  }, [compareCount])

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 transition-transform duration-300",
      "z-[9999]",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Drawer */}
      <Card className={cn(
        "relative mx-4 mb-4 border-2 shadow-xl transition-all duration-300 bg-background",
        isExpanded ? "max-h-96" : "max-h-20"
      )}>
        {/* Handle Bar */}
        <div 
          className="flex items-center justify-center p-2 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Collapsed View */}
        {!isExpanded && (
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitCompare className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-sm">Compare Schools</h3>
                  <p className="text-xs text-muted-foreground">
                    {compareCount} school{compareCount > 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {compareCount >= 2 && (
                  <Link href="/mba-schools/compare">
                    <Button size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Compare
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <CardContent className="p-4 pt-0 max-h-80 overflow-y-auto">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Compare Schools ({compareCount})</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  {compareCount >= 2 && (
                    <Link href="/mba-schools/compare">
                      <Button size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Full Comparison
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearCompare}
                  >
                    Clear All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* School Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {compareItems.map((school) => (
                  <div 
                    key={school.id}
                    className="relative p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeFromCompare(school.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    <div className="pr-6">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {school.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {school.location}
                      </p>
                      
                      <div className="space-y-1">
                        {school.ranking && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Ranking</span>
                            <Badge variant="secondary" className="text-xs h-5">
                              #{school.ranking}
                            </Badge>
                          </div>
                        )}
                        
                        {school.avg_gmat && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">GMAT</span>
                            <span className="text-xs font-medium">{school.avg_gmat}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add More Schools Placeholder */}
                {compareCount < 4 && (
                  <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <GitCompare className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        Add {4 - compareCount} more school{4 - compareCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Comparison Preview (if 2+ schools) */}
              {compareCount >= 2 && (
                <div className="border-t pt-3 mt-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Avg GMAT Range</p>
                      <p className="text-sm font-medium">
                        {Math.min(...compareItems.map(s => s.avg_gmat || 0).filter(Boolean))} - {Math.max(...compareItems.map(s => s.avg_gmat || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Ranking Range</p>
                      <p className="text-sm font-medium">
                        #{Math.min(...compareItems.map(s => s.ranking || 999).filter(Boolean))} - #{Math.max(...compareItems.map(s => s.ranking || 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Locations</p>
                      <p className="text-sm font-medium">
                        {new Set(compareItems.map(s => s.country)).size} countries
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}