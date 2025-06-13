"use client"

import React, { useState, useEffect } from 'react'
import { Search, X, MapPin, Award, Users, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MBASchoolRealtimeService, type MBASchool } from '@/lib/realtime-services'

interface MBASchoolComparisonModalProps {
  trigger?: React.ReactNode
}

export function MBASchoolComparisonModal({ trigger }: MBASchoolComparisonModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [schools, setSchools] = useState<MBASchool[]>([])
  const [filteredSchools, setFilteredSchools] = useState<MBASchool[]>([])
  const [selectedSchools, setSelectedSchools] = useState<MBASchool[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  // Load schools when modal opens
  useEffect(() => {
    if (open && schools.length === 0) {
      loadSchools()
    }
  }, [open])

  // Filter schools based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSchools(schools)
    } else {
      const filtered = schools.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSchools(filtered)
    }
  }, [searchQuery, schools])

  const loadSchools = async () => {
    try {
      setLoading(true)
      const response = await MBASchoolRealtimeService.getMBASchools({ 
        limit: 100,
        orderBy: 'ranking'
      })
      
      if (response && response.data) {
        setSchools(response.data)
        setFilteredSchools(response.data)
      }
    } catch (error) {
      console.error('Error loading schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSchoolSelect = (school: MBASchool) => {
    if (selectedSchools.find(s => s.id === school.id)) {
      // Remove if already selected
      setSelectedSchools(prev => prev.filter(s => s.id !== school.id))
    } else if (selectedSchools.length < 2) {
      // Add if less than 2 selected
      setSelectedSchools(prev => [...prev, school])
    }
  }

  const handleCompare = () => {
    if (selectedSchools.length === 2) {
      // Navigate to comparison page with school IDs as query parameters
      const schoolIds = selectedSchools.map(s => s.id).join(',')
      router.push(`/mba-schools/compare?schools=${schoolIds}`)
      // Close modal after navigation
      setOpen(false)
      handleReset()
    }
  }

  const handleReset = () => {
    setSelectedSchools([])
    setSearchQuery("")
  }

  const handleModalClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        handleReset()
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Compare MBA Schools</DialogTitle>
          <DialogDescription>
            Select exactly 2 schools to compare their programs, admissions, and outcomes
          </DialogDescription>
        </DialogHeader>

        {/* Selection Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Selected Schools ({selectedSchools.length}/2)
            </h4>
            {selectedSchools.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedSchools([])}>
                Clear All
              </Button>
            )}
          </div>
          
          {selectedSchools.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedSchools.map((school, index) => (
                <Card key={school.id} className="border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-sm line-clamp-1">{school.name}</CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {school.location}, {school.country}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSchoolSelect(school)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {selectedSchools.length === 1 && (
                <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
                  <CardContent className="flex items-center justify-center h-20">
                    <p className="text-sm text-muted-foreground">Select another school</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search schools by name, location, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Schools List */}
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading schools...</p>
                </div>
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No schools found matching your search.' : 'No schools available.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSchools.map((school) => {
                  const isSelected = selectedSchools.find(s => s.id === school.id)
                  const canSelect = selectedSchools.length < 2 || isSelected
                  
                  return (
                    <Card 
                      key={school.id} 
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : canSelect 
                            ? 'hover:border-primary/50' 
                            : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => canSelect && handleSchoolSelect(school)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm line-clamp-1">{school.name}</h4>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {school.location}, {school.country}
                                </div>
                              </div>
                              {school.ranking && (
                                <Badge variant="outline" className="text-xs">
                                  #{school.ranking}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">GMAT:</span>
                                <div className="font-medium">{school.avg_gmat || 'N/A'}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Class Size:</span>
                                <div className="font-medium">{school.class_size || 'N/A'}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Accept Rate:</span>
                                <div className="font-medium">{school.acceptance_rate ? `${school.acceptance_rate}%` : 'N/A'}</div>
                              </div>
                            </div>

                            {school.category && (
                              <Badge variant="secondary" className="text-xs w-fit">
                                {school.category}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="ml-3 flex items-center">
                            {isSelected && (
                              <div className="rounded-full bg-primary p-1">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedSchools.length === 0 && "Select 2 schools to compare"}
            {selectedSchools.length === 1 && "Select 1 more school to compare"}
            {selectedSchools.length === 2 && "Ready to compare!"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleModalClose(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompare}
              disabled={selectedSchools.length !== 2}
            >
              Compare Schools
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}