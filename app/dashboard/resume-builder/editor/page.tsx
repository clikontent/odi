"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumeEditor } from "@/components/resume/resume-editor"
import { ContentGenerator } from "@/components/ai/content-generator"
import { ArrowLeft, Save, Sparkles } from "lucide-react"

export default function ResumeEditorPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("editor")

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Resume Editor</h2>
            <p className="text-muted-foreground">Edit and customize your resume content</p>
          </div>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Manual Editor</TabsTrigger>
          <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <ResumeEditor />
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Content Assistant</CardTitle>
                <CardDescription>Let AI help you create professional resume content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our AI assistant can help you generate professional content for different sections of your resume.
                  Select a section below to get started.
                </p>

                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="pt-4">
                    <ContentGenerator type="summary" />
                  </TabsContent>

                  <TabsContent value="experience" className="pt-4">
                    <ContentGenerator type="experience" />
                  </TabsContent>

                  <TabsContent value="skills" className="pt-4">
                    <ContentGenerator type="skills" />
                  </TabsContent>

                  <TabsContent value="education" className="pt-4">
                    <ContentGenerator type="education" />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("editor")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Apply to Resume
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Writing Tips</CardTitle>
                <CardDescription>Tips to improve your resume content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Use Action Verbs</h3>
                  <p className="text-sm text-muted-foreground">
                    Start bullet points with strong action verbs like "Achieved," "Implemented," "Developed," or "Led"
                    to make your accomplishments stand out. Action verbs convey confidence and demonstrate your
                    proactive approach.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Quantify Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Include numbers and percentages to quantify your achievements. For example, "Increased sales by 25%"
                    or "Managed a team of 12 developers" provides concrete evidence of your impact.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Tailor to the Job</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your resume for each job application by including relevant keywords from the job
                    description. This helps your resume pass through Applicant Tracking Systems (ATS).
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Be Concise</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep your resume content concise and focused. Use short, impactful statements rather than long
                    paragraphs. Aim for clarity and brevity.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Highlight Relevant Skills</h3>
                  <p className="text-sm text-muted-foreground">
                    Emphasize skills that are most relevant to the position you're applying for. Place the most
                    important skills at the beginning of your skills section.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

