import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileSetupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-1/3" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
