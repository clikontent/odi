"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, MessageSquare, Zap, Briefcase, Search, Crown, Lock, Bell, Activity } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getUserSubscription } from "@/lib/subscription"

interface DashboardStats {
  resumes: number
  applications: number
  coverLetters: number
}

interface CommunityPost {
  id: string
  title: string
  content: string
  post_type: string
  is_pinned: boolean
  created_at: string
}

interface UserActivity {
  id: string
  activity_type: string
  description: string
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    resumes: 0,
    applications: 0,
    coverLetters: 0,
  })
  const [subscription, setSubscription] = useState<any>(null)
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [subData] = await Promise.all([getUserSubscription(user?.id || "")])

      setSubscription(subData)

      // Fetch stats
      const [resumesResult, applicationsResult, coverLettersResult] = await Promise.all([
        supabase.from("resumes").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
        supabase.from("job_applications").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
        supabase.from("cover_letters").select("*", { count: "exact", head: true }).eq("user_id", user?.id),
      ])

      setStats({
        resumes: resumesResult.count || 0,
        applications: applicationsResult.count || 0,
        coverLetters: coverLettersResult.count || 0,
      })

      // Fetch community posts
      const { data: postsData } = await supabase
        .from("community_posts")
        .select("*")
        .eq("is_active", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5)

      setCommunityPosts(postsData || [])

      // Fetch recent activities
      const { data: activitiesData } = await supabase
        .from("user_activities")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(8)

      setRecentActivities(activitiesData || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      id: 1,
      title: "Resume Builder",
      description: "Create professional, ATS-optimized resumes",
      icon: FileText,
      route: "/resume-builder",
      isPremium: false,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      id: 2,
      title: "Cover Letter Generator",
      description: "AI-powered cover letters tailored to job descriptions",
      icon: MessageSquare,
      route: "/cover-letter",
      isPremium: false,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      id: 3,
      title: "ATS Optimizer",
      description: "Optimize your resume for Applicant Tracking Systems",
      icon: Zap,
      route: "/ats-optimizer",
      isPremium: true,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      id: 4,
      title: "Job Applications",
      description: "Track and manage your job applications",
      icon: Briefcase,
      route: "/applications",
      isPremium: false,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
    },
    {
      id: 5,
      title: "Job Board",
      description: "Discover exclusive job opportunities",
      icon: Search,
      route: "/jobs",
      isPremium: false,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200",
    },
    {
      id: 6,
      title: "Interview Prep",
      description: "AI-powered interview practice and feedback",
      icon: MessageSquare,
      route: "/interview-prep",
      isPremium: true,
      isProfessional: true,
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      borderColor: "border-pink-200",
    },
  ]

  const canAccessFeature = (feature: any) => {
    if (!feature.isPremium) return true
    if (feature.isProfessional) {
      return subscription?.plan_type === "professional" || subscription?.plan_type === "corporate"
    }
    return (
      subscription?.plan_type === "premium" ||
      subscription?.plan_type === "professional" ||
      subscription?.plan_type === "corporate"
    )
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "resume_created":
      case "resume_downloaded":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "cover_letter_created":
      case "cover_letter_downloaded":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "job_applied":
        return <Briefcase className="h-4 w-4 text-orange-500" />
      case "ats_optimization":
        return <Zap className="h-4 w-4 text-purple-500" />
      case "interview_session":
        return <MessageSquare className="h-4 w-4 text-pink-500" />
      case "payment_made":
        return <Crown className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getPostTypeColor = (postType: string) => {
    switch (postType) {
      case "announcement":
        return "bg-blue-100 text-blue-800"
      case "update":
        return "bg-green-100 text-green-800"
      case "tip":
        return "bg-yellow-100 text-yellow-800"
      case "success_story":
        return "bg-purple-100 text-purple-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-gray-600 mt-2">Choose a tool to accelerate your job search</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resumes Created</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resumes}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cover Letters</p>
              <p className="text-2xl font-bold text-gray-900">{stats.coverLetters}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
            </div>
            <Briefcase className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature) => {
          const hasAccess = canAccessFeature(feature)
          const FeatureIcon = feature.icon

          return (
            <Card
              key={feature.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${feature.borderColor} ${
                hasAccess ? "hover:scale-105 cursor-pointer" : "opacity-75"
              }`}
            >
              {feature.isPremium && (
                <div className="absolute top-4 right-4">
                  {feature.isProfessional ? (
                    <Badge className="bg-pink-100 text-pink-800 border-pink-200">
                      <Crown className="h-3 w-3 mr-1" />
                      Professional
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              )}

              <CardHeader className={`${feature.bgColor} rounded-t-lg`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white`}>
                    <FeatureIcon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <CardDescription className="text-gray-600 mb-4">{feature.description}</CardDescription>

                {hasAccess ? (
                  <Link href={feature.route}>
                    <div className="w-full bg-gray-900 text-white py-2 px-4 rounded-md text-center hover:bg-gray-800 transition-colors">
                      Open Tool
                    </div>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-md text-center flex items-center justify-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Upgrade Required
                    </div>
                    <Link href="/pricing">
                      <div className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors text-sm">
                        View Plans
                      </div>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bottom Section: Activity Tab (Left) and Community Board (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Tab - Left */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest actions and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500">Start using our tools to see your activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.activity_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleDateString()} at{" "}
                        {new Date(activity.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {recentActivities.length >= 8 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                      View All Activity
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Board - Right */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Community Board
            </CardTitle>
            <CardDescription>Latest updates, announcements, and tips</CardDescription>
          </CardHeader>
          <CardContent>
            {communityPosts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No announcements</p>
                <p className="text-sm text-gray-500">Check back later for updates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <div key={post.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 text-sm">{post.title}</h4>
                        {post.is_pinned && (
                          <Badge variant="outline" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <Badge className={`text-xs ${getPostTypeColor(post.post_type)}`}>
                        {post.post_type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                ))}

                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Posts
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Banner */}
      {(!subscription || subscription.plan_type === "free") && (
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Your Full Potential</h3>
              <p className="text-gray-600 mb-4">
                Upgrade to Premium or Professional to access all AI-powered tools and accelerate your job search.
              </p>
              <Link href="/pricing">
                <div className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <Crown className="h-5 w-5 mr-2" />
                  View Pricing Plans
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
