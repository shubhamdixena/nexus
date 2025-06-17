"use client"

import { useState, useEffect, useMemo } from "react"
import ActivityLogger from "@/lib/activity-logger"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search, 
  Plus, 
  X, 
  Star, 
  MapPin, 
  Users, 
  DollarSign,
  TrendingUp,
  School,
  ExternalLink,
  Loader2
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface SchoolTarget {
  id?: string
  school_id: string
  school_name: string
  location: string
  ranking_tier: string
  program_of_interest?: string
  application_round?: string
  notes?: string
  priority_score: number
  qs_mba_rank?: number
  ft_global_mba_rank?: number
  bloomberg_mba_rank?: number
  mean_gmat?: number
  avg_starting_salary?: string
  tuition_total?: string
}

export interface MBASchool {
  id: string
  name: string
  location: string
  ranking_tier: string
  difficulty_level: string
  is_featured: boolean
  qs_mba_rank?: number
  ft_global_mba_rank?: number
  bloomberg_mba_rank?: number
  mean_gmat?: number
  avg_starting_salary?: string
  tuition_total?: string
  class_size?: string
  acceptance_rate?: number
  website_url?: string
}

interface EnhancedSchoolSelectorProps {
  value: SchoolTarget[]
  onChange: (targets: SchoolTarget[]) => void
  userId: string
}

