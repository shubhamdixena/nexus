"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export function NotificationsSettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Manage your email notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="application-updates">Application Updates</Label>
              <p className="text-sm text-muted-foreground">Receive emails about your application status changes.</p>
            </div>
            <Switch id="application-updates" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="deadline-reminders">Deadline Reminders</Label>
              <p className="text-sm text-muted-foreground">Get notified about upcoming application deadlines.</p>
            </div>
            <Switch id="deadline-reminders" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-scholarships">New Scholarships</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about new scholarship opportunities.
              </p>
            </div>
            <Switch id="new-scholarships" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters.</p>
            </div>
            <Switch id="marketing-emails" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
