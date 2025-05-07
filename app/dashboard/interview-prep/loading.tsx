import { DashboardLayout } from "@/components/dashboard-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function InterviewPrepLoading() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div>
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-4 w-[400px] mt-2" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[350px] mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-[150px] w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full mt-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
