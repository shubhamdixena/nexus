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
  Trash2,
  Calendar,
  Target,
  Users,
  DollarSign,
  Trophy
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
  const getStyle = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-200'
    if (score >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getLabel = (score: number) => {
    if (score >= 8) return '🔥 High Priority'
    if (score >= 6) return '⭐ Medium Priority'
    return '📌 Low Priority'
  }

  return (
    <Badge variant="outline" className={`text-xs ${getStyle(score)}`}>
      {score}/10 · {getLabel(score)}
    </Badge>
  )
}

// Category badge component
function CategoryBadge({ category }: { category: 'target' | 'safety' | 'reach' }) {
  const getStyle = (category: string) => {
    switch (category) {
      case 'safety': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reach': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getIcon = (category: string) => {
    switch (category) {
      case 'safety': return '🛡️'
      case 'reach': return '🚀'
      default: return '🎯'
    }
  }

  return (
    <Badge variant="outline" className={`text-xs ${getStyle(category)}`}>
      {getIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  )
}

// Deadline badge component
function DeadlineBadge({ deadline, daysUntil }: { deadline?: string; daysUntil?: number }) {
  if (!deadline || daysUntil === undefined) {
    return <Badge variant="outline" className="text-xs">No deadline set</Badge>
  }

  const getUrgencyStyle = (days: number) => {
    if (days < 0) return 'bg-red-100 text-red-800 border-red-200'
    if (days <= 7) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (days <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getLabel = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d overdue`
    if (days === 0) return 'Due today'
    return `${days}d left`
  }

  return (
    <Badge variant="outline" className={`text-xs ${getUrgencyStyle(daysUntil)}`}>
      <Calendar className="h-3 w-3 mr-1" />
      {getLabel(daysUntil)}
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
      <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative">
        {/* Priority Badge - Positioned absolutely */}
        <div className="absolute -top-2 -left-2 z-10">
          <Badge className="h-8 w-8 rounded-full p-0 flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
            {target.priority_score}
          </Badge>
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-3">
            {/* Header with school name and actions */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold leading-tight truncate">
                  {target.school_name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{target.location}</span>
                  {target.country && target.country !== target.location && (
                    <span>, {target.country}</span>
                  )}
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

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={target.target_category} />
              <PriorityBadge score={target.priority_score} />
              <DeadlineBadge deadline={target.deadline} daysUntil={target.days_until_deadline} />
              
              {target.qs_mba_rank && (
                <Badge variant="outline" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  #{target.qs_mba_rank} QS Ranking
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Application Round */}
            {target.application_round && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Round:</span>{' '}
                <span>{target.application_round}</span>
              </div>
            )}

            {/* Program of Interest */}
            {target.program_of_interest && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Program:</span>{' '}
                <span>{target.program_of_interest}</span>
              </div>
            )}

            {/* School Stats Row */}
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              {target.class_size && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{target.class_size} students</span>
                </div>
              )}
              
              {target.avg_starting_salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{target.avg_starting_salary}</span>
                </div>
              )}
              
              {target.mean_gmat && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>GMAT {target.mean_gmat}</span>
                </div>
              )}
              
              {target.tuition_total && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{target.tuition_total} tuition</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {target.notes && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Notes:</span>{' '}
                <span className="text-sm">{target.notes}</span>
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
