import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ResumeAnalyzerLoading() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-full max-w-md mb-8" />

          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-8 w-64" />
              </CardTitle>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              </div>

              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