export function EnhancedSchoolSelector({ value, onChange, userId }: EnhancedSchoolSelectorProps) {
  const [schools, setSchools] = useState<MBASchool[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddSchool, setShowAddSchool] = useState(false)
  const [savingTargets, setSavingTargets] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const supabase = createClient()

  // Load schools from database
  useEffect(() => {
    loadSchools()
  }, [])

  const loadSchools = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('mba_schools')
        .select(`
          id,
          business_school,
          location,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          avg_starting_salary,
          tuition_total,
          class_size
        `)
        .order('qs_mba_rank', { ascending: true, nullsFirst: false })

      if (error) throw error
      
      // Transform the data to match the expected interface
      const transformedData = (data || []).map(school => ({
        ...school,
        name: school.business_school,
        ranking_tier: school.qs_mba_rank <= 10 ? 'top-10' : 
                     school.qs_mba_rank <= 25 ? 'top-25' : 
                     school.qs_mba_rank <= 50 ? 'top-50' : 
                     school.qs_mba_rank <= 100 ? 'top-100' : 'unranked',
        difficulty_level: school.qs_mba_rank <= 25 ? 'high' : 
                         school.qs_mba_rank <= 50 ? 'medium' : 'low',
        is_featured: school.qs_mba_rank <= 20,
        acceptance_rate: undefined,
        website_url: undefined
      }))
      
      setSchools(transformedData)
    } catch (error) {
      console.error('Error loading schools:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter schools based on search and filters
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           school.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTier = selectedTier === "all" || school.ranking_tier === selectedTier
      const matchesDifficulty = selectedDifficulty === "all" || school.difficulty_level === selectedDifficulty
      const matchesFeatured = !showOnlyFeatured || school.is_featured
      
      // Don't show already selected schools
      const notAlreadySelected = !value.some(target => target.school_id === school.id)
      
      return matchesSearch && matchesTier && matchesDifficulty && matchesFeatured && notAlreadySelected
    })
  }, [schools, searchTerm, selectedTier, selectedDifficulty, showOnlyFeatured, value])

  const addSchoolTarget = async (school: MBASchool) => {
    setSavingTargets(prev => new Set([...prev, school.id]));

    try {
      const response = await fetch('/api/school-targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school_id: school.id,
          priority_score: 5,
        }),
      });

      if (response.ok) {
        const { target } = await response.json();
        onChange([...value, target]);
        setSearchTerm("");
        toast({
          title: "School added!",
          description: `${school.name} has been added to your target schools.`,
        });
        ActivityLogger.addTargetSchool(school.name, 5);
      } else {
        const responseText = await response.text();
        let errorData: { error?: string; details?: string } = {};
        try {
          // It's possible the response is not JSON
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error("Failed to parse error response:", responseText);
          errorData = { error: `Server returned a non-JSON error (status ${response.status})`, details: responseText };
        }
        
        console.error('Error adding school target:', errorData);

        toast({
          title: "Error Adding School",
          description: errorData.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Network or other error:', error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingTargets(prev => {
        const newSet = new Set(prev);
        newSet.delete(school.id);
        return newSet;
      });
    }
  };

  const removeSchoolTarget = async (schoolId: string) => {
    const targetToRemove = value.find(target => target.school_id === schoolId)
    
    if (targetToRemove && targetToRemove.id) {
      try {
        // Remove from database via API
        const response = await fetch(`/api/school-targets?id=${targetToRemove.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Update local state
          onChange(value.filter(target => target.school_id !== schoolId))
          
          // Show success toast
          toast({
            title: "School removed",
            description: `${targetToRemove.school_name} has been removed from your target schools.`,
          })
          
          // Track the activity
          if (targetToRemove) {
            ActivityLogger.removeTargetSchool(targetToRemove.school_name)
          }
        } else {
          console.error('Error removing school target')
          
          // Show error toast
          toast({
            title: "Error removing school",
            description: "Failed to remove school from your targets.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error removing school target:', error)
        
        // Show error toast
        toast({
          title: "Error",
          description: "Network error. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      // No ID means it's a local-only target, just remove from state
      onChange(value.filter(target => target.school_id !== schoolId))
    }
  }

  const updateSchoolTarget = async (schoolId: string, updates: Partial<SchoolTarget>) => {
    const targetToUpdate = value.find(target => target.school_id === schoolId)
    
    // Update local state immediately for responsive UI
    onChange(value.map(target => 
      target.school_id === schoolId 
        ? { ...target, ...updates }
        : target
    ))

    // Save to database if target has an ID
    if (targetToUpdate && targetToUpdate.id) {
      try {
        const response = await fetch('/api/school-targets', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: targetToUpdate.id,
            ...updates
          }),
        })

        if (!response.ok) {
          console.error('Error updating school target')
        }
      } catch (error) {
        console.error('Error updating school target:', error)
      }
    }
  }

  const getRankingDisplay = (school: MBASchool) => {
    if (school.qs_mba_rank) return `#${school.qs_mba_rank} QS`
    if (school.ft_global_mba_rank) return `#${school.ft_global_mba_rank} FT`
    if (school.bloomberg_mba_rank) return `#${school.bloomberg_mba_rank} Bloomberg`
    return "Unranked"
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'top-10': return 'bg-black text-white dark:bg-white dark:text-black'
      case 'top-25': return 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black'
      case 'top-50': return 'bg-gray-600 text-white dark:bg-gray-400 dark:text-black'
      case 'top-100': return 'bg-gray-400 text-white dark:bg-gray-600 dark:text-white'
      default: return 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'
    }
  }

  return (
    <div className="space-y-6">
      {/* Current School Targets */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <School className="h-5 w-5" />
            Your Target Schools
          </h3>
          <Badge variant="outline" className="bg-white dark:bg-black">
            {value.length} school{value.length !== 1 ? 's' : ''} selected
          </Badge>
        </div>

        {value.length === 0 ? (
          <Card className="p-8 text-center bg-gray-50 dark:bg-gray-900 border-2 border-dashed">
            <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="font-semibold mb-2">No schools selected yet</h4>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Start building your target school list to get personalized recommendations and track your applications.
            </p>
            <Button onClick={() => setShowAddSchool(true)} className="bg-black dark:bg-white text-white dark:text-black">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First School
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {value.map((target) => (
              <Card key={target.school_id} className="p-6 hover:shadow-md transition-shadow bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <School className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{target.school_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTierBadgeColor(target.ranking_tier)}>
                          {target.ranking_tier}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {target.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSchoolTarget(target.school_id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Program Interest</Label>
                    <Input
                      placeholder="MBA, Executive MBA..."
                      className="h-9 mt-1"
                      value={target.program_of_interest || ''}
                      onChange={(e) =>
                        updateSchoolTarget(target.school_id, { program_of_interest: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Application Round</Label>
                    <Select
                      value={target.application_round || ''}
                      onValueChange={(value) =>
                        updateSchoolTarget(target.school_id, { application_round: value })
                      }
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue placeholder="Select round" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R1">Round 1 (Early)</SelectItem>
                        <SelectItem value="R2">Round 2 (Regular)</SelectItem>
                        <SelectItem value="R3">Round 3 (Late)</SelectItem>
                        <SelectItem value="Rolling">Rolling Admission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Priority (1-10)</Label>
                    <Select
                      value={target.priority_score.toString()}
                      onValueChange={(value) =>
                        updateSchoolTarget(target.school_id, { priority_score: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(10)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i + 1 >= 8 ? '🔥' : i + 1 >= 6 ? '⭐' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* School Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-semibold">
                      {target.qs_mba_rank ? `#${target.qs_mba_rank}` : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">QS Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">
                      {target.mean_gmat ? target.mean_gmat : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg GMAT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">
                      {target.avg_starting_salary ? target.avg_starting_salary : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Salary</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">
                      {target.tuition_total ? target.tuition_total : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Tuition</div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Textarea
                    placeholder="Add any notes about this school (deadlines, requirements, etc.)..."
                    className="mt-1 min-h-[80px] resize-none"
                    value={target.notes || ''}
                    onChange={(e) =>
                      updateSchoolTarget(target.school_id, { notes: e.target.value })
                    }
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button
          onClick={() => setShowAddSchool(true)}
          variant="outline"
          className="w-full mt-4 h-12 border-2 border-dashed hover:border-solid"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another School
        </Button>
      </div>

      {/* Add School Modal - COMPLETELY FIXED */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-xl">Add Target School</h4>
                  <p className="text-sm text-muted-foreground mt-1">Click on any school below to add it to your target list</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddSchool(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schools by name or location..."
                    className="pl-10 h-12 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Ranking Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rankings</SelectItem>
                      <SelectItem value="top-10">Top 10</SelectItem>
                      <SelectItem value="top-25">Top 25</SelectItem>
                      <SelectItem value="top-50">Top 50</SelectItem>
                      <SelectItem value="top-100">Top 100</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="very-hard">Very Hard</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={showOnlyFeatured}
                      onCheckedChange={(checked) => setShowOnlyFeatured(checked === true)}
                    />
                    <Label htmlFor="featured" className="text-sm">Featured schools only</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* School Results */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading schools...</p>
                </div>
              ) : filteredSchools.length === 0 ? (
                <div className="text-center py-12">
                  <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h5 className="font-semibold mb-2">No schools found</h5>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No schools available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSchools.map((school) => (
                    <Card 
                      key={school.id} 
                      className={`p-6 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:border-black dark:hover:border-white ${savingTargets.has(school.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => {
                        if (!savingTargets.has(school.id)) {
                          addSchoolTarget(school)
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <School className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-semibold text-lg">{school.name}</h5>
                              {school.is_featured && (
                                <Star className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                              <Badge className={`${getTierBadgeColor(school.ranking_tier)}`}>
                                {school.ranking_tier}
                              </Badge>
                              <span className="text-sm font-medium text-muted-foreground">
                                {getRankingDisplay(school)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{school.location}</span>
                              </div>
                              {school.mean_gmat && (
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                  <span>GMAT: {school.mean_gmat}</span>
                                </div>
                              )}
                              {school.avg_starting_salary && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span>{school.avg_starting_salary}</span>
                                </div>
                              )}
                              {school.class_size && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>Class: {school.class_size}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col items-center gap-2">
                          <Button 
                            size="lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              addSchoolTarget(school)
                            }}
                            disabled={savingTargets.has(school.id)}
                            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3"
                          >
                            {savingTargets.has(school.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add School
                              </>
                            )}
                          </Button>
                          <span className="text-xs text-muted-foreground text-center">
                            {savingTargets.has(school.id) ? "Saving..." : "Click anywhere to add"}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}