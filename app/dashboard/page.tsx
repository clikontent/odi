import Link from "next/link"
import { Briefcase, FileText, Mail, Star, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SupabaseVerifier } from "@/components/auth/supabase-verifier"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, John!</h2>
        <p className="text-muted-foreground">Here's an overview of your resume building progress</p>
      </div>

      {/* Supabase Connection Verifier - Remove this after confirming connection */}
      <SupabaseVerifier />

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78/100</div>
              <Progress value={78} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">+20% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resumes Created</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-2">2 active, 1 archived</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-2">Last updated 3 days ago</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-2">2 interviews scheduled</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Resume Builder</CardTitle>
            <CardDescription>Create and customize your professional resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/resume-builder">Create Resume</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter Generator</CardTitle>
            <CardDescription>Generate tailored cover letters for job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed">
              <Mail className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/cover-letter">Create Cover Letter</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ATS Optimizer</CardTitle>
            <CardDescription>Optimize your resume for Applicant Tracking Systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed">
              <Star className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/ats-optimizer">Optimize Resume</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

