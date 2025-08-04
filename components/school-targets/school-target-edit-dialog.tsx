/**
 * School Target Edit Dialog Component
 * 
 * Form dialog for editing school target details with proper validation
 */

'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Save } from 'lucide-react'
import { SchoolTarget } from '@/types/school-targets'
import { useUpdateSchoolTarget } from '@/lib/school-targets-api'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'

interface SchoolTargetEditDialogProps {
  target: SchoolTarget
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedTarget: SchoolTarget) => void
}

export function SchoolTargetEditDialog({
  target,
  open,
  onOpenChange,
  onSave
}: SchoolTargetEditDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const updateMutation = useUpdateSchoolTarget(user?.id || '')

  // Form state
  const [formData, setFormData] = useState({
    target_category: target.target_category,
    program_of_interest: target.program_of_interest || '',
    application_round: target.application_round || '',
    notes: target.notes || '',
    priority_score: target.priority_score,
  })

  // Reset form when target changes
  useEffect(() => {
    setFormData({
      target_category: target.target_category,
      program_of_interest: target.program_of_interest || '',
      application_round: target.application_round || '',
      notes: target.notes || '',
      priority_score: target.priority_score,
    })
  }, [target])

  const handleSave = async () => {
    try {
      const result = await updateMutation.mutateAsync({
        id: target.id,
        ...formData
      })

      toast({
        title: "Target Updated! ✅",
        description: `${target.school_name} has been updated successfully.`,
      })

      onSave(result.target)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update target",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      target_category: target.target_category,
      program_of_interest: target.program_of_interest || '',
      application_round: target.application_round || '',
      notes: target.notes || '',
      priority_score: target.priority_score,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Target School</DialogTitle>
          <DialogDescription>
            Update your preferences and details for this school.
          </DialogDescription>
        </DialogHeader>

        {/* School Info Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-medium text-lg">{target.school_name}</h4>
          <p className="text-sm text-muted-foreground">{target.location}</p>
          {target.qs_mba_rank && (
            <Badge variant="outline" className="text-xs mt-2">
              #{target.qs_mba_rank} QS Ranking
            </Badge>
          )}
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
              placeholder="Any additional notes about this school..."
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
            disabled={updateMutation.isPending}
            className="min-w-[100px]"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
