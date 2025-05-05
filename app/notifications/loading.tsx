import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotificationsLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div>
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[350px] mt-2" />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>
              <Skeleton className="h-6 w-[200px]" />
            </CardTitle>
            <Skeleton className="h-4 w-[300px] mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-[300px] mb-6" />

            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-px w-full mt-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
