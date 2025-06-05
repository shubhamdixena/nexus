"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPanel } from "./admin-panel"
import { usePermissions } from "@/hooks/use-permissions"

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("account")
  const { isAdmin, loading } = usePermissions()

  if (loading) {
    return <div className="animate-pulse bg-muted h-96 w-full rounded" />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Account settings will be implemented in a future phase.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences and authentication methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Security settings will be implemented in a future phase.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Notification settings will be implemented in a future phase.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
