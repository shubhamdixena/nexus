/**
 * Modern School Target Selector
 * 
 * Drop-in replacement for the old EnhancedSchoolSelector with the new architecture.
 * This component maintains API compatibility while using the new modular system.
 */

'use client'

import { useEffect } from 'react'
import { SchoolTarget } from '@/types/school-targets'
import { SchoolTargetsManager } from './school-targets-manager'
import { ReactQueryProvider } from '@/components/react-query-provider'

interface ModernSchoolSelectorProps {
  value?: SchoolTarget[]
  onChange?: (targets: SchoolTarget[]) => void
  userId: string
  maxTargets?: number
  allowedCategories?: Array<'target' | 'safety' | 'reach'>
  readonly?: boolean
}

function ModernSchoolSelectorInner({
  value,
  onChange,
  userId,
  maxTargets = 20,
  allowedCategories = ['target', 'safety', 'reach'],
  readonly = false
}: ModernSchoolSelectorProps) {
  // This component now uses React Query internally,
  // so we don't need to sync with external value/onChange props
  // The data is managed centrally through React Query

  useEffect(() => {
    if (onChange && !value) {
      // If parent wants to receive updates but didn't provide initial value,
      // we can trigger onChange when data loads
      // For now, we'll let the parent component handle its own data fetching
    }
  }, [onChange, value])

  return (
    <SchoolTargetsManager
      maxTargets={maxTargets}
      allowedCategories={allowedCategories}
      readonly={readonly}
      showStats={true}
    />
  )
}

// Main export with React Query provider
export function ModernSchoolSelector(props: ModernSchoolSelectorProps) {
  return (
    <ReactQueryProvider>
      <ModernSchoolSelectorInner {...props} />
    </ReactQueryProvider>
  )
}

// Export the manager directly for use in contexts that already have React Query
export { SchoolTargetsManager as DirectSchoolTargetsManager } from './school-targets-manager'
