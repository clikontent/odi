"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Users,
  FileText,
  Plus,
  Search,
  Eye,
  Download,
  Trash2,
  Edit,
  BarChart2,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"

export default function CorporateDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewsScheduled: 0,
    offersSent: 0,
    hiringRate: 0,
    averageTimeToHire: 0,
  })
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  // New job form state
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "",
    type: "Full-time",
    salary: "",
    requirements: "",
    deadline: "",
    applicationUrl: "",
    applyInApp: true,
  })

  useEffect(() => {
    async function fetchUserAndData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUser(user)

          // Fetch company jobs
          const { data: jobsData, error: jobsError } = await supabase
            .from("jobs")
            .select("*")
            .eq("company_id", user.id)
            .order("created_at", { ascending: false })

          if (jobsError) throw jobsError
          setJobs(jobsData || [])

          // Fetch job applications
          const { data: applicationsData, error: applicationsError } = await supabase
            .from("job_applications")
            .select(`
              *,
              jobs(*),
              profiles(*)
            `)
            .in("job_id", jobsData?.map((job) => job.id) || [])
            .order("created_at", { ascending: false })

          if (applicationsError) throw applicationsError
          setApplications(applicationsData || [])

          // Extract unique candidates from applications
          const uniqueCandidates = Array.from(
            new Map(applicationsData?.map((app) => [app.profiles?.id, app.profiles]) || []).values(),
          ).filter(Boolean)

          setCandidates(uniqueCandidates)

          // Calculate analytics
          const activeJobsCount = jobsData?.filter((job) => job.is_active).length || 0
          const newApplicationsCount = applicationsData?.filter((app) => app.status === "pending").length || 0
          const interviewsCount = applicationsData?.filter((app) => app.status === "interview").length || 0
          const offersCount = applicationsData?.filter((app) => app.status === "offer").length || 0
          const hiredCount = applicationsData?.filter((app) => app.status === "hired").length || 0

          setAnalytics({
            totalJobs: jobsData?.length || 0,
            activeJobs: activeJobsCount,
            totalApplications: applicationsData?.length || 0,
            newApplications: newApplicationsCount,
            interviewsScheduled: interviewsCount,
            offersSent: offersCount,
            hiringRate: applicationsData?.length ? Math.round((hiredCount / applicationsData.length) * 100) : 0,
            averageTimeToHire: 18, // Mock data in days
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndData()
  }, [])

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          company_id: user.id,
          title: newJob.title,
          description: newJob.description,
          location: newJob.location,
          type: newJob.type,
          salary: newJob.salary,
          requirements: newJob.requirements,
          deadline: newJob.deadline,
          application_url: newJob.applicationUrl,
          apply_in_app: newJob.applyInApp,
          is_active: true,
        })
        .select()

      if (error) throw error

      // Reset form and refresh jobs
      setNewJob({
        title: "",
        description: "",
        location: "",
        type: "Full-time",
        salary: "",
        requirements: "",
        deadline: "",
        applicationUrl: "",
        applyInApp: true,
      })

      // Add new job to the list
      if (data && data[0]) {
        setJobs([data[0], ...jobs])

        // Update analytics
        setAnalytics({
          ...analytics,
          totalJobs: analytics.totalJobs + 1,
          activeJobs: analytics.activeJobs + 1,
        })
      }

      alert("Job posted successfully!")
    } catch (error) {
      console.error("Error creating job:", error)
      alert("Failed to post job. Please try again.")
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return

    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId)

      if (error) throw error

      // Remove job from list
      const updatedJobs = jobs.filter((job) => job.id !== jobId)
      setJobs(updatedJobs)

      // Remove associated applications
      const updatedApplications = applications.filter((app) => app.job_id !== jobId)
      setApplications(updatedApplications)

      // Update analytics
      const deletedJob = jobs.find((job) => job.id === jobId)
      setAnalytics({
        ...analytics,
        totalJobs: analytics.totalJobs - 1,
        activeJobs: deletedJob?.is_active ? analytics.activeJobs - 1 : analytics.activeJobs,
      })

      alert("Job deleted successfully!")
    } catch (error) {
      console.error("Error deleting job:", error)
      alert("Failed to delete job. Please try again.")
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase.from("job_applications").update({ status }).eq("id", applicationId)

      if (error) throw error

      // Update application in list
      const updatedApplications = applications.map((app) => (app.id === applicationId ? { ...app, status } : app))
      setApplications(updatedApplications)

      // Update selected application if it's the one being updated
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status })
      }

      alert("Application status updated!")
    } catch (error) {
      console.error("Error updating application:", error)
      alert("Failed to update application status. Please try again.")
    }
  }

  const filteredApplications = applications.filter((app) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by status
    const matchesStatus = filterStatus === "all" || app.status === filterStatus

    return matchesSearch && matchesStatus
  })

  if (loading) {
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
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Corporate Dashboard</h1>
            <p className="text-muted-foreground">Manage your job postings, applications, and candidates</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.activeJobs}</div>
                    <p className="text-xs text-muted-foreground">{analytics.totalJobs} total jobs posted</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Applications</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.newApplications}</div>
                    <p className="text-xs text-muted-foreground">{analytics.totalApplications} total applications</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.interviewsScheduled}</div>
                    <p className="text-xs text-muted-foreground">{analytics.offersSent} offers sent</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.hiringRate}%</div>
                    <p className="text-xs text-muted-foreground">Avg. {analytics.averageTimeToHire} days to hire</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Latest candidates who applied to your jobs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {applications.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No applications yet</p>
                    ) : (
                      <div className="space-y-4">
                        {applications.slice(0, 5).map((application) => (
                          <div key={application.id} className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={application.profiles?.avatar_url} />
                              <AvatarFallback>{application.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{application.profiles?.full_name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                Applied for {application.jobs?.title}
                              </p>
                            </div>
                            <Badge
                              variant={
                                application.status === "hired"
                                  ? "default"
                                  : application.status === "interview"
                                    ? "outline"
                                    : application.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                              }
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("applications")}>
                      View All Applications
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Job Postings</CardTitle>
                    <CardDescription>Your currently active job listings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {jobs.filter((job) => job.is_active).length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No active jobs</p>
                    ) : (
                      <div className="space-y-4">
                        {jobs
                          .filter((job) => job.is_active)
                          .slice(0, 5)
                          .map((job) => (
                            <div key={job.id} className="flex items-start gap-4">
                              <div className="bg-primary/10 p-2 rounded-md">
                                <Briefcase className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{job.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {job.location} • {job.type}
                                </p>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {applications.filter((app) => app.job_id === job.id).length} applicants
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("jobs")}>
                      View All Jobs
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hiring Pipeline</CardTitle>
                  <CardDescription>Current status of your hiring process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-500/10 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-blue-500" />
                        </div>
                        <span>Applications</span>
                      </div>
                      <span className="font-medium">
                        {applications.filter((app) => app.status === "pending").length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (applications.filter((app) => app.status === "pending").length / (applications.length || 1)) *
                        100
                      }
                      className="h-2 bg-blue-100"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-500/10 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-yellow-500" />
                        </div>
                        <span>Interviews</span>
                      </div>
                      <span className="font-medium">
                        {applications.filter((app) => app.status === "interview").length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (applications.filter((app) => app.status === "interview").length / (applications.length || 1)) *
                        100
                      }
                      className="h-2 bg-yellow-100"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-500/10 p-2 rounded-full">
                          <Mail className="h-4 w-4 text-purple-500" />
                        </div>
                        <span>Offers</span>
                      </div>
                      <span className="font-medium">{applications.filter((app) => app.status === "offer").length}</span>
                    </div>
                    <Progress
                      value={
                        (applications.filter((app) => app.status === "offer").length / (applications.length || 1)) * 100
                      }
                      className="h-2 bg-purple-100"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-500/10 p-2 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <span>Hired</span>
                      </div>
                      <span className="font-medium">{applications.filter((app) => app.status === "hired").length}</span>
                    </div>
                    <Progress
                      value={
                        (applications.filter((app) => app.status === "hired").length / (applications.length || 1)) * 100
                      }
                      className="h-2 bg-green-100"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Your Job Postings</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Post a New Job</DialogTitle>
                      <DialogDescription>Fill in the details below to create a new job posting.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateJob}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Job Title
                          </Label>
                          <Input
                            id="title"
                            value={newJob.title}
                            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="location" className="text-right">
                            Location
                          </Label>
                          <Input
                            id="location"
                            value={newJob.location}
                            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right">
                            Job Type
                          </Label>
                          <select
                            id="type"
                            value={newJob.type}
                            onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                            required
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="salary" className="text-right">
                            Salary Range
                          </Label>
                          <Input
                            id="salary"
                            value={newJob.salary}
                            onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. KSh 50,000 - 70,000"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="deadline" className="text-right">
                            Deadline
                          </Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={newJob.deadline}
                            onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label htmlFor="description" className="text-right pt-2">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={newJob.description}
                            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                            className="col-span-3"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label htmlFor="requirements" className="text-right pt-2">
                            Requirements
                          </Label>
                          <Textarea
                            id="requirements"
                            value={newJob.requirements}
                            onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                            className="col-span-3"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <div className="text-right">
                            <Label htmlFor="applyInApp">Application Method</Label>
                          </div>
                          <div className="col-span-3 space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="applyInApp"
                                checked={newJob.applyInApp}
                                onCheckedChange={(checked) => setNewJob({ ...newJob, applyInApp: checked as boolean })}
                              />
                              <Label htmlFor="applyInApp">Allow candidates to apply through CV Chap Chap</Label>
                            </div>

                            <div className="flex flex-col space-y-2">
                              <Label htmlFor="applicationUrl">External Application URL (Optional)</Label>
                              <Input
                                id="applicationUrl"
                                value={newJob.applicationUrl}
                                onChange={(e) => setNewJob({ ...newJob, applicationUrl: e.target.value })}
                                placeholder="https://your-company-careers.com/job-url"
                              />
                              <p className="text-xs text-muted-foreground">
                                If provided, candidates will also have the option to apply on your website
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Post Job</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {jobs.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </DialogTrigger>
                    {/* Dialog content is the same as above */}
                  </Dialog>
                </Card>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{job.title}</CardTitle>
                            <CardDescription>
                              {job.location} • {job.type}
                            </CardDescription>
                          </div>
                          <Badge variant={job.is_active ? "default" : "secondary"}>
                            {job.is_active ? "Active" : "Closed"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            <strong>Salary:</strong> {job.salary}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
                          </p>
                          <p className="text-sm line-clamp-2">{job.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.apply_in_app && (
                              <Badge variant="outline" className="bg-green-50">
                                CV Chap Chap Applications
                              </Badge>
                            )}
                            {job.application_url && <Badge variant="outline">External Applications</Badge>}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div>
                          <Badge variant="outline" className="mr-2">
                            {applications.filter((app) => app.job_id === job.id).length} Applications
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedJob(job)
                              setActiveTab("applications")
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Applications
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Job
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {job.is_active ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Close Job
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Reopen Job
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteJob(job.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold">Job Applications</h2>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  {filteredApplications.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No applications found.</p>
                    </Card>
                  ) : (
                    filteredApplications.map((application) => (
                      <Card
                        key={application.id}
                        className={`cursor-pointer transition-all hover:border-primary ${
                          selectedApplication?.id === application.id ? "border-primary ring-1 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={application.profiles?.avatar_url} />
                                <AvatarFallback>{application.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{application.profiles?.full_name}</CardTitle>
                                <CardDescription className="text-xs">
                                  Applied for {application.jobs?.title}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge
                              variant={
                                application.status === "hired"
                                  ? "default"
                                  : application.status === "interview"
                                    ? "outline"
                                    : application.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                              }
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-muted-foreground">
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCandidate(application.profiles)
                              setActiveTab("candidates")
                            }}
                          >
                            View Profile
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>

                <div className="lg:col-span-2">
                  {selectedApplication ? (
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={selectedApplication.profiles?.avatar_url} />
                              <AvatarFallback>
                                {selectedApplication.profiles?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle>{selectedApplication.profiles?.full_name}</CardTitle>
                              <CardDescription>
                                {selectedApplication.profiles?.email} •{" "}
                                {selectedApplication.profiles?.phone || "No phone"}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant={
                                selectedApplication.status === "hired"
                                  ? "default"
                                  : selectedApplication.status === "interview"
                                    ? "outline"
                                    : selectedApplication.status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                              }
                              className="self-start"
                            >
                              {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              Applied on {new Date(selectedApplication.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Application for {selectedApplication.jobs?.title}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p>{selectedApplication.jobs?.location}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Job Type</p>
                              <p>{selectedApplication.jobs?.type}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Salary Range</p>
                              <p>{selectedApplication.jobs?.salary}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Deadline</p>
                              <p>{new Date(selectedApplication.jobs?.deadline).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">Resume</h3>
                          <div className="border rounded-md p-4 bg-muted/30">
                            <div className="flex justify-between mb-2">
                              <p className="text-sm font-medium">resume.pdf</p>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                            <div className="aspect-[3/4] bg-white rounded border flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                          <div className="border rounded-md p-4">
                            <p className="text-sm">
                              Dear Hiring Manager,
                              <br />
                              <br />I am writing to express my interest in the {selectedApplication.jobs?.title}{" "}
                              position at your company. With my background and skills, I believe I would be a valuable
                              addition to your team.
                              <br />
                              <br />
                              Thank you for considering my application. I look forward to the opportunity to discuss how
                              I can contribute to your organization.
                              <br />
                              <br />
                              Sincerely,
                              <br />
                              {selectedApplication.profiles?.full_name}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2 justify-end border-t pt-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              Update Status <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleUpdateApplicationStatus(selectedApplication.id, "pending")}
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateApplicationStatus(selectedApplication.id, "interview")}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateApplicationStatus(selectedApplication.id, "offer")}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Offer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateApplicationStatus(selectedApplication.id, "hired")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Hired
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleUpdateApplicationStatus(selectedApplication.id, "rejected")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Application
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact Candidate
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="h-full flex items-center justify-center p-8">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Select an application</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Click on an application to view details</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Candidate Database</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search candidates..." className="pl-10" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Candidates ({candidates.length})</CardTitle>
                      <CardDescription>People who have applied to your jobs</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-[600px] overflow-y-auto">
                        {candidates.length === 0 ? (
                          <p className="p-4 text-center text-muted-foreground">No candidates yet</p>
                        ) : (
                          candidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className={`flex items-center gap-3 p-4 hover:bg-muted cursor-pointer border-b last:border-0 ${
                                selectedCandidate?.id === candidate.id ? "bg-muted" : ""
                              }`}
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              <Avatar>
                                <AvatarImage src={candidate.avatar_url} />
                                <AvatarFallback>{candidate.full_name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{candidate.full_name}</p>
                                <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  {selectedCandidate ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={selectedCandidate.avatar_url} />
                              <AvatarFallback>{selectedCandidate.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle>{selectedCandidate.full_name}</CardTitle>
                              <CardDescription className="mt-1">
                                {selectedCandidate.job_title || "No job title"}
                              </CardDescription>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline">{selectedCandidate.location || "No location"}</Badge>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Mail className="mr-1 h-4 w-4" />
                                  {selectedCandidate.email}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Applications</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Job Position</TableHead>
                                <TableHead>Applied On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {applications
                                .filter((app) => app.profiles?.id === selectedCandidate.id)
                                .map((app) => (
                                  <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.jobs?.title}</TableCell>
                                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          app.status === "hired"
                                            ? "default"
                                            : app.status === "interview"
                                              ? "outline"
                                              : app.status === "rejected"
                                                ? "destructive"
                                                : "secondary"
                                        }
                                      >
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedApplication(app)
                                          setActiveTab("applications")
                                        }}
                                      >
                                        View
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">Resume</h3>
                          <div className="border rounded-md p-4 bg-muted/30">
                            <div className="flex justify-between mb-2">
                              <p className="text-sm font-medium">resume.pdf</p>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                            <div className="aspect-[3/4] bg-white rounded border flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-2">Notes</h3>
                          <Textarea placeholder="Add notes about this candidate..." className="min-h-[100px]" />
                          <Button className="mt-2" size="sm">
                            Save Notes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-full flex items-center justify-center p-8">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Select a candidate</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Click on a candidate to view their profile</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalApplications}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 flex items-center">
                        <ChevronUp className="mr-1 h-4 w-4" />+{analytics.newApplications} new
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.hiringRate}%</div>
                    <p className="text-xs text-muted-foreground">Industry average: 15%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.averageTimeToHire} days</div>
                    <p className="text-xs text-muted-foreground">Industry average: 30 days</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cost per Hire</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KSh 15,000</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 flex items-center">
                        <ChevronDown className="mr-1 h-4 w-4" />
                        -12% from last month
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Sources</CardTitle>
                    <CardDescription>Where candidates are finding your jobs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">Company Website</p>
                          <p className="text-sm font-medium">45%</p>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">LinkedIn</p>
                          <p className="text-sm font-medium">30%</p>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">Indeed</p>
                          <p className="text-sm font-medium">15%</p>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">Referrals</p>
                          <p className="text-sm font-medium">10%</p>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Application Status Breakdown</CardTitle>
                    <CardDescription>Current status of all applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <p className="text-sm font-medium">Pending Review</p>
                          </div>
                          <p className="text-sm font-medium">
                            {applications.filter((app) => app.status === "pending").length}(
                            {applications.length
                              ? Math.round(
                                  (applications.filter((app) => app.status === "pending").length /
                                    applications.length) *
                                    100,
                                )
                              : 0}
                            %)
                          </p>
                        </div>
                        <Progress
                          value={
                            applications.length
                              ? (applications.filter((app) => app.status === "pending").length / applications.length) *
                                100
                              : 0
                          }
                          className="h-2 bg-blue-100"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <p className="text-sm font-medium">Interview</p>
                          </div>
                          <p className="text-sm font-medium">
                            {applications.filter((app) => app.status === "interview").length}(
                            {applications.length
                              ? Math.round(
                                  (applications.filter((app) => app.status === "interview").length /
                                    applications.length) *
                                    100,
                                )
                              : 0}
                            %)
                          </p>
                        </div>
                        <Progress
                          value={
                            applications.length
                              ? (applications.filter((app) => app.status === "interview").length /
                                  applications.length) *
                                100
                              : 0
                          }
                          className="h-2 bg-yellow-100"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                            <p className="text-sm font-medium">Offer</p>
                          </div>
                          <p className="text-sm font-medium">
                            {applications.filter((app) => app.status === "offer").length}(
                            {applications.length
                              ? Math.round(
                                  (applications.filter((app) => app.status === "offer").length / applications.length) *
                                    100,
                                )
                              : 0}
                            %)
                          </p>
                        </div>
                        <Progress
                          value={
                            applications.length
                              ? (applications.filter((app) => app.status === "offer").length / applications.length) *
                                100
                              : 0
                          }
                          className="h-2 bg-purple-100"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <p className="text-sm font-medium">Hired</p>
                          </div>
                          <p className="text-sm font-medium">
                            {applications.filter((app) => app.status === "hired").length}(
                            {applications.length
                              ? Math.round(
                                  (applications.filter((app) => app.status === "hired").length / applications.length) *
                                    100,
                                )
                              : 0}
                            %)
                          </p>
                        </div>
                        <Progress
                          value={
                            applications.length
                              ? (applications.filter((app) => app.status === "hired").length / applications.length) *
                                100
                              : 0
                          }
                          className="h-2 bg-green-100"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <p className="text-sm font-medium">Rejected</p>
                          </div>
                          <p className="text-sm font-medium">
                            {applications.filter((app) => app.status === "rejected").length}(
                            {applications.length
                              ? Math.round(
                                  (applications.filter((app) => app.status === "rejected").length /
                                    applications.length) *
                                    100,
                                )
                              : 0}
                            %)
                          </p>
                        </div>
                        <Progress
                          value={
                            applications.length
                              ? (applications.filter((app) => app.status === "rejected").length / applications.length) *
                                100
                              : 0
                          }
                          className="h-2 bg-red-100"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Job Performance</CardTitle>
                  <CardDescription>Application metrics by job posting</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Interviews</TableHead>
                        <TableHead>Offers</TableHead>
                        <TableHead>Conversion Rate</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => {
                        const jobApplications = applications.filter((app) => app.job_id === job.id)
                        const interviewCount = jobApplications.filter(
                          (app) => app.status === "interview" || app.status === "offer" || app.status === "hired",
                        ).length
                        const offerCount = jobApplications.filter(
                          (app) => app.status === "offer" || app.status === "hired",
                        ).length
                        const conversionRate = jobApplications.length
                          ? Math.round((interviewCount / jobApplications.length) * 100)
                          : 0

                        return (
                          <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{jobApplications.length}</TableCell>
                            <TableCell>{interviewCount}</TableCell>
                            <TableCell>{offerCount}</TableCell>
                            <TableCell>{conversionRate}%</TableCell>
                            <TableCell>
                              <Badge variant={job.is_active ? "default" : "secondary"}>
                                {job.is_active ? "Active" : "Closed"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
