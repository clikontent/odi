"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ResumeAnalyzer } from "@/components/resume-analyzer"

export default function ResumeAnalyzerPage() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Resume Analyzer</h1>
          <p className="mb-8 text-muted-foreground">
            Use AI to analyze how well your resume matches a job description and get personalized suggestions
          </p>

          <ResumeAnalyzer />
        </div>
      </div>
    </DashboardLayout>
  )
}
