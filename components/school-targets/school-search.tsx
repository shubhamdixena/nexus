/**
 * School Search Component
 * 
 * Searchable dropdown for finding and selecting schools to add as targets
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  MapPin, 
  Trophy,
  Loader2,
  Building2,
  Globe
} from 'lucide-react'
import { MBASchoolOption } from '@/types/school-targets'
import { useSchools } from '@/lib/school-targets-api'
import { SchoolTargetAddDialog } from './school-target-add-dialog'

interface SchoolSearchProps {
  existingSchoolIds: string[]
  onSchoolAdded?: () => void
  disabled?: boolean
}

export function SchoolSearch({ 
  existingSchoolIds, 
  onSchoolAdded, 
  disabled = false 
}: SchoolSearchProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<MBASchoolOption | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const { data: schools = [], isLoading, error } = useSchools(searchTerm)

  // Filter out already selected schools
  const availableSchools = (schools || []).filter(
    (school: MBASchoolOption) => !existingSchoolIds.includes(school.id)
  )

  const handleSchoolSelect = (school: MBASchoolOption) => {
    setSelectedSchool(school)
    setSearchOpen(false)
    setAddDialogOpen(true)
  }

  const handleSchoolAdded = () => {
    setSelectedSchool(null)
    setAddDialogOpen(false)
    setSearchTerm('')
    onSchoolAdded?.()
  }

  const handleCancel = () => {
    setSelectedSchool(null)
    setAddDialogOpen(false)
  }

  return (
    <>
      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setSearchOpen(true)}
            variant="outline"
            className="w-full border-dashed"
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add School to Targets
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Business Schools
            </DialogTitle>
            <DialogDescription>
              Find and add schools to your target list. Search by name, location, or ranking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <Command className="rounded-lg border" shouldFilter={false}>
              <CommandInput 
                placeholder="Search schools by name or location..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandEmpty>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching schools...
                  </div>
                ) : error ? (
                  <div className="text-center py-6">
                    <p className="text-red-600">Error loading schools</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                  </div>
                ) : searchTerm.length < 2 ? (
                  <div className="text-center py-6">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Type at least 2 characters to search</p>
                  </div>
                ) : availableSchools.length === 0 ? (
                  <div className="text-center py-6">
                    <p>No schools found matching your search.</p>
                    {existingSchoolIds.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Some schools may already be in your targets.
                      </p>
                    )}
                  </div>
                ) : null}
              </CommandEmpty>
              
              <CommandList className="max-h-[400px]">
                <CommandGroup>
                  {availableSchools.map((school: MBASchoolOption) => (
                    <CommandItem
                      key={school.id}
                      onSelect={() => handleSchoolSelect(school)}
                      className="cursor-pointer p-4 border-b last:border-b-0"
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-base truncate">
                            {school.name}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{school.location}</span>
                            {school.country && school.country !== school.location && (
                              <span>, {school.country}</span>
                            )}
                          </div>
                          
                          {/* Additional Info Row */}
                          <div className="flex items-center gap-3 mt-2">
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
                            {school.website && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Website
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {school.qs_mba_rank && (
                          <div className="ml-4 text-right">
                            <div className="text-lg font-semibold text-primary">
                              #{school.qs_mba_rank}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              QS Ranking
                            </div>
                          </div>
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

      {/* Add Dialog */}
      <SchoolTargetAddDialog
        school={selectedSchool}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSchoolAdded}
        onCancel={handleCancel}
      />
    </>
  )
}
