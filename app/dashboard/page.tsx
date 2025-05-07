import { supabase } from "@/lib/supabaseClient"
import { safeSupabaseQuery } from "@/lib/fetch-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentApplications } from "@/components/dashboard/recent-applications"
import { ResumeStats } from "@/components/dashboard/resume-stats"
import { CoverLetterStats } from "@/components/dashboard/cover-letter-stats"
import { ErrorFallback } from "@/components/error-fallback"

export default async function DashboardPage() {
  try {
    // Get the current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      throw new Error(`Error fetching session: ${sessionError.message}`)
    }

    if (!session) {
      // Handle not logged in state
      return (
        <div className="flex h-full items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Not Logged In</CardTitle>
              <CardDescription>Please log in to view your dashboard</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
    }

    // Fetch dashboard data
    const userId = session.user.id

    // Use Promise.allSettled to prevent one failed request from blocking others
    const [resumesResult, coverLettersResult, applicationsResult, recentActivityResult] = await Promise.allSettled([
      safeSupabaseQuery(() => supabase.from("resumes").select("*").eq("user_id", userId)),
      safeSupabaseQuery(() => supabase.from("cover_letters").select("*").eq("user_id", userId)),
      safeSupabaseQuery(() =>
        supabase
          .from("job_applications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
      ),
      safeSupabaseQuery(() =>
        supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
      ),
    ])

    // Extract data or set defaults
    const resumes = resumesResult.status === "fulfilled" ? resumesResult.value : []
    const coverLetters = coverLettersResult.status === "fulfilled" ? coverLettersResult.value : []
    const recentApplications = applicationsResult.status === "fulfilled" ? applicationsResult.value : []
    const recentActivity = recentActivityResult.status === "fulfilled" ? recentActivityResult.value : []

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Overview
              resumeCount={resumes.length}
              coverLetterCount={coverLetters.length}
              applicationCount={recentApplications.length}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentApplications applications={recentApplications} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Resume Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumeStats resumes={resumes} />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Cover Letter Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <CoverLetterStats coverLetters={coverLetters} />
                </CardContent>
              </Card>
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {recentActivity.map((activity) => (
                      <li key={activity.id} className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                        <div className="text-sm">
                          {activity.description}
                          <span className="block text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View detailed analytics about your job search</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Analytics content will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent activity across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                      <div className="text-sm">
                        {activity.description}
                        <span className="block text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Error in dashboard page:", error)
    return <ErrorFallback error={error instanceof Error ? error : new Error("Unknown error")} />
  }
}
