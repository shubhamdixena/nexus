"use client"

import { useState, useEffect, useMemo } from "react"
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
  Trophy,
  Target,
  Shield,
  Heart
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export interface SchoolTarget {
  id?: string
  school_id: string
  school_name: string
  location: string
  ranking_tier: string
  target_category: 'dream' | 'target' | 'safety'
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
          name,
          location,
          ranking_tier,
          difficulty_level,
          is_featured,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank,
          mean_gmat,
          avg_starting_salary,
          tuition_total,
          class_size,
          acceptance_rate,
          website_url
        `)
        .order('qs_mba_rank', { ascending: true, nullsLast: true })

      if (error) throw error
      setSchools(data || [])
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

  const addSchoolTarget = (school: MBASchool, category: 'dream' | 'target' | 'safety') => {
    const newTarget: SchoolTarget = {
      school_id: school.id,
      school_name: school.name,
      location: school.location,
      ranking_tier: school.ranking_tier,
      target_category: category,
      priority_score: category === 'dream' ? 9 : category === 'target' ? 6 : 3,
      qs_mba_rank: school.qs_mba_rank,
      ft_global_mba_rank: school.ft_global_mba_rank,
      bloomberg_mba_rank: school.bloomberg_mba_rank,
      mean_gmat: school.mean_gmat,
      avg_starting_salary: school.avg_starting_salary,
      tuition_total: school.tuition_total
    }
    
    onChange([...value, newTarget])
    setShowAddSchool(false)
    setSearchTerm("")
  }

  const removeSchoolTarget = (schoolId: string) => {
    onChange(value.filter(target => target.school_id !== schoolId))
  }

  const updateSchoolTarget = (schoolId: string, updates: Partial<SchoolTarget>) => {
    onChange(value.map(target => 
      target.school_id === schoolId 
        ? { ...target, ...updates }
        : target
    ))
  }

  const getRankingDisplay = (school: MBASchool) => {
    if (school.qs_mba_rank) return `#${school.qs_mba_rank} QS`
    if (school.ft_global_mba_rank) return `#${school.ft_global_mba_rank} FT`
    if (school.bloomberg_mba_rank) return `#${school.bloomberg_mba_rank} Bloomberg`
    return "Unranked"
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'top-10': return 'bg-purple-100 text-purple-800'
      case 'top-25': return 'bg-blue-100 text-blue-800'
      case 'top-50': return 'bg-green-100 text-green-800'
      case 'top-100': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dream': return <Heart className="h-4 w-4 text-red-500" />
      case 'target': return <Target className="h-4 w-4 text-blue-500" />
      case 'safety': return <Shield className="h-4 w-4 text-green-500" />
      default: return null
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dream': return 'border-red-200 bg-red-50'
      case 'target': return 'border-blue-200 bg-blue-50'
      case 'safety': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Current School Targets */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">🎯 Your Target Schools</h3>
          <Badge variant="outline">
            {value.length} school{value.length !== 1 ? 's' : ''} selected
          </Badge>
        </div>

        {value.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              No schools selected yet. Add some target schools to get personalized recommendations!
            </p>
            <Button onClick={() => setShowAddSchool(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First School
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {value.map((target) => (
              <Card key={target.school_id} className={`p-4 ${getCategoryColor(target.target_category)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(target.target_category)}
                    <h4 className="font-semibold">{target.school_name}</h4>
                    <Badge className={getTierBadgeColor(target.ranking_tier)}>
                      {target.ranking_tier}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSchoolTarget(target.school_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select
                      value={target.target_category}
                      onValueChange={(value: 'dream' | 'target' | 'safety') =>
                        updateSchoolTarget(target.school_id, { target_category: value })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dream">❤️ Dream School</SelectItem>
                        <SelectItem value="target">🎯 Target School</SelectItem>
                        <SelectItem value="safety">🛡️ Safety School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Program Interest</Label>
                    <Input
                      placeholder="MBA, Executive MBA..."
                      className="h-8"
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
                      <SelectTrigger className="h-8">
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
                      <SelectTrigger className="h-8">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {target.location}
                  </div>
                  {target.mean_gmat && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      GMAT: {target.mean_gmat}
                    </div>
                  )}
                  {target.avg_starting_salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Avg Salary: {target.avg_starting_salary}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Textarea
                    placeholder="Add any notes about this school..."
                    className="mt-1 min-h-[60px]"
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
          className="w-full mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another School
        </Button>
      </div>

      {/* Add School Dialog */}
      {showAddSchool && (
        <Card className="p-6 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Add Target School</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddSchool(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schools by name or location..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
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
                  <SelectItem value="unranked">Unranked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="very-hard">Very Hard</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={showOnlyFeatured}
                  onCheckedChange={setShowOnlyFeatured}
                />
                <Label htmlFor="featured" className="text-sm">
                  Featured schools only
                </Label>
              </div>
            </div>
          </div>

          {/* School Results */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="text-center py-8">Loading schools...</div>
            ) : filteredSchools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No schools match your search criteria' : 'No schools available'}
              </div>
            ) : (
              filteredSchools.map((school) => (
                <Card key={school.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{school.name}</h5>
                      {school.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500" />
                      )}
                      <Badge className={getTierBadgeColor(school.ranking_tier)}>
                        {school.ranking_tier}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      {getRankingDisplay(school)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {school.location}
                    </div>
                    {school.mean_gmat && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        GMAT: {school.mean_gmat}
                      </div>
                    )}
                    {school.avg_starting_salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {school.avg_starting_salary}
                      </div>
                    )}
                    {school.class_size && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Class: {school.class_size}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addSchoolTarget(school, 'dream')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      Dream
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addSchoolTarget(school, 'target')}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Target
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addSchoolTarget(school, 'safety')}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Safety
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}