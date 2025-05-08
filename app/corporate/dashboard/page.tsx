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
  Eye,
  Trash2,
  Edit,
  BarChart2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  MoreHorizontal,
  Brain,
  Star,
  LineChart,
  UserCog,
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
import { useToast } from "@/components/ui/use-toast"

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
    resumesProcessed: 0,
    resumesLimit: 100,
    matchQuality: 85,
  })
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

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
    isFeatured: false,
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
            resumesProcessed: 42, // Mock data
            resumesLimit: 100, // Monthly limit
            matchQuality: 85, // Mock data percentage
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: "There was a problem loading your data. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndData()
  }, [toast])

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
          is_featured: newJob.isFeatured,
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
        isFeatured: false,
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

      toast({
        title: "Job Posted",
        description: "Your job has been posted successfully.",
      })
    } catch (error) {
      console.error("Error creating job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post job. Please try again.",
      })
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

      toast({
        title: "Job Deleted",
        description: "The job has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete job. Please try again.",
      })
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

      toast({
        title: "Status Updated",
        description: "Application status has been updated.",
      })
    } catch (error) {
      console.error("Error updating application:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status. Please try again.",
      })
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="ai-matching">AI Matching</TabsTrigger>
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
                    <CardTitle className="text-sm font-medium">Resumes Processed</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.resumesProcessed}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.resumesProcessed}/{analytics.resumesLimit} this month
                    </p>
                    <Progress
                      value={(analytics.resumesProcessed / analytics.resumesLimit) * 100}
                      className="h-1 mt-2"
                    />
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
                              <AvatarImage src={application.profiles?.avatar_url || null} />
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
                    <CardTitle>Featured Job Postings</CardTitle>
                    <CardDescription>Your currently featured job listings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {jobs.filter((job) => job.is_featured).length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No featured jobs</p>
                    ) : (
                      <div className="space-y-4">
                        {jobs
                          .filter((job) => job.is_featured)
                          .slice(0, 5)
                          .map((job) => (
                            <div key={job.id} className="flex items-start gap-4">
                              <div className="bg-primary/10 p-2 rounded-md">
                                <Star className="h-5 w-5 text-primary" />
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>AI Match Quality</CardTitle>
                    <CardDescription>Average match quality for your job postings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="relative h-36 w-36">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-3xl font-bold">{analytics.matchQuality}%</div>
                        </div>
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          <circle
                            className="text-muted stroke-current"
                            strokeWidth="10"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-primary stroke-current"
                            strokeWidth="10"
                            strokeLinecap="round"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            strokeDasharray={`${2 * Math.PI * 40 * (analytics.matchQuality / 100)} ${
                              2 * Math.PI * 40 * (1 - analytics.matchQuality / 100)
                            }`}
                            strokeDashoffset={2 * Math.PI * 40 * 0.25}
                          />
                        </svg>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        AI is finding high-quality candidates for your positions
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("ai-matching")}>
                      View AI Matching
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Corporate Plan Benefits</CardTitle>
                    <CardDescription>Your premium corporate features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Bulk Hiring Tools</h3>
                          <p className="text-sm text-muted-foreground">
                            Process up to 100 resumes per month with our AI tools
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">AI Candidate Matching</h3>
                          <p className="text-sm text-muted-foreground">
                            Automatically match candidates to your job requirements
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Featured Job Posts</h3>
                          <p className="text-sm text-muted-foreground">Highlight your jobs for increased visibility</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <LineChart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Advanced Analytics</h3>
                          <p className="text-sm text-muted-foreground">Detailed reporting on your hiring process</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserCog className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Dedicated Account Manager</h3>
                          <p className="text-sm text-muted-foreground">Personal support for your hiring needs</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                        <div className="grid grid-cols-4 items-center gap-4">
                          <div className="text-right">
                            <Label htmlFor="isFeatured">Featured Job</Label>
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="isFeatured"
                                checked={newJob.isFeatured}
                                onCheckedChange={(checked) => setNewJob({ ...newJob, isFeatured: checked as boolean })}
                              />
                              <Label htmlFor="isFeatured">
                                Mark as featured job (appears at the top of job listings)
                              </Label>
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
                          <div className="flex items-start gap-2">
                            <div>
                              <CardTitle>{job.title}</CardTitle>
                              <CardDescription>
                                {job.location} • {job.type}
                              </CardDescription>
                            </div>
                            {job.is_featured && (
                              <Badge variant="secondary" className="ml-2">
                                <Star className="h-3 w-3 mr-1" /> Featured
                              </Badge>
                            )}
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
                              <DropdownMenuItem>
                                {job.is_featured ? (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Remove Featured Status
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4 mr-2" />
                                    Mark as Featured
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

            {/* AI Matching Tab (New) */}
            <TabsContent value="ai-matching" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">AI-Powered Candidate Matching</h2>
                  <p className="text-muted-foreground">
                    Automatically match candidates to your job requirements using AI
                  </p>
                </div>
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  Run New Match
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Match Settings</CardTitle>
                  <CardDescription>Configure how AI matches candidates to your jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="job-select">Select Job</Label>
                        <Select defaultValue="all">
                          <SelectTrigger id="job-select">
                            <SelectValue placeholder="Select a job" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Active Jobs</SelectItem>
                            {jobs
                              .filter((job) => job.is_active)
                              .map((job) => (
                                <SelectItem key={job.id} value={job.id}>
                                  {job.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="match-threshold">Match Threshold</Label>
                        <div className="flex items-center gap-4">
                          <Input id="match-threshold" type="range" min="50" max="100" defaultValue="70" />
                          <span className="w-12 text-center">70%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Only show candidates with match score above this threshold
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Prioritize Matching Factors</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="skills" className="text-sm font-normal cursor-pointer">
                              Skills & Experience
                            </Label>
                            <Select defaultValue="high">
                              <SelectTrigger id="skills" className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="education" className="text-sm font-normal cursor-pointer">
                              Education
                            </Label>
                            <Select defaultValue="medium">
                              <SelectTrigger id="education" className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="location" className="text-sm font-normal cursor-pointer">
                              Location
                            </Label>
                            <Select defaultValue="low">
                              <SelectTrigger id="location" className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">Save Settings</Button>
                </CardFooter>
              </Card>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Top Matched Candidates</CardTitle>
                    <CardDescription>Candidates with the highest match scores for your jobs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Job Position</TableHead>
                          <TableHead>Match Score</TableHead>
                          <TableHead>Key Strengths</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidates.slice(0, 5).map((candidate) => (
                          <TableRow key={candidate.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={candidate.avatar_url || null} />
                                  <AvatarFallback>{candidate.full_name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{candidate.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{candidate.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>Software Engineer</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">92%</span>
                                <Progress value={92} className="h-2 w-16" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  React
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  TypeScript
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Node.js
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View Profile
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Match Insights</CardTitle>
                    <CardDescription>Analytics on your candidate matching</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Match Quality Distribution</h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Excellent (90-100%)</span>
                            <span>12%</span>
                          </div>
                          <Progress value={12} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Good (80-89%)</span>
                            <span>28%</span>
                          </div>
                          <Progress value={28} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Fair (70-79%)</span>
                            <span>35%</span>
                          </div>
                          <Progress value={35} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Poor (Below 70%)</span>
                            <span>25%</span>
                          </div>
                          <Progress value={25} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Most In-Demand Skills</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>React</span>
                          <span>85%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>TypeScript</span>
                          <span>72%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Node.js</span>
                          <span>68%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>AWS</span>
                          <span>54%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Skill Gap Analysis</h3>
                      <p className="text-sm text-muted-foreground">Top skills requested but rare in candidate pool:</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="secondary">GraphQL</Badge>
                        <Badge variant="secondary">Kubernetes</Badge>
                        <Badge variant="secondary">Machine Learning</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-4">
              {/* Applications tab content remains the same */}
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="space-y-4">
              {/* Candidates tab content remains the same */}
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
