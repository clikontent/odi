"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NotificationsForm() {
  const { userSettings, updateSettings } = useUser()

  const [formData, setFormData] = useState({
    email_notifications: userSettings?.email_notifications ?? true,
    application_updates: userSettings?.application_updates ?? true,
    marketing_emails: userSettings?.marketing_emails ?? false,
    job_alerts: userSettings?.job_alerts ?? true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleToggle = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      await updateSettings(formData)

      setSuccess("Notification preferences updated successfully!")
    } catch (error: any) {
      console.error("Error updating notification preferences:", error)
      setError(error.message || "Failed to update notification preferences. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive notifications and updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email_notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
              </div>
              <Switch
                id="email_notifications"
                checked={formData.email_notifications}
                onCheckedChange={(checked) => handleToggle("email_notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="application_updates" className="font-medium">
                  Application Updates
                </Label>
                <p className="text-sm text-muted-foreground">Receive updates about your job applications</p>
              </div>
              <Switch
                id="application_updates"
                checked={formData.application_updates}
                onCheckedChange={(checked) => handleToggle("application_updates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="job_alerts" className="font-medium">
                  Job Alerts
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications about new job matches</p>
              </div>
              <Switch
                id="job_alerts"
                checked={formData.job_alerts}
                onCheckedChange={(checked) => handleToggle("job_alerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="marketing_emails" className="font-medium">
                  Marketing Emails
                </Label>
                <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
              </div>
              <Switch
                id="marketing_emails"
                checked={formData.marketing_emails}
                onCheckedChange={(checked) => handleToggle("marketing_emails", checked)}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
