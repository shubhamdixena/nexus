// Prevent static generation
export const dynamic = "force-dynamic"

"use client"

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from 'lucide-react'
import { DashboardLayout } from "@/components/dashboard-layout"
import { MBASchoolComparison } from '@/components/mba-school-comparison'

function ComparisonContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const schoolsParam = searchParams.get('schools')
  
  if (!schoolsParam) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No Schools Selected</h1>
          <p className="text-muted-foreground mb-6">
            Please select schools to compare from the MBA Schools Explorer.
          </p>
          <Button onClick={() => router.push('/mba-schools')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to MBA Schools
          </Button>
        </div>
      </div>
    )
  }

  const schoolIds = schoolsParam.split(',').filter(id => id.trim() !== '')
  
  if (schoolIds.length !== 2) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Invalid Selection</h1>
          <p className="text-muted-foreground mb-6">
            Please select exactly 2 schools to compare.
          </p>
          <Button onClick={() => router.push('/mba-schools')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to MBA Schools
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <MBASchoolComparison schoolIds={schoolIds} />
    </div>
  )
}

function LoadingFallback() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading comparison...</p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function ComparePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<LoadingFallback />}>
        <ComparisonContent />
      </Suspense>
    </DashboardLayout>
  )
}