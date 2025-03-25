"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumeEditor } from "@/components/resume/resume-editor"
import { ResumePreview } from "@/components/resume/resume-preview"
import { TemplateSelector } from "@/components/resume/template-selector"
import { ContentGenerator } from "@/components/ai/content-generator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Eye, Save, Sparkles } from "lucide-react"

export default function ResumeBuilderPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("editor")
  const [selectedTemplate, setSelectedTemplate] = useState("professional")
  const contentRef = useRef<HTMLDivElement>(null)

  const handlePreview = () => {
    router.push("/dashboard/resume-builder/preview")
  }

  const scrollToContent = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resume Builder</h2>
          <p className="text-muted-foreground">Create and customize your professional resume</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
            </TabsList>
            <TabsContent value="templates" className="mt-4">
              <TemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
            </TabsContent>
            <TabsContent value="editor" className="mt-4">
              <div className="space-y-4">
                <ResumeEditor />
                <div className="mt-8" ref={contentRef}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-primary" />
                        AI Content Assistant
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                  </Card>
                </div>
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={scrollToContent}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Suggestions
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-lg border bg-card shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Preview</h3>
              <Button onClick={handlePreview} size="sm" variant="ghost">
                <Eye className="mr-2 h-4 w-4" />
                Full Preview
              </Button>
            </div>
            <div className="p-4 max-h-[800px] overflow-auto">
              <ResumePreview template={selectedTemplate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

