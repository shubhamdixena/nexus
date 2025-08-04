"use client"

import { useState, useEffect, useMemo } from "react"
import ActivityLogger from "@/lib/activity-logger"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { 
  Search, 
  Plus, 
  X, 
  MapPin, 
  School,
  Loader2,
  AlertCircle,
  Check
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface SchoolTarget {
  id?: string
  school_id: string
  school_name: string
  location: string
  ranking_tier: string
  application_round?: string
  priority_score: number
  qs_mba_rank?: number
}

export interface MBASchool {
  id: string
  name: string
  location: string
  qs_mba_rank?: number
  ft_global_mba_rank?: number
  bloomberg_mba_rank?: number
}

interface EnhancedSchoolSelectorProps {
  value: SchoolTarget[]
  onChange: (targets: SchoolTarget[]) => void
  userId: string
}

export function EnhancedSchoolSelector({ value, onChange, userId }: EnhancedSchoolSelectorProps) {
  const [schools, setSchools] = useState<MBASchool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<MBASchool | null>(null)
  const [showRoundPriorityDialog, setShowRoundPriorityDialog] = useState(false)
  const [applicationRound, setApplicationRound] = useState<string>("")
  const [priorityScore, setPriorityScore] = useState<number>(5)
  const [savingTarget, setSavingTarget] = useState(false)
  const [localTargets, setLocalTargets] = useState<SchoolTarget[]>(value || [])
  const { toast } = useToast()

  const supabase = createClient()

  // Sync local targets with incoming value prop
  useEffect(() => {
    setLocalTargets(value || [])
  }, [value])

  // Load current user's school targets if value is empty but userId is available
  useEffect(() => {
    if (userId && (!value || value.length === 0)) {
      loadUserSchoolTargets()
    }
  }, [userId, value])

  const loadUserSchoolTargets = async () => {
    try {
      const response = await fetch('/api/school-targets')
      if (response.ok) {
        const data = await response.json()
        const targets = data.targets || []
        setLocalTargets(targets)
        onChange(targets) // Update parent component
      }
    } catch (error) {
      console.error('Error loading user school targets:', error)
    }
  }

  // Load schools from database
  useEffect(() => {
    loadSchools()
  }, [])

  const loadSchools = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      
      const { data, error } = await supabase
        .from('mba_schools')
        .select(`
          id,
          business_school,
          location,
          qs_mba_rank,
          ft_global_mba_rank,
          bloomberg_mba_rank
        `)
        .order('qs_mba_rank', { ascending: true, nullsFirst: false })

      if (error) {
        console.error('Supabase error:', error)
        setLoadError('Failed to load schools. Please try again.')
        return
      }
      
      // Transform the data
      const transformedData = (data || []).map(school => ({
        id: school.id,
        name: school.business_school || 'MBA School',
        location: school.location || 'Unknown Location',
        qs_mba_rank: school.qs_mba_rank,
        ft_global_mba_rank: school.ft_global_mba_rank,
        bloomberg_mba_rank: school.bloomberg_mba_rank
      }))
      
      setSchools(transformedData)
      
      if (transformedData.length === 0) {
        setLoadError('No schools found in the database.')
      }
    } catch (error) {
      console.error('Error loading schools:', error)
      setLoadError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter schools to exclude already selected ones
  const availableSchools = useMemo(() => {
    return schools.filter(school => 
      !localTargets.some(target => target.school_id === school.id)
    )
  }, [schools, localTargets])

  const handleSchoolSelect = (school: MBASchool) => {
    setSelectedSchool(school)
    setShowAddDialog(false)
    setShowRoundPriorityDialog(true)
    setApplicationRound("")
    setPriorityScore(5)
  }

  const handleAddSchoolTarget = async () => {
    if (!selectedSchool || !userId) {
      console.error('Missing selectedSchool or userId')
      return
    }

    setSavingTarget(true)

    try {
      const response = await fetch('/api/school-targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school_id: selectedSchool.id,
          priority_score: priorityScore,
          application_round: applicationRound,
          target_category: 'target',
        }),
      })

      const responseData = await response.json()

      if (response.ok && responseData.target) {
        // Update the local and parent state immediately to reflect changes
        const updatedTargets = [...localTargets, responseData.target]
        setLocalTargets(updatedTargets)
        onChange(updatedTargets)
        
        toast({
          title: "School added! 🎉",
          description: `${selectedSchool.name} has been added to your target schools.`,
        })
        
        ActivityLogger.addTargetSchool(selectedSchool.name, priorityScore)
        
        // Reset state only after successful addition
        setSelectedSchool(null)
        setShowRoundPriorityDialog(false)
        setApplicationRound("")
        setPriorityScore(5)
      } else {
        // Handle error responses properly
        if (response.status === 409) {
          toast({
            title: "School Already Added",
            description: "This school is already in your target list.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error Adding School",
            description: responseData.error || `Server error: ${response.status}`,
            variant: "destructive",
          })
        }
        console.error('Server error response:', responseData)
      }
    } catch (error) {
      console.error('Error adding school target:', error)
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingTarget(false)
    }
  }

  const removeSchoolTarget = async (schoolId: string) => {
    const targetToRemove = localTargets.find(target => target.school_id === schoolId)
    
    if (targetToRemove?.id) {
      try {
        const response = await fetch(`/api/school-targets?id=${targetToRemove.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const updatedTargets = localTargets.filter(target => target.school_id !== schoolId)
          setLocalTargets(updatedTargets)
          onChange(updatedTargets)
          
          toast({
            title: "School removed",
            description: `${targetToRemove.school_name} has been removed from your target schools.`,
          })
          
          ActivityLogger.removeTargetSchool(targetToRemove.school_name)
        } else {
          toast({
            title: "Error removing school",
            description: "Failed to remove school from your targets.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error removing school target:', error)
        toast({
          title: "Error",
          description: "Network error. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const updateSchoolTarget = async (schoolId: string, updates: Partial<SchoolTarget>) => {
    const targetToUpdate = localTargets.find(target => target.school_id === schoolId)
    
    // Update local state immediately
    const updatedTargets = localTargets.map(target => 
      target.school_id === schoolId 
        ? { ...target, ...updates }
        : target
    )
    setLocalTargets(updatedTargets)
    onChange(updatedTargets)

    // Save to database if target has an ID
    if (targetToUpdate?.id) {
      try {
        await fetch('/api/school-targets', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: targetToUpdate.id,
            ...updates
          }),
        })
      } catch (error) {
        console.error('Error updating school target:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {loadError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-900">Unable to Load Schools</h4>
              <p className="text-sm text-red-700">{loadError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadSchools} 
                className="mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Retrying...' : 'Try Again'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Target Schools Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <School className="h-5 w-5" />
          Your Target Schools
        </h3>
        <Badge variant="outline">
          {localTargets.length} school{localTargets.length !== 1 ? 's' : ''} selected
        </Badge>
      </div>

      {/* Current Target Schools */}
      {localTargets.length === 0 ? (
        <Card className="p-8 text-center bg-gray-50 dark:bg-gray-900 border-2 border-dashed">
          <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h4 className="font-semibold mb-2">No schools selected yet</h4>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Start building your target school list to get personalized recommendations.
          </p>
          <Button 
            onClick={() => setShowAddDialog(true)} 
            disabled={isLoading || !!loadError}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isLoading ? 'Loading Schools...' : 'Add Your First School'}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* School Capsules with Edit Icons */}
          <div className="flex flex-wrap gap-3">
            {localTargets.map((target) => (
              <div 
                key={target.school_id}
                className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-3 rounded-full border border-primary/20 hover:bg-primary/15 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-semibold">
                    {target.priority_score}
                  </Badge>
                  <span className="font-medium">{target.school_name}</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {target.location}
                  </span>
                  {target.application_round && (
                    <Badge variant="outline" className="text-xs">
                      {target.application_round}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSchool({
                        id: target.school_id,
                        name: target.school_name,
                        location: target.location,
                        qs_mba_rank: target.qs_mba_rank
                      })
                      setApplicationRound(target.application_round || "")
                      setPriorityScore(target.priority_score)
                      setShowRoundPriorityDialog(true)
                    }}
                    className="h-6 w-6 p-0 text-primary hover:text-primary/80"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSchoolTarget(target.school_id)}
                    className="h-6 w-6 p-0 text-primary hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another School Button */}
          <Button
            onClick={() => setShowAddDialog(true)}
            variant="outline"
            className="w-full border-dashed"
            disabled={isLoading || !!loadError}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another School
          </Button>
        </div>
      )}

      {/* School Search Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Search Schools</DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <Command className="rounded-lg border">
              <CommandInput placeholder="Search schools by name or location..." />
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading schools...
                  </div>
                ) : (
                  "No schools found."
                )}
              </CommandEmpty>
              <CommandList className="max-h-[400px]">
                <CommandGroup>
                  {availableSchools.map((school) => (
                    <CommandItem
                      key={school.id}
                      onSelect={() => handleSchoolSelect(school)}
                      className="cursor-pointer p-4"
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex-1">
                          <div className="font-medium text-base">{school.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {school.location}
                          </div>
                        </div>
                        {school.qs_mba_rank && (
                          <Badge variant="outline" className="text-xs">
                            #{school.qs_mba_rank}
                          </Badge>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </DialogContent>
      </Dialog>

      {/* Round & Priority Selection Dialog */}
      <Dialog open={showRoundPriorityDialog} onOpenChange={setShowRoundPriorityDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSchool?.id && localTargets.find(t => t.school_id === selectedSchool.id) 
                ? "Edit Target School" 
                : "Add Target School"
              }
            </DialogTitle>
          </DialogHeader>
          
          {selectedSchool && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium text-lg">{selectedSchool.name}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {selectedSchool.location}
                </p>
                {selectedSchool.qs_mba_rank && (
                  <Badge variant="outline" className="text-xs mt-2">
                    #{selectedSchool.qs_mba_rank}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Application Round</Label>
                  <Select value={applicationRound} onValueChange={setApplicationRound}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select application round" />
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
                  <Label className="text-base font-medium">Priority (1-10)</Label>
                  <Select value={priorityScore.toString()} onValueChange={(value) => setPriorityScore(parseInt(value))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{i + 1}</span>
                            <span className="text-xs text-muted-foreground">
                              {i + 1 >= 8 ? '🔥 High Priority' : 
                               i + 1 >= 6 ? '⭐ Medium Priority' : 
                               '📌 Low Priority'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRoundPriorityDialog(false)
                    setSelectedSchool(null)
                    setApplicationRound("")
                    setPriorityScore(5)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    // Check if this is an edit operation
                    const isEdit = selectedSchool?.id && localTargets.find(t => t.school_id === selectedSchool.id)
                    
                    if (isEdit) {
                      // Update existing school
                      await updateSchoolTarget(selectedSchool.id, {
                        application_round: applicationRound,
                        priority_score: priorityScore
                      })
                      
                      toast({
                        title: "School updated! ✅",
                        description: `${selectedSchool.name} has been updated.`,
                      })
                      
                      // Reset state after successful update
                      setShowRoundPriorityDialog(false)
                      setSelectedSchool(null)
                      setApplicationRound("")
                      setPriorityScore(5)
                    } else {
                      // Add new school
                      await handleAddSchoolTarget()
                      // handleAddSchoolTarget manages its own state reset
                    }
                  }}
                  disabled={savingTarget}
                  className="flex-1"
                >
                  {savingTarget ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {localTargets.find(t => t.school_id === selectedSchool?.id) ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {localTargets.find(t => t.school_id === selectedSchool?.id) ? 'Update School' : 'Add School'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}