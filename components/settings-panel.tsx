"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPanel } from "./admin-panel"
import { usePermissions } from "@/hooks/use-permissions"

export function SettingsPanel() {
  const { isAdmin, loading } = usePermissions()

  if (loading) {
    return <div className="animate-pulse bg-muted h-96 w-full rounded" />
  }

  // If not admin, show access denied message
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Settings are currently available only to administrators. 
              User settings will be available in a future update.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              For assistance, please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Manage system settings and administrative functions.</p>
      </div>

      <AdminPanel />
    </div>
  )
}
