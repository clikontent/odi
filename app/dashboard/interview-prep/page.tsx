"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { InterviewPrepTool } from "@/components/interview-prep-tool"
import { supabase } from "@/lib/supabaseClient"
import { useUser } from "@/contexts/user-context"
import { Loader2 } from "lucide-react"

export default function InterviewPrepPage() {
  const { user } = useUser()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserId() {
      if (user) {
        setUserId(user.id)
        setLoading(false)
        return
      }

      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
      }
      setLoading(false)
    }

    getUserId()
  }, [user])

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

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : userId ? (
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
