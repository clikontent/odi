"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { InterviewPrepTool } from "@/components/interview-prep-tool"
import { supabase } from "@/lib/supabase"

export default function InterviewPrepPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUserId() {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
      }
    }

    getUserId()
  }, [])

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

          {userId ? (
            <InterviewPrepTool userId={userId} />
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <p className="text-muted-foreground">Please log in to use the interview preparation tool</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
