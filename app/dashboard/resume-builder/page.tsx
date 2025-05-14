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
import { useAuth } from "@/contexts/auth-provider"

export default function ResumeBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<any[]>([])
  const [resumeTitle, setResumeTitle] = useState("My Resume")
  const [resumeData, setResumeData] = useState<any | null>(null)
  const [resumeHtml, setResumeHtml] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true)
        const templates = await getResumeTemplates()

        if (templates && templates.length > 0) {
          setTemplates(templates)
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
        toast({
          title: "Error",
          description: "Failed to load resume templates. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const saveResume = async (data: any) => {
    if (!user?.id) {
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

      // Generate HTML
      const html = selectedTemplate.html_content
      // TODO: Generate complete HTML using the data and template

      setResumeHtml(html)

      // Save to resumes table through the API
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: resumeTitle,
          data,
          templateId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save resume")
      }

      toast({
        title: "Success",
        description: "Your resume has been saved successfully!",
      })

      // Redirect to preview
      router.push("/dashboard/resume-builder/preview")
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground">Create and customize your professional resume</p>
        </div>

        {templates.length > 0 ? (
          <AIDragDropResumeBuilder onSave={saveResume} templates={templates} />
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
