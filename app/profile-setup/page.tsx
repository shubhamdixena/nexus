import { DashboardLayout } from "@/components/dashboard-layout"
import { redirect } from "next/navigation"

export default function ProfileSetupPage() {
  // Redirect to main profile page since we now use modal
  redirect("/profile")
}