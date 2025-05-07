import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  job_title: string
  company_name: string
  status: "applied" | "interview" | "offer" | "rejected" | "pending"
  applied_date: string
}

interface RecentApplicationsProps {
  applications: Application[]
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status badge color
  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800"
      case "interview":
        return "bg-purple-100 text-purple-800"
      case "offer":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      {applications.length > 0 ? (
        applications.map((application) => (
          <div key={application.id} className="flex items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{application.job_title}</p>
              <p className="text-sm text-muted-foreground">{application.company_name}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge className={getStatusColor(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(application.applied_date)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet.</p>
          <Button asChild>
            <Link href="/dashboard/job-board">Browse Jobs</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
