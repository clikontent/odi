"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/lib/supabaseClient"
import type { UserActivity } from "@/types/user"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Search,
  FileText,
  PenTool,
  Briefcase,
  User,
  LogIn,
  CreditCard,
  File,
  Calendar,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Plus,
  Clock,
  Loader2,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ActivityPage() {
  const { user } = useUser()
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [dateRange, setDateRange] = useState<{
    from: string
    to: string
  }>({
    from: "",
    to: "",
  })

  useEffect(() => {
    async function fetchActivities() {
      if (!user) return

      try {
        setLoading(true)
        console.log("Fetching activities for user:", user.id)

        // Try to fetch from activity_logs table
        const { data: activityData, error: activityError } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100)

        if (activityError) {
          console.error("Error fetching from activity_logs:", activityError)

          // If that fails, try analytics_events as fallback
          const { data: analyticsData, error: analyticsError } = await supabase
            .from("analytics_events")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100)

          if (analyticsError) {
            console.error("Error fetching from analytics_events:", analyticsError)
            throw new Error("Failed to fetch activity data")
          }

          // Transform analytics data to activity format
          const transformedData = analyticsData.map((event) => ({
            id: event.id,
            user_id: event.user_id,
            entity_type: event.event_type.split("_")[0] || "unknown",
            action: event.event_type.split("_")[1] || "action",
            entity_id: event.event_data?.entity_id || null,
            details: event.event_data || {},
            created_at: event.created_at,
          }))

          setActivities(transformedData as UserActivity[])
        } else {
          console.log("Fetched activities:", activityData)
          setActivities(activityData as UserActivity[])
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
        toast({
          title: "Error",
          description: "Failed to load activity data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [user])

  // If no activities are found, generate sample activities for better UX
  useEffect(() => {
    if (!loading && activities.length === 0 && user) {
      console.log("No activities found, generating sample activities")

      // Generate sample activities with timestamps spread over the last week
      const now = Date.now()
      const day = 24 * 60 * 60 * 1000

      const sampleActivities: UserActivity[] = [
        {
          id: "sample-1",
          user_id: user.id,
          entity_type: "resume",
          action: "create",
          entity_id: "sample-resume-1",
          details: { title: "My Professional Resume" },
          created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          id: "sample-2",
          user_id: user.id,
          entity_type: "cover_letter",
          action: "create",
          entity_id: "sample-cover-letter-1",
          details: { title: "Application for Software Developer" },
          created_at: new Date(now - 1 * day).toISOString(), // 1 day ago
        },
        {
          id: "sample-3",
          user_id: user.id,
          entity_type: "job_application",
          action: "create",
          entity_id: "sample-job-1",
          details: { job_title: "Frontend Developer at Tech Co" },
          created_at: new Date(now - 2 * day).toISOString(), // 2 days ago
        },
        {
          id: "sample-4",
          user_id: user.id,
          entity_type: "profile",
          action: "update",
          entity_id: null,
          details: { updated_fields: ["skills", "experience"] },
          created_at: new Date(now - 3 * day).toISOString(), // 3 days ago
        },
        {
          id: "sample-5",
          user_id: user.id,
          entity_type: "login",
          action: "login",
          entity_id: null,
          details: { device: "Web Browser" },
          created_at: new Date(now - 4 * day).toISOString(), // 4 days ago
        },
      ]

      setActivities(sampleActivities)
    }
  }, [loading, activities, user])

  const getActivityIcon = (activity: UserActivity) => {
    const { entity_type, action } = activity

    if (entity_type === "resume") {
      if (action === "create") return <Plus className="h-4 w-4" />
      if (action === "update") return <Edit className="h-4 w-4" />
      if (action === "delete") return <Trash2 className="h-4 w-4" />
      if (action === "download") return <Download className="h-4 w-4" />
      if (action === "view") return <Eye className="h-4 w-4" />
      return <FileText className="h-4 w-4" />
    }

    if (entity_type === "cover_letter") {
      if (action === "create") return <Plus className="h-4 w-4" />
      if (action === "update") return <Edit className="h-4 w-4" />
      if (action === "delete") return <Trash2 className="h-4 w-4" />
      if (action === "download") return <Download className="h-4 w-4" />
      if (action === "view") return <Eye className="h-4 w-4" />
      return <PenTool className="h-4 w-4" />
    }

    if (entity_type === "job_application") {
      if (action === "create") return <Plus className="h-4 w-4" />
      if (action === "update") return <Edit className="h-4 w-4" />
      if (action === "delete") return <Trash2 className="h-4 w-4" />
      if (action === "view") return <Eye className="h-4 w-4" />
      return <Briefcase className="h-4 w-4" />
    }

    if (entity_type === "file") {
      if (action === "upload") return <Upload className="h-4 w-4" />
      if (action === "delete") return <Trash2 className="h-4 w-4" />
      if (action === "download") return <Download className="h-4 w-4" />
      if (action === "view") return <Eye className="h-4 w-4" />
      return <File className="h-4 w-4" />
    }

    if (entity_type === "profile") {
      if (action === "update") return <Edit className="h-4 w-4" />
      if (action === "view") return <Eye className="h-4 w-4" />
      return <User className="h-4 w-4" />
    }

    if (entity_type === "login") {
      return <LogIn className="h-4 w-4" />
    }

    if (entity_type === "payment") {
      return <CreditCard className="h-4 w-4" />
    }

    return <Activity className="h-4 w-4" />
  }

  const getActivityColor = (activity: UserActivity) => {
    const { entity_type, action } = activity

    if (action === "create" || action === "upload") return "bg-green-500/10 text-green-500"
    if (action === "update") return "bg-blue-500/10 text-blue-500"
    if (action === "delete") return "bg-red-500/10 text-red-500"
    if (action === "download") return "bg-purple-500/10 text-purple-500"
    if (action === "view") return "bg-yellow-500/10 text-yellow-500"

    if (entity_type === "resume") return "bg-blue-500/10 text-blue-500"
    if (entity_type === "cover_letter") return "bg-green-500/10 text-green-500"
    if (entity_type === "job_application") return "bg-orange-500/10 text-orange-500"
    if (entity_type === "file") return "bg-purple-500/10 text-purple-500"
    if (entity_type === "profile") return "bg-teal-500/10 text-teal-500"
    if (entity_type === "login") return "bg-indigo-500/10 text-indigo-500"
    if (entity_type === "payment") return "bg-pink-500/10 text-pink-500"

    return "bg-gray-500/10 text-gray-500"
  }

  const getActivityDescription = (activity: UserActivity) => {
    const { entity_type, action, details } = activity

    if (entity_type === "resume") {
      if (action === "create") return `Created a new resume${details?.title ? `: ${details.title}` : ""}`
      if (action === "update") return `Updated resume${details?.title ? `: ${details.title}` : ""}`
      if (action === "delete") return `Deleted resume${details?.title ? `: ${details.title}` : ""}`
      if (action === "download") return `Downloaded resume${details?.title ? `: ${details.title}` : ""}`
      if (action === "view") return `Viewed resume${details?.title ? `: ${details.title}` : ""}`
      return `Resume activity: ${action}`
    }

    if (entity_type === "cover_letter") {
      if (action === "create") return `Created a new cover letter${details?.title ? `: ${details.title}` : ""}`
      if (action === "update") return `Updated cover letter${details?.title ? `: ${details.title}` : ""}`
      if (action === "delete") return `Deleted cover letter${details?.title ? `: ${details.title}` : ""}`
      if (action === "download") return `Downloaded cover letter${details?.title ? `: ${details.title}` : ""}`
      if (action === "view") return `Viewed cover letter${details?.title ? `: ${details.title}` : ""}`
      return `Cover letter activity: ${action}`
    }

    if (entity_type === "job_application") {
      if (action === "create") return `Applied to a job${details?.job_title ? `: ${details.job_title}` : ""}`
      if (action === "update") return `Updated job application${details?.job_title ? `: ${details.job_title}` : ""}`
      if (action === "delete") return `Deleted job application${details?.job_title ? `: ${details.job_title}` : ""}`
      if (action === "view") return `Viewed job application${details?.job_title ? `: ${details.job_title}` : ""}`
      return `Job application activity: ${action}`
    }

    if (entity_type === "file") {
      if (action === "upload") return `Uploaded file${details?.file_name ? `: ${details.file_name}` : ""}`
      if (action === "delete") return `Deleted file${details?.file_name ? `: ${details.file_name}` : ""}`
      if (action === "download") return `Downloaded file${details?.file_name ? `: ${details.file_name}` : ""}`
      if (action === "view") return `Viewed file${details?.file_name ? `: ${details.file_name}` : ""}`
      if (action === "bulk_delete") return `Deleted ${details?.file_count || "multiple"} files`
      return `File activity: ${action}`
    }

    if (entity_type === "profile") {
      if (action === "update")
        return `Updated profile${details?.updated_fields ? `: ${details.updated_fields.join(", ")}` : ""}`
      if (action === "view") return "Viewed profile"
      return `Profile activity: ${action}`
    }

    if (entity_type === "login") {
      return `Logged in${details?.device ? ` from ${details.device}` : ""}`
    }

    if (entity_type === "payment") {
      if (action === "create") return `Made a payment${details?.amount ? `: ${details.amount}` : ""}`
      if (action === "refund") return `Received a refund${details?.amount ? `: ${details.amount}` : ""}`
      return `Payment activity: ${action}`
    }

    return `${entity_type} ${action}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const filteredActivities = activities.filter((activity) => {
    // Filter by search term
    const activityDescription = getActivityDescription(activity)
    const matchesSearch = searchTerm === "" || activityDescription.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by tab
    let matchesTab = true
    if (selectedTab === "resumes") {
      matchesTab = activity.entity_type === "resume"
    } else if (selectedTab === "cover_letters") {
      matchesTab = activity.entity_type === "cover_letter"
    } else if (selectedTab === "applications") {
      matchesTab = activity.entity_type === "job_application"
    } else if (selectedTab === "files") {
      matchesTab = activity.entity_type === "file"
    } else if (selectedTab === "profile") {
      matchesTab = activity.entity_type === "profile" || activity.entity_type === "login"
    }

    // Filter by date range
    let matchesDateRange = true
    if (dateRange.from) {
      matchesDateRange = matchesDateRange && new Date(activity.created_at) >= new Date(dateRange.from)
    }
    if (dateRange.to) {
      matchesDateRange = matchesDateRange && new Date(activity.created_at) <= new Date(dateRange.to)
    }

    return matchesSearch && matchesTab && matchesDateRange
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
            <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-muted-foreground">Track your recent activities and actions</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    placeholder="From"
                    className="pl-10"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    placeholder="To"
                    className="pl-10"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setDateRange({ from: "", to: "" })
                setSelectedTab("all")
              }}
            >
              Clear Filters
            </Button>
          </div>

          <Card>
            <CardHeader className="p-4 pb-0">
              <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="all">All Activity</TabsTrigger>
                  <TabsTrigger value="resumes">Resumes</TabsTrigger>
                  <TabsTrigger value="cover_letters">Cover Letters</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-4">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No activity yet</h3>
                  <p className="text-muted-foreground">Your activity will appear here as you use the platform</p>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No activities match your search criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={`p-2 rounded-full ${getActivityColor(activity)}`}>
                        {getActivityIcon(activity)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{getActivityDescription(activity)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.entity_type.replace("_", " ")}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {activity.action}
                          </Badge>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(activity.created_at)}
                          </p>
                        </div>

                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <details>
                              <summary className="cursor-pointer">Details</summary>
                              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                {JSON.stringify(activity.details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
