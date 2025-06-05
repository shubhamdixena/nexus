import { DashboardLayout } from "@/components/dashboard-layout"
import { ApplicationTimeline } from "@/components/application-timeline"

export default function TimelinePage() {
  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Application Timeline</h1>
        <ApplicationTimeline />
      </div>
    </DashboardLayout>
  )
}
