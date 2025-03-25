"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CreditCard, Globe, Lock, Mail, Save } from "lucide-react"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)

    // Simulate saving
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <select
                    id="language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <select
                    id="timezone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="EAT">East Africa Time (GMT+3)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                    <option value="EST">Eastern Standard Time (GMT-5)</option>
                  </select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                </div>
                <Switch id="dark-mode" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Usage Analytics</Label>
                  <p className="text-sm text-muted-foreground">Allow us to collect anonymous usage data</p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </h3>

                <div className="space-y-4 ml-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-job-alerts">Job Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications about new job postings</p>
                    </div>
                    <Switch id="email-job-alerts" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-resume-tips">Resume Tips</Label>
                      <p className="text-sm text-muted-foreground">Receive tips to improve your resume</p>
                    </div>
                    <Switch id="email-resume-tips" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-marketing">Marketing</Label>
                      <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                    </div>
                    <Switch id="email-marketing" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  In-App Notifications
                </h3>

                <div className="space-y-4 ml-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-job-alerts">Job Alerts</Label>
                      <p className="text-sm text-muted-foreground">Show notifications for new job postings</p>
                    </div>
                    <Switch id="app-job-alerts" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-resume-tips">Resume Tips</Label>
                      <p className="text-sm text-muted-foreground">Show notifications for resume improvement tips</p>
                    </div>
                    <Switch id="app-resume-tips" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your billing details and subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">Free Plan</h3>
                    <p className="text-sm text-muted-foreground mt-1">Basic features with limited access</p>
                  </div>
                  <Badge variant="outline">Current Plan</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </h3>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">No payment method added yet</p>
                </div>

                <Button variant="outline">Add Payment Method</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Upgrade to Premium</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Monthly</h4>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-bold">KSh 1,500</span>
                      <span className="text-sm text-muted-foreground ml-1">/month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                        Unlimited resumes
                      </li>
                      <li className="flex items-center">
                        <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                        Advanced ATS optimization
                      </li>
                      <li className="flex items-center">
                        <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                        Premium templates
                      </li>
                    </ul>
                    <Button className="mt-4 w-full">Upgrade</Button>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Yearly</h4>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-bold">KSh 15,000</span>
                      <span className="text-sm text-muted-foreground ml-1">/year</span>
                    </div>
                    <div className="mt-1">
                      <Badge variant="secondary">Save 17%</Badge>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                        Unlimited resumes
                      </li>
                      <li className="flex items-center">
                        <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                        Advanced ATS optimization
                      </li>
                      <li className="flex items-center">
                        <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                        Premium templates
                      </li>
                    </ul>
                    <Button className="mt-4 w-full">Upgrade</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <Button>Change Password</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Two-Factor Authentication</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p>Two-factor authentication is not enabled yet</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-destructive">Danger Zone</h3>

                <div className="rounded-lg border border-destructive/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p>Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all your data</p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "destructive" | "outline"
}) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

