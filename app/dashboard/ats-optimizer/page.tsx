"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Upload } from "lucide-react"
import { ResumeAnalyzer } from "@/components/ai/resume-analyzer"

export default function AtsOptimizerPage() {
  const [resumeContent, setResumeContent] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real implementation, this would parse the file content
    // For now, we'll just simulate reading the file
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        // Simulate extracting text from the resume
        setResumeContent("Sample resume content extracted from uploaded file.")
        setActiveTab("analyze")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ATS Optimizer</h2>
        <p className="text-muted-foreground">Optimize your resume for Applicant Tracking Systems</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="analyze" disabled={!resumeContent}>
            Analyze
          </TabsTrigger>
          <TabsTrigger value="optimize" disabled={!resumeContent}>
            Optimize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>Upload your resume to analyze and optimize for ATS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="resume-file">Upload Resume</Label>
                  <div className="flex items-center gap-2">
                    <Input id="resume-file" type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX, TXT</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume-text">Or paste your resume text</Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Paste your resume content here..."
                    rows={10}
                    value={resumeContent}
                    onChange={(e) => setResumeContent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-description">Job Description (Optional)</Label>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here for targeted analysis..."
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Adding a job description helps tailor the analysis to specific requirements
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("analyze")} disabled={!resumeContent} className="w-full">
                Continue to Analysis
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <ResumeAnalyzer resumeContent={resumeContent} jobDescription={jobDescription} />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("upload")}>
              Back
            </Button>
            <Button onClick={() => setActiveTab("optimize")}>Continue to Optimization</Button>
          </div>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Resume Optimization</CardTitle>
              <CardDescription>Let AI help you optimize your resume for ATS systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Keyword Optimization</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Our AI will add relevant keywords from the job description to your resume, increasing your chances of
                  passing ATS filters.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Format Enhancement</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  We'll ensure your resume uses a clean, ATS-friendly format that can be properly parsed by applicant
                  tracking systems.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium">Content Improvement</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Our AI will suggest improvements to your resume content, including stronger action verbs and
                  quantifiable achievements.
                </p>
              </div>

              <div className="rounded-md bg-muted p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Premium Feature</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI Resume Optimization is a premium feature. Upgrade your account to access this and other
                      advanced features.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("analyze")}>
                Back
              </Button>
              <Button>Upgrade to Premium</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

