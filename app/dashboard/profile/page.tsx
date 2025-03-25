"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Mail, MapPin, Phone, Save, User } from "lucide-react"

export default function ProfilePage() {
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
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your account settings and profile information</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=96&width=96"
                    alt="Profile picture"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm">
                    Upload new photo
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remove photo
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input id="email" defaultValue="john.doe@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input id="phone" defaultValue="+254 712 345 678" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input id="location" defaultValue="Nairobi, Kenya" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  defaultValue="Senior Software Engineer with 8+ years of experience in web development."
                  rows={4}
                />
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

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Connected Accounts</Label>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Google</p>
                        <p className="text-sm text-muted-foreground">john.doe@gmail.com</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Disconnect
                    </Button>
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

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent resume and application activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Resume Updated</p>
                    <p className="text-sm text-muted-foreground">You updated your "Software Engineer" resume</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Cover Letter Created</p>
                    <p className="text-sm text-muted-foreground">
                      You created a cover letter for "Product Manager at Tech Innovations"
                    </p>
                    <p className="text-xs text-muted-foreground">5 days ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Resume Created</p>
                    <p className="text-sm text-muted-foreground">You created a new "Software Engineer" resume</p>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
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

