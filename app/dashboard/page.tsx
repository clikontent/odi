"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  PenTool,
  FileCheck,
  Briefcase,
  BarChart,
  Clock,
  Plus,
  Download,
  Users,
  TrendingUp,
} from "lucide-react"
import { getActivityTimeline } from "@/lib/analytics"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
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
      // Add this at the top of your useEffect
      const controller = new AbortController()
      const { signal } = controller
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Optimize your Supabase queries by selecting only needed fields
          const { data: resumeData, error: resumeError } = await supabase
            .from("resumes")
            .select("id, title, updated_at") // Only select fields you need
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(3)
            .abortSignal(signal) // Add abort signal for cleanup

          if (resumeError) throw resumeError
          setRecentResumes(resumeData || [])

          // Fetch activity timeline
          const activityData = await getActivityTimeline(user.id, 5)
          setRecentActivity(activityData || [])

          // Fetch stats
          const { data: resumeCount, error: resumeCountError } = await supabase
            .from("resumes")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)

          const { data: coverLetterCount, error: coverLetterCountError } = await supabase
            .from("cover_letters")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)

          const { data: applicationCount, error: applicationCountError } = await supabase
            .from("job_applications")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)

          setStats({
            totalResumes: resumeCount?.length || 0,
            totalCoverLetters: coverLetterCount?.length || 0,
            totalApplications: applicationCount?.length || 0,
            completionRate: Math.min(100, ((resumeCount?.length || 0) / 5) * 100), // Assuming 5 resumes is "complete"
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Add this to your useEffect cleanup
    return () => {
      controller.abort()
    }
  }, [])

  const features = [
    {
      title: "Resume Builder",
      description: "Create ATS-optimized resumes with our AI-powered builder",
      icon: FileText,
      href: "/dashboard/resume-templates",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Cover Letter Generator",
      description: "Generate tailored cover letters based on job descriptions",
      icon: PenTool,
      href: "/dashboard/cover-letters",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "ATS Optimizer",
      description: "Analyze and optimize your resume for ATS systems",
      icon: FileCheck,
      href: "/dashboard/ats-optimizer",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Job Board",
      description: "Find and apply to jobs with your optimized materials",
      icon: Briefcase,
      href: "/dashboard/job-board",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "CV Assessment",
      description: "Get your CV scored and receive improvement suggestions",
      icon: BarChart,
      href: "/dashboard/cv-assessment",
      color: "bg-pink-500/10 text-pink-500",
    },
    {
      title: "Recent Activity",
      description: "View your recent applications and activity",
      icon: Clock,
      href: "/dashboard/activity",
      color: "bg-teal-500/10 text-teal-500",
    },
  ]

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your ResumeAI dashboard. Get started with our tools below.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalResumes}</div>
                <p className="text-xs text-muted-foreground">+{Math.max(0, stats.totalResumes - 1)} from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCoverLetters}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.max(0, stats.totalCoverLetters - 1)} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.max(0, stats.totalApplications - 1)} from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{Math.round(stats.completionRate)}%</div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <Progress value={stats.completionRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="overflow-hidden">
                <CardHeader className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardFooter className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <Link href={feature.href}>Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      </Card>
                    ))
                ) : recentResumes.length > 0 ? (
                  recentResumes.map((resume: any) => (
                    <Card key={resume.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg truncate">{resume.title}</CardTitle>
                        <CardDescription>
                          Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="p-4 pt-0">
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/dashboard/resume-builder/${resume.id}`}>Edit Resume</Link>
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
                  <Link href="/dashboard/activity">View All</Link>
                </Button>
              </div>

              <Card>
                <CardContent className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
