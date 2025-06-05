"use client"
import { MapPin } from "lucide-react"

export function UniversityMap() {
  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border bg-muted">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Interactive university map view</p>
          <p className="text-xs text-muted-foreground">
            (Map visualization would be implemented here with a mapping library like Mapbox or Google Maps)
          </p>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="flex items-center rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
          <div className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></div>
          Top 10
        </div>
        <div className="flex items-center rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
          <div className="mr-1.5 h-2 w-2 rounded-full bg-blue-500"></div>
          Top 50
        </div>
        <div className="flex items-center rounded-md bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
          <div className="mr-1.5 h-2 w-2 rounded-full bg-orange-500"></div>
          Top 100
        </div>
      </div>
    </div>
  )
}
