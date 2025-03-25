import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Download, FileText, TrendingUp, Users } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of platform statistics and user activity</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,248</div>
                <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resumes Created</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,587</div>
                <p className="text-xs text-muted-foreground mt-2">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,845</div>
                <p className="text-xs text-muted-foreground mt-2">+24% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32.5%</div>
                <p className="text-xs text-muted-foreground mt-2">+4.3% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>User registrations and active users over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Activity chart will appear here</span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Popular Templates</CardTitle>
                <CardDescription>Most used resume templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-primary"></div>
                      <span>Professional</span>
                    </div>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                      <span>Modern</span>
                    </div>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span>Minimalist</span>
                    </div>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                      <span>Creative</span>
                    </div>
                    <span className="font-medium">12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Detailed analytics will be displayed here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <BarChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Analytics dashboard will appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 rounded-md flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Reports will appear here</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

