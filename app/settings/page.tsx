import { SettingsPanel } from "@/components/settings-panel"
import { AdminOnly } from "@/components/permission-guard"

export default function SettingsPage() {
  return (
    <AdminOnly>
      <SettingsPanel />
    </AdminOnly>
  )
}
