import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Search and filters skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* University cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-8" />
                  </div>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center mt-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  )
}
