/**
 * School Targets Manager Component
 * 
 * Main container component that orchestrates all school target functionality.
 * This replaces the monolithic EnhancedSchoolSelector with a clean, modular architecture.
 */

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  School,
  Filter,
  SortAsc,
  SortDesc,
  AlertCircle,
  Target,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react'
import { SchoolTarget, SchoolTargetFilters, SchoolTargetSortOptions } from '@/types/school-targets'
import { useSchoolTargets, useSchoolTargetStats } from '@/lib/school-targets-api'
import { useAuth } from '@/components/auth-provider'
import { SchoolTargetCard } from './school-target-card'
import { SchoolSearch } from './school-search'

interface SchoolTargetsManagerProps {
  maxTargets?: number
  allowedCategories?: Array<'target' | 'safety' | 'reach'>
  readonly?: boolean
  showStats?: boolean
}

export function SchoolTargetsManager({
  maxTargets = 20,
  allowedCategories = ['target', 'safety', 'reach'],
  readonly = false,
  showStats = true
}: SchoolTargetsManagerProps) {
  const { user } = useAuth()
  const userId = user?.id || ''

  // State for filtering and sorting
  const [filters, setFilters] = useState<SchoolTargetFilters>({})
  const [sortBy, setSortBy] = useState<SchoolTargetSortOptions>({
    field: 'priority_score',
    direction: 'desc'
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Data fetching
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useSchoolTargets(userId, filters, { enabled: !!userId })

  const stats = useSchoolTargetStats(userId)

  const targets = data?.targets || []

  // Client-side filtering and sorting
  const filteredAndSortedTargets = targets
    .filter((target: SchoolTarget) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        return (
          target.school_name.toLowerCase().includes(search) ||
          target.location.toLowerCase().includes(search) ||
          target.program_of_interest?.toLowerCase().includes(search) ||
          target.notes?.toLowerCase().includes(search)
        )
      }
      return true
    })
    .sort((a: SchoolTarget, b: SchoolTarget) => {
      const { field, direction } = sortBy
      let aVal: any, bVal: any

      switch (field) {
        case 'priority_score':
          aVal = a.priority_score
          bVal = b.priority_score
          break
        case 'deadline':
          aVal = a.days_until_deadline ?? 999
          bVal = b.days_until_deadline ?? 999
          break
        case 'school_name':
          aVal = a.school_name
          bVal = b.school_name
          break
        case 'ranking':
          aVal = a.qs_mba_rank ?? 999
          bVal = b.qs_mba_rank ?? 999
          break
        case 'created_at':
          aVal = new Date(a.created_at)
          bVal = new Date(b.created_at)
          break
        default:
          return 0
      }

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  const existingSchoolIds = targets.map((target: SchoolTarget) => target.school_id)

  // Event handlers
  const handleFilterChange = (key: keyof SchoolTargetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSortChange = (field: SchoolTargetSortOptions['field']) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const handleSchoolAdded = () => {
    refetch()
  }

  const handleTargetUpdated = () => {
    refetch()
  }

  const handleTargetDeleted = () => {
    refetch()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h4 className="font-semibold text-red-900">Unable to Load School Targets</h4>
            <p className="text-sm text-red-700">{error.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">

      {/* Filters and Search */}
      {targets.length > 0 && (
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select
            value={`${sortBy.field}-${sortBy.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split('-') as [SchoolTargetSortOptions['field'], 'asc' | 'desc']
              setSortBy({ field, direction })
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority_score-desc">Priority (High to Low)</SelectItem>
              <SelectItem value="priority_score-asc">Priority (Low to High)</SelectItem>
              <SelectItem value="deadline-asc">Deadline (Soonest First)</SelectItem>
              <SelectItem value="school_name-asc">School Name (A-Z)</SelectItem>
              <SelectItem value="ranking-asc">Ranking (Best First)</SelectItem>
              <SelectItem value="created_at-desc">Recently Added</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* School Targets Grid or Empty State */}
      {targets.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <School className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">No schools selected yet</h4>
          <p className="text-muted-foreground mb-4 text-sm">
            Start building your target school list to track application deadlines.
          </p>
          {!readonly && (
            <SchoolSearch
              existingSchoolIds={existingSchoolIds}
              onSchoolAdded={handleSchoolAdded}
            />
          )}
        </Card>
      ) : (
        <>
          {/* Schools Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedTargets.map((target: SchoolTarget) => (
              <SchoolTargetCard
                key={target.id}
                target={target}
                onEdit={handleTargetUpdated}
                onDelete={handleTargetDeleted}
                readonly={readonly}
                showApplicationStatus={false}
              />
            ))}
          </div>

          {/* Add Another School */}
          {!readonly && targets.length < maxTargets && (
            <SchoolSearch
              existingSchoolIds={existingSchoolIds}
              onSchoolAdded={handleSchoolAdded}
            />
          )}
        </>
      )}
    </div>
  )
}
