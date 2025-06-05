import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <Skeleton className="h-12 w-64 mb-6" />
      <Skeleton className="h-8 w-full max-w-md mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
