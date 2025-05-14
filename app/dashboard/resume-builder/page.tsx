"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AIDragDropResumeBuilder } from "@/components/ai-drag-drop-resume-builder"
import { getResumeTemplates } from "@/lib/templates"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResumeBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resumeId = searchParams.get("id")
  const templateId = searchParams.get("template")
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<any[]>([])
  const [resumeTitle, setResumeTitle] = useState("My Resume")
  const [resumeData, setResumeData] = useState<any | null>(null)
  const [resumeHtml, setResumeHtml] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          setUserId(userData.user.id)
        }

        // Fetch templates
        const templates = await getResumeTemplates()
        if (templates && templates.length > 0) {
          setTemplates(templates)
        }

        // If resumeId is provided, fetch the resume data
        if (resumeId && userData?.user) {
          const { data: resumeData, error } = await supabase
            .from("resumes")
            .select("*")
            .eq("id", resumeId)
            .eq("user_id", userData.user.id)
            .single()

          if (error) {
            console.error("Error fetching resume:", error)
            toast({
              title: "Error",
              description: "Failed to load resume. Please try again.",
              variant: "destructive",
            })
          } else if (resumeData) {
            setResumeTitle(resumeData.title)
            setResumeData(resumeData.content)
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resumeId, supabase])

  const saveResume = async (data: any) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save a resume",
        variant: "destructive",
      })
      return
    }

    try {
      setResumeData(data)

      // Use the templateId from the data
      const templateId = data.templateId

      // Find the selected template
      const selectedTemplate = templates.find((t) => t.id === templateId)

      if (!selectedTemplate) {
        throw new Error("Template not found")
      }

      // Save to resumes table
      const { data: savedResume, error } = await supabase
        .from("resumes")
        .upsert({
          id: resumeId || undefined,
          user_id: userId,
          title: resumeTitle,
          content: data,
          template_id: templateId,
          html_content: data.html,
          is_public: false,
          created_at: resumeId ? undefined : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Your resume has been saved successfully!",
      })

      // If this is a new resume, redirect to the edit page with the new ID
      if (!resumeId && savedResume && savedResume[0]) {
        router.push(`/dashboard/resume-builder?id=${savedResume[0].id}`)
      }
    } catch (error: any) {
      console.error("Error saving resume:", error)
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
            <p className="text-muted-foreground">Create and customize your professional resume</p>
          </div>
          <div className="w-64">
            <Label htmlFor="resumeTitle">Resume Title</Label>
            <Input
              id="resumeTitle"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {templates.length > 0 ? (
          <AIDragDropResumeBuilder initialData={resumeData} onSave={saveResume} templates={templates} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Templates Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No resume templates are currently available. Please try again later.</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
