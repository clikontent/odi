"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { InterviewPrepTool } from "@/components/interview-prep-tool"
import { useAuth } from "@/contexts/auth-provider"

export default function InterviewPrepPage() {
  const { isLoading } = useAuth()

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interview Preparation</h1>
            <p className="text-muted-foreground">
              Generate personalized interview questions and prepare for your job interviews
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <InterviewPrepTool />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
