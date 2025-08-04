/**
 * School Target Add Dialog Component
 * 
 * Form dialog for adding a new school to targets with proper validation
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trophy, MapPin, Globe, ExternalLink } from 'lucide-react'
import { MBASchoolOption } from '@/types/school-targets'
import { useCreateSchoolTarget } from '@/lib/school-targets-api'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'

interface SchoolTargetAddDialogProps {
  school: MBASchoolOption | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onCancel: () => void
}

export function SchoolTargetAddDialog({
  school,
  open,
  onOpenChange,
  onSave,
  onCancel
}: SchoolTargetAddDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const createMutation = useCreateSchoolTarget(user?.id || '')

  // Form state
  const [formData, setFormData] = useState({
    target_category: 'target' as 'target' | 'safety' | 'reach',
    program_of_interest: '',
    application_round: '',
    notes: '',
    priority_score: 5,
  })

  const handleSave = async () => {
    if (!school) return

    try {
      await createMutation.mutateAsync({
        school_id: school.id,
        ...formData
      })

      toast({
        title: "School Added! 🎉",
        description: `${school.name} has been added to your target schools.`,
      })

      // Reset form
      setFormData({
        target_category: 'target',
        program_of_interest: '',
        application_round: '',
        notes: '',
        priority_score: 5,
      })

      onSave()
    } catch (error) {
      toast({
        title: "Failed to Add School",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    // Reset form
    setFormData({
      target_category: 'target',
      program_of_interest: '',
      application_round: '',
      notes: '',
      priority_score: 5,
    })
    onCancel()
  }

  if (!school) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Target School</DialogTitle>
          <DialogDescription>
            Set your preferences and details for this school target.
          </DialogDescription>
        </DialogHeader>

        {/* School Info Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-lg truncate">{school.name}</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{school.location}</span>
                {school.country && school.country !== school.location && (
                  <span>, {school.country}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                {school.qs_mba_rank && (
                  <Badge variant="outline" className="text-xs">
                    <Trophy className="h-3 w-3 mr-1" />
                    #{school.qs_mba_rank} QS
                  </Badge>
                )}
                {school.ft_global_mba_rank && (
                  <Badge variant="outline" className="text-xs">
                    #{school.ft_global_mba_rank} FT
                  </Badge>
                )}
              </div>
            </div>
            
            {school.website && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="ml-2"
              >
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Target Category */}
          <div>
            <Label className="text-base font-medium">Target Category</Label>
            <Select 
              value={formData.target_category} 
              onValueChange={(value: 'target' | 'safety' | 'reach') => 
                setFormData(prev => ({ ...prev, target_category: value }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">🛡️ Safety School</SelectItem>
                <SelectItem value="target">🎯 Target School</SelectItem>
                <SelectItem value="reach">🚀 Reach School</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.target_category === 'safety' && 'Schools where admission is likely based on your profile'}
              {formData.target_category === 'target' && 'Schools that match well with your profile and goals'}
              {formData.target_category === 'reach' && 'Aspirational schools that would be challenging to get into'}
            </p>
          </div>

          {/* Priority Score */}
          <div>
            <Label className="text-base font-medium">Priority (1-10)</Label>
            <Select 
              value={formData.priority_score.toString()} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, priority_score: parseInt(value) }))
              }
            >
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

          {/* Application Round */}
          <div>
            <Label className="text-base font-medium">Application Round</Label>
            <Select 
              value={formData.application_round} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, application_round: value }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select application round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No round selected</SelectItem>
                <SelectItem value="R1">Round 1 (Early)</SelectItem>
                <SelectItem value="R2">Round 2 (Regular)</SelectItem>
                <SelectItem value="R3">Round 3 (Late)</SelectItem>
                <SelectItem value="Rolling">Rolling Admission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Program of Interest */}
          <div>
            <Label className="text-base font-medium">Program of Interest</Label>
            <Input
              value={formData.program_of_interest}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, program_of_interest: e.target.value }))
              }
              placeholder="e.g., Full-time MBA, Executive MBA"
              className="mt-2"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-base font-medium">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Why are you interested in this school? Any specific programs or features?"
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={createMutation.isPending}
            className="min-w-[120px]"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Targets
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
