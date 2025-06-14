import { DashboardLayout } from "@/components/dashboard-layout"
import { ComprehensiveProfileSetup } from "@/components/comprehensive-profile-setup"

export default function ProfileSetupPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Fill out your profile information to get personalized recommendations and opportunities.
          </p>
        </div>
        <ComprehensiveProfileSetup />
      </div>
    </DashboardLayout>
  )
}