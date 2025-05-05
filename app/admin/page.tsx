"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  FileText,
  PenTool,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  FileUp,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    totalCoverLetters: 0,
    newUsersToday: 0,
    newResumesToday: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // In a real app, you would check if the user has admin role
          // For demo purposes, we'll just set isAdmin to true
          setIsAdmin(true)

          // Fetch mock stats
          setStats({
            totalUsers: 1254,
            totalResumes: 3782,
            totalCoverLetters: 2195,
            newUsersToday: 24,
            newResumesToday: 87,
          })

          // Fetch mock recent users
          setRecentUsers([
            { id: 1, name: "John Doe", email: "john@example.com", joined: "2023-05-15", resumes: 5, coverLetters: 3 },
            { id: 2, name: "Jane Smith", email: "jane@example.com", joined: "2023-05-16", resumes: 2, coverLetters: 1 },
            {
              id: 3,
              name: "Robert Johnson",
              email: "robert@example.com",
              joined: "2023-05-17",
              resumes: 8,
              coverLetters: 4,
            },
            {
              id: 4,
              name: "Emily Davis",
              email: "emily@example.com",
              joined: "2023-05-18",
              resumes: 3,
              coverLetters: 2,
            },
            {
              id: 5,
              name: "Michael Wilson",
              email: "michael@example.com",
              joined: "2023-05-19",
              resumes: 1,
              coverLetters: 0,
            },
          ])
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <Button className="mt-4" asChild>
          <a href="/dashboard">Return to Dashboard</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-bold">ResumeAI Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-background pl-8 md:w-[200px] lg:w-[300px]"
              />
            </div>
            <Button asChild variant="outline">
              <a href="/dashboard">Exit Admin</a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, content, and platform settings</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4" />+{stats.newUsersToday} today
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalResumes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4" />+{stats.newResumesToday} today
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
                <PenTool className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCoverLetters.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    +42 today
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">578</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500 flex items-center">
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                    -2% from last week
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <FileUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28.4 GB</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    +0.8 GB this week
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage user accounts and permissions</CardDescription>
                    </div>
                    <Button>Add User</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Resumes</TableHead>
                        <TableHead>Cover Letters</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.joined).toLocaleDateString()}</TableCell>
                          <TableCell>{user.resumes}</TableCell>
                          <TableCell>{user.coverLetters}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>Manage resume templates, cover letter templates, and other content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resume Templates</CardTitle>
                        <CardDescription>Manage available resume templates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>12 active templates</p>
                      </CardContent>
                      <div className="p-4 pt-0">
                        <Button variant="outline" className="w-full">
                          Manage Templates
                        </Button>
                      </div>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Cover Letter Templates</CardTitle>
                        <CardDescription>Manage cover letter templates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>8 active templates</p>
                      </CardContent>
                      <div className="p-4 pt-0">
                        <Button variant="outline" className="w-full">
                          Manage Templates
                        </Button>
                      </div>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Job Board</CardTitle>
                        <CardDescription>Manage job listings and categories</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>156 active job listings</p>
                      </CardContent>
                      <div className="p-4 pt-0">
                        <Button variant="outline" className="w-full">
                          Manage Jobs
                        </Button>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>View usage statistics and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-muted rounded-md">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="mt-2 font-medium">Analytics Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Detailed analytics would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure global platform settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input id="siteName" defaultValue="ResumeAI" />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Input
                        id="siteDescription"
                        defaultValue="AI-powered resume builder and job application platform"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input id="supportEmail" defaultValue="support@resumeai.com" />
                    </div>
                    <div className="flex justify-end">
                      <Button>Save Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}
