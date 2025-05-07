"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  PenTool,
  FileCheck,
  Briefcase,
  Clock,
  Plus,
  Download,
  Users,
  TrendingUp,
  MessageSquare,
  Loader2,
  Activity,
} from "lucide-react"
import { getActivityTimeline } from "@/lib/analytics"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const { user } = useUser()
  const { toast } = useToast()
  const [recentResumes, setRecentResumes] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalCoverLetters: 0,
    totalApplications: 0,
    completionRate: 0,
  })
  const [recentJobs, setRecentJobs] = useState([
    {
      id: 1,
      title: "Software Engineer",
      company: "Tech Innovations Ltd",
      location: "Nairobi, Kenya",
      salary: "KSh 120,000 - 180,000",
      posted: "2 days ago",
    },
    {
      id: 2,
      title: "Marketing Manager",
      company: "Global Marketing Solutions",
      location: "Mombasa, Kenya",
      salary: "KSh 100,000 - 150,000",
      posted: "3 days ago",
    },
    {
      id: 3,
      title: "Financial Analyst",
      company: "East African Bank",
      location: "Nairobi, Kenya",
      salary: "KSh 90,000 - 130,000",
      posted: "1 week ago",
    },
  ])

  useEffect(() => {
    async function fetchData() {
      try {
        if (!user) {
          console.log("No user found, waiting for user data...")
          setLoading(false)
          return
        }

        console.log("Fetching data for user:", user.id)
        setLoading(true)

        // Fetch recent resumes with error handling
        try {
          const { data: resumeData, error: resumeError } = await supabase
            .from("resumes")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(3)

          if (resumeError) {
            console.error("Error fetching resumes:", resumeError)
            toast({
              variant: "destructive",
              title: "Error fetching resumes",
              description: "Please try refreshing the page.",
            })
          } else {
            console.log("Fetched resumes:", resumeData)
            setRecentResumes(resumeData || [])
          }
        } catch (error) {
          console.error("Network error fetching resumes:", error)
        }

        // Fetch activity timeline with error handling
        try {
          const activityData = await getActivityTimeline(user.id, 5)
          setRecentActivity(activityData || [])
        } catch (error) {
          console.error("Error fetching activity timeline:", error)
        }

        // Fetch stats with error handling
        try {
          const { data: resumeCount, error: resumeCountError } = await supabase
            .from("resumes")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)

          if (resumeCountError) {
            console.error("Error fetching resume count:", resumeCountError)
          }

          const { data: coverLetterCount, error: coverLetterCountError } = await supabase
            .from("cover_letters")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)

          if (coverLetterCountError) {
            console.error("Error fetching cover letter count:", coverLetterCountError)
          }

          const { data: applicationCount, error: applicationCountError } = await supabase
            .from("job_applications")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)

          if (applicationCountError) {
            console.error("Error fetching application count:", applicationCountError)
          }

          setStats({
            totalResumes: resumeCount?.length || 0,
            totalCoverLetters: coverLetterCount?.length || 0,
            totalApplications: applicationCount?.length || 0,
            completionRate: Math.min(100, ((resumeCount?.length || 0) / 5) * 100), // Assuming 5 resumes is "complete"
          })
        } catch (error) {
          console.error("Network error fetching stats:", error)
        }
      } catch (error) {
        console.error("Error in dashboard fetchData:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get activity icon based on type
  const getActivityIcon = (type, action) => {
    switch (type) {
      case "resume":
        return action === "create" ? <FileText className="h-4 w-4" /> : <Download className="h-4 w-4" />
      case "cover_letter":
        return <PenTool className="h-4 w-4" />
      case "job_application":
        return <Briefcase className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Get activity description
  const getActivityDescription = (activity) => {
    const { entity_type, action, entity_id } = activity

    switch (entity_type) {
      case "resume":
        return action === "create"
          ? "Created a new resume"
          : action === "update"
            ? "Updated resume"
            : action === "download"
              ? "Downloaded resume"
              : "Viewed resume"
      case "cover_letter":
        return action === "create"
          ? "Created a new cover letter"
          : action === "update"
            ? "Updated cover letter"
            : "Viewed cover letter"
      case "job_application":
        return action === "create" ? "Applied for a job" : "Updated job application"
      default:
        return "Performed an action"
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to your CV Chap Chap dashboard. Get started with our tools below.
              </p>
            </div>
            <Button asChild>
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalResumes}</div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.max(0, stats.totalResumes - 1)} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalCoverLetters}</div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.max(0, stats.totalCoverLetters - 1)} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalApplications}</div>
                    <p className="text-xs text-muted-foreground">
                      +{Math.max(0, stats.totalApplications - 1)} from last month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{Math.round(stats.completionRate)}%</div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <Progress value={stats.completionRate} className="mt-2" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Resume Builder</CardTitle>
                <CardDescription>Create ATS-optimized resumes with our AI-powered builder</CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/resume-builder">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                  <PenTool className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Cover Letter Generator</CardTitle>
                <CardDescription>Generate tailored cover letters for your job applications</CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/cover-letters">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-500">
                  <FileCheck className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">ATS Optimizer</CardTitle>
                <CardDescription>Optimize your resume for Applicant Tracking Systems</CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/ats-optimizer">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-500">
                  <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Job Board</CardTitle>
                <CardDescription>Browse and apply for jobs that match your skills</CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/job-board">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">AI Interview Prep</CardTitle>
                <CardDescription>Practice interviews with AI-generated questions</CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/interview-prep">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-teal-500/10 text-teal-500">
                  <Activity className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Activity Log</CardTitle>
                <CardDescription>Track your recent applications and activity</CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/activity">View Activity</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Resumes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Resumes</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/resume-builder">
                    <Plus className="mr-2 h-4 w-4" />
                    New Resume
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="h-[100px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </Card>
                    ))
                ) : recentResumes.length > 0 ? (
                  recentResumes.map((resume: any) => (
                    <Card key={resume.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg truncate">{resume.title}</CardTitle>
                        <CardDescription>Last updated: {formatDate(resume.updated_at)}</CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/dashboard/resume-builder?id=${resume.id}`}>Edit Resume</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">You haven't created any resumes yet.</p>
                    <Button asChild>
                      <Link href="/dashboard/resume-builder">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Resume
                      </Link>
                    </Button>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Activity Timeline</h2>
                <Button asChild variant="outline" size="sm">
                  <Link href="/activity">View All</Link>
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-4">
                          <div className="mt-1 rounded-full bg-primary/10 p-2">
                            {getActivityIcon(activity.entity_type, activity.action)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent activity</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your activity will appear here as you use the platform
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Job Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Job Listings</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/job-board">View All Jobs</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {recentJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Posted {job.posted}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/job-board/${job.id}`}>View Job</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
