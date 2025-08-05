/**
 * School Target Card Component
 * 
 * Displays a single school target with all relevant information and actions.
 * Clean, focused component with proper TypeScript support.
 */

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MapPin, 
  ExternalLink, 
  MoreHorizontal,
  Edit3,
  Trash2
} from 'lucide-react'
import { SchoolTarget, ApplicationStatus } from '@/types/school-targets'
import { SchoolTargetEditDialog } from './school-target-edit-dialog'

interface SchoolTargetCardProps {
  target: SchoolTarget
  onEdit?: (target: SchoolTarget) => void
  onDelete?: (targetId: string) => void
  onUpdateStatus?: (targetId: string, status: ApplicationStatus) => void
  readonly?: boolean
  showApplicationStatus?: boolean
}

// Priority badge component
function PriorityBadge({ score }: { score: number }) {
  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {score}/10
    </Badge>
  )
}

export function SchoolTargetCard({
  target,
  onEdit,
  onDelete,
  onUpdateStatus,
  readonly = false,
  showApplicationStatus = true
}: SchoolTargetCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleDelete = () => {
    if (onDelete && confirm(`Are you sure you want to remove ${target.school_name} from your targets?`)) {
      onDelete(target.id)
    }
  }

  const handleEditComplete = (updatedTarget: SchoolTarget) => {
    setShowEditDialog(false)
    if (onEdit) {
      onEdit(updatedTarget)
    }
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium leading-tight truncate">
                {target.school_name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{target.location}</span>
              </div>
            </div>

            {!readonly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Target
                  </DropdownMenuItem>
                  {target.website && (
                    <DropdownMenuItem asChild>
                      <a
                        href={target.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Target
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Priority and Application Round */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Priority:</span>
                <PriorityBadge score={target.priority_score} />
              </div>
            </div>

            {/* Application Round */}
            {target.application_round && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Round:</span>
                <Badge variant="outline" className="text-xs">
                  {target.application_round}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <SchoolTargetEditDialog
        target={target}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleEditComplete}
      />
    </>
  )
}
