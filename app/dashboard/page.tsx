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
  Clock,
  Plus,
  Download,
  Users,
  TrendingUp,
  MessageSquare,
  Loader2,
  Activity,
  Lock,
  Crown,
} from "lucide-react"
import { getActivityTimeline } from "@/lib/analytics"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const { user, profile, userStats, loading, canUseFeature } = useUser()
  const { toast } = useToast()
  const [recentResumes, setRecentResumes] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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

  // Determine subscription tier
  const isPremium = profile?.subscription_tier === "premium"
  const isCorporate = profile?.subscription_tier === "corporate"
  const isFree = !isPremium && !isCorporate

  useEffect(() => {
    async function fetchData() {
      try {
        if (!user) {
          console.log("No user found, waiting for user data...")
          setIsLoading(false)
          return
        }

        console.log("Fetching data for user:", user.id)
        setIsLoading(true)

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
        setIsLoading(false)
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

  const handleUpgradeClick = () => {
    toast({
      title: "Upgrade Required",
      description: "This feature is only available on Premium and Corporate plans.",
    })
  }

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      </DashboardLayout>
    )
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
            {isFree && (
              <Button asChild>
                <Link href="/pricing">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Link>
              </Button>
            )}
          </div>

          {/* Subscription Banner for Free Users */}
          {isFree && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">You're on the Free Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Your usage: </span>
                      Cover Letters: {userStats?.coverLettersUsed || 0}/5 | Resume Downloads:{" "}
                      {userStats?.resumeDownloadsUsed || 0}/1
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upgrade to Premium for unlimited cover letters, full ATS optimization, and more.
                    </p>
                  </div>
                  <Button asChild className="w-full md:w-auto">
                    <Link href="/pricing">View Plans</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Premium User Banner */}
          {isPremium && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Premium Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Your usage: </span>
                      Resume Downloads: {userStats?.resumeDownloadsUsed || 0}/10
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enjoy unlimited cover letters, full ATS optimization, and premium features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Corporate User Banner */}
          {isCorporate && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Corporate Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Enjoy all premium features plus bulk hiring tools, AI candidate matching, and more.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
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
            {/* Resume Builder Card */}
            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Resume Builder</CardTitle>
                <CardDescription>
                  Create ATS-optimized resumes with our AI-powered builder
                  {isFree && (
                    <span className="block mt-1 text-xs">
                      Free Plan: {userStats?.resumeDownloadsUsed || 0}/1 downloads used
                    </span>
                  )}
                  {isPremium && (
                    <span className="block mt-1 text-xs">
                      Premium Plan: {userStats?.resumeDownloadsUsed || 0}/10 downloads used
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/resume-builder">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Cover Letter Generator Card */}
            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500">
                  <PenTool className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Cover Letter Generator</CardTitle>
                <CardDescription>
                  {isFree
                    ? `Generate tailored cover letters (${userStats?.coverLettersUsed || 0}/5 used)`
                    : "Generate unlimited tailored cover letters"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/cover-letters">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* ATS Optimizer Card */}
            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-500">
                  <FileCheck className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">ATS Optimizer</CardTitle>
                <CardDescription>
                  {isFree
                    ? "Basic ATS score without detailed fixes"
                    : "Full ATS optimization with detailed recommendations"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/ats-optimizer">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Job Board Card */}
            <Card>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-500">
                  <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle className="mt-4">Job Board</CardTitle>
                <CardDescription>
                  {isFree ? "Browse jobs in read-only mode" : "Save jobs, get alerts, and apply directly"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/dashboard/job-board">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* AI Interview Prep Card */}
            <Card className={isFree ? "opacity-80" : ""}>
              <CardHeader className="p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="mt-4">AI Interview Prep</CardTitle>
                  {isFree && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full mt-4">Premium</span>
                  )}
                </div>
                <CardDescription>Practice interviews with AI-generated questions</CardDescription>
              </CardHeader>
              <CardFooter className="p-6 pt-0">
                {isFree ? (
                  <Button variant="outline" className="w-full" onClick={handleUpgradeClick}>
                    <Lock className="mr-2 h-4 w-4" />
                    Upgrade to Access
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/dashboard/interview-prep">Get Started</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Activity Log Card */}
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
                {isLoading ? (
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

            {/* AI Interview Prep Tool */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">AI Interview Prep</h2>
                {!isFree && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/interview-prep">View All</Link>
                  </Button>
                )}
              </div>

              <Card>
                <CardContent className="p-4">
                  {isFree ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Premium Feature</h3>
                      <p className="text-sm text-muted-foreground mb-4 max-w-md">
                        Upgrade to Premium to access AI Interview Prep and practice with personalized interview
                        questions.
                      </p>
                      <Button asChild>
                        <Link href="/pricing">Upgrade Now</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        Practice your interview skills with AI-generated questions tailored to your industry and role.
                      </p>
                      <div className="space-y-3">
                        <div className="rounded-lg border p-3">
                          <p className="font-medium">Tell me about yourself</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Common opener for software developer interviews
                          </p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="font-medium">What are your greatest strengths?</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Focus on skills relevant to the job description
                          </p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="font-medium">Why do you want to work for this company?</p>
                          <p className="text-sm text-muted-foreground mt-1">Research the company before answering</p>
                        </div>
                      </div>
                      <Button asChild className="w-full">
                        <Link href="/dashboard/interview-prep">Start Practice Session</Link>
                      </Button>
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
