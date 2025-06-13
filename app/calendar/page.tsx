// Prevent static generation
export const dynamic = "force-dynamic"

import { DashboardLayout } from "@/components/dashboard-layout"
import { NexusCalendarDB } from "@/components/nexus-calendar-db"
import { ImportantDatesListDB } from "@/components/important-dates-list-db"

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <NexusCalendarDB />
          </div>
          <div className="xl:col-span-1">
            <ImportantDatesListDB />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 