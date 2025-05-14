"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateBasedResumeBuilder } from "@/components/template-based-resume-builder"
import { StructuredResumeBuilder } from "@/components/structured-resume-builder"
import { FileText, Layers } from "lucide-react"

export default function ResumeBuilderPage() {
  const [builderType, setBuilderType] = useState<"template" | "structured">("template")

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resume Builder</h1>
        <p className="text-muted-foreground">Create a professional resume that stands out and gets you noticed</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose Your Builder</CardTitle>
          <CardDescription>Select the resume builder that works best for you</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={builderType} onValueChange={(value) => setBuilderType(value as "template" | "structured")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="template">
                <FileText className="h-4 w-4 mr-2" />
                Template-Based Builder
              </TabsTrigger>
              <TabsTrigger value="structured">
                <Layers className="h-4 w-4 mr-2" />
                Structured Builder
              </TabsTrigger>
            </TabsList>
            <TabsContent value="template" className="mt-4">
              <div className="text-sm text-muted-foreground mb-4">
                <p>The Template-Based Builder offers:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Professional templates with customizable designs</li>
                  <li>Real-time preview of your resume</li>
                  <li>Simple and intuitive interface</li>
                  <li>Perfect for quickly creating a polished resume</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="structured" className="mt-4">
              <div className="text-sm text-muted-foreground mb-4">
                <p>The Structured Builder offers:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>More granular control over resume sections</li>
                  <li>Advanced formatting options</li>
                  <li>Section-by-section editing experience</li>
                  <li>Better for complex resumes with many sections</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {builderType === "template" ? <TemplateBasedResumeBuilder /> : <StructuredResumeBuilder />}
    </div>
  )
}
