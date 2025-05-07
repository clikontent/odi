import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, PenTool, Briefcase, TrendingUp } from "lucide-react"

interface OverviewProps {
  resumeCount: number
  coverLetterCount: number
  applicationCount: number
}

export function Overview({ resumeCount, coverLetterCount, applicationCount }: OverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resumeCount}</div>
          <p className="text-xs text-muted-foreground">+{Math.max(0, resumeCount - 1)} from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
          <PenTool className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{coverLetterCount}</div>
          <p className="text-xs text-muted-foreground">+{Math.max(0, coverLetterCount - 1)} from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Applications</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applicationCount}</div>
          <p className="text-xs text-muted-foreground">+{Math.max(0, applicationCount - 1)} from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {applicationCount > 0 ? Math.round((1 / applicationCount) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">+0% from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}
