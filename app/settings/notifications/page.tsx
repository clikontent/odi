"use client"

import { NotificationsForm } from "@/components/settings/notifications-form"

export default function NotificationsSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">Manage how you receive notifications and updates</p>
        </div>

        <NotificationsForm />
      </div>
    </div>
  )
}
