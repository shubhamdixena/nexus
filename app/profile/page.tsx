import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfileView } from "@/components/profile-view"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile information to get personalized recommendations and opportunities.
          </p>
        </div>
        <ProfileView />
      </div>
    </DashboardLayout>
  )
}
