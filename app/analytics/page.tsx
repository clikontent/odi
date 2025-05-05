"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { getAnalyticsSummary, getActivityTimeline } from "@/lib/analytics"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AnalyticsPage() {
  const { user, isLoading: isUserLoading } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7days")
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [activityData, setActivityData] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Calculate date range based on selection
        let start = startDate
        let end = endDate

        if (timeRange === "7days") {
          start = subDays(new Date(), 7)
          end = new Date()
        } else if (timeRange === "30days") {
          start = subDays(new Date(), 30)
          end = new Date()
        } else if (timeRange === "90days") {
          start = subDays(new Date(), 90)
          end = new Date()
        }

        setStartDate(start)
        setEndDate(end)

        // Format dates for API
        const startStr = startOfDay(start).toISOString()
        const endStr = endOfDay(end).toISOString()

        // Fetch analytics data
        const summary = await getAnalyticsSummary(user.id, startStr, endStr)
        setAnalyticsData(summary)

        // Fetch activity timeline
        const timeline = await getActivityTimeline(user.id, 20)
        setActivityData(timeline)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, timeRange, startDate, endDate])

  const handleDateRangeChange = (range: string) => {
    setTimeRange(range)
  }

  const formatChartData = () => {
    if (!analyticsData || !analyticsData.eventsByDay) return []

    return Object.entries(analyticsData.eventsByDay).map(([date, count]) => ({
      date,
      count,
    }))
  }

  const formatEventTypeData = () => {
    if (!analyticsData || !analyticsData.eventsByType) return []

    return Object.entries(analyticsData.eventsByType).map(([type, count]) => ({
      type: type.replace(/_/g, " "),
      count,
    }))
  }

  if (isUserLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your activity and usage patterns</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs
            defaultValue="7days"
            value={timeRange}
            onValueChange={handleDateRangeChange}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="7days">Last 7 days</TabsTrigger>
              <TabsTrigger value="30days">Last 30 days</TabsTrigger>
              <TabsTrigger value="90days">Last 90 days</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>

          {timeRange === "custom" && (
            <div className="flex gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span>to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData?.totalEvents || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total events tracked during this period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Most Active Day</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData?.eventsByDay && Object.keys(analyticsData.eventsByDay).length > 0 ? (
                    <>
                      <div className="text-3xl font-bold">
                        {
                          Object.entries(analyticsData.eventsByDay).sort(
                            (a, b) => (b[1] as number) - (a[1] as number),
                          )[0][0]
                        }
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        With{" "}
                        {
                          Object.entries(analyticsData.eventsByDay).sort(
                            (a, b) => (b[1] as number) - (a[1] as number),
                          )[0][1]
                        }{" "}
                        activities
                      </p>
                    </>
                  ) : (
                    <div className="text-3xl font-bold">N/A</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Most Common Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData?.eventsByType && Object.keys(analyticsData.eventsByType).length > 0 ? (
                    <>
                      <div className="text-3xl font-bold">
                        {Object.entries(analyticsData.eventsByType)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))[0][0]
                          .replace(/_/g, " ")}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Performed{" "}
                        {
                          Object.entries(analyticsData.eventsByType).sort(
                            (a, b) => (b[1] as number) - (a[1] as number),
                          )[0][1]
                        }{" "}
                        times
                      </p>
                    </>
                  ) : (
                    <div className="text-3xl font-bold">N/A</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Over Time</CardTitle>
                  <CardDescription>Your activity frequency during the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        count: {
                          label: "Activities",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formatChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity by Type</CardTitle>
                  <CardDescription>Breakdown of your activities by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ChartContainer
                      config={{
                        count: {
                          label: "Count",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatEventTypeData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your most recent actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No recent activity found</p>
                  ) : (
                    activityData.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 border-b pb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {activity.activity_type.charAt(0).toUpperCase() +
                                activity.activity_type.slice(1).replace(/_/g, " ")}
                            </p>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(activity.created_at), "PPp")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.activity_details?.action && (
                              <span className="capitalize">{activity.activity_details.action}</span>
                            )}
                            {activity.activity_details?.entity_id && (
                              <span> - ID: {activity.activity_details.entity_id}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
