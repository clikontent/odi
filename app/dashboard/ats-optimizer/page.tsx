"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileCheck, AlertTriangle, CheckCircle, Upload, Download, Lightbulb } from "lucide-react"

export default function ATSOptimizer() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<null | {
    score: number
    missingKeywords: string[]
    suggestions: string[]
    matchedKeywords: string[]
  }>(null)

  const handleAnalyze = () => {
    if (!resumeText || !jobDescription) return

    setIsAnalyzing(true)

    // Simulate AI analysis with a timeout
    setTimeout(() => {
      // Mock analysis result
      const result = {
        score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100
        missingKeywords: ["project management", "agile methodology", "stakeholder communication"],
        suggestions: [
          "Add more specific achievements with quantifiable results",
          "Include relevant certifications and training",
          "Highlight experience with project management tools",
          "Add more industry-specific terminology from the job description",
        ],
        matchedKeywords: [
          "team leadership",
          "budget management",
          "strategic planning",
          "data analysis",
          "client relations",
        ],
      }

      setAnalysisResult(result)
      setIsAnalyzing(false)
    }, 2500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would parse the resume file
    // For this demo, we'll just simulate reading the file
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setResumeText(
          "Sample resume content extracted from uploaded file...\n\nProfessional Experience:\n- Led cross-functional teams to deliver projects on time and within budget\n- Analyzed data to identify trends and make strategic recommendations\n- Managed client relationships and ensured high satisfaction rates\n\nSkills:\n- Team leadership\n- Budget management\n- Strategic planning\n- Data analysis\n- Client relations",
        )
      }
    }
    reader.readAsText(file)
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ATS Optimizer</h1>
            <p className="text-muted-foreground">Analyze and optimize your resume for Applicant Tracking Systems</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Content</CardTitle>
                  <CardDescription>Paste your resume text or upload a file</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste your resume content here..."
                    className="min-h-[300px]"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="relative" asChild>
                      <label>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Resume
                        <Input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX, TXT</p>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                  <CardDescription>Paste the job description to match your resume against</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px]"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !resumeText || !jobDescription}
                    className="w-full"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>ATS Analysis Results</CardTitle>
                  <CardDescription>See how well your resume matches the job description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="text-center text-muted-foreground">
                        Analyzing your resume against the job description...
                      </p>
                    </div>
                  ) : analysisResult ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">ATS Compatibility Score</h3>
                          <span
                            className={`font-bold ${
                              analysisResult.score >= 80
                                ? "text-green-500"
                                : analysisResult.score >= 60
                                  ? "text-amber-500"
                                  : "text-red-500"
                            }`}
                          >
                            {analysisResult.score}%
                          </span>
                        </div>
                        <Progress value={analysisResult.score} className="h-2" />
                        <div className="flex items-center gap-2 text-sm">
                          {analysisResult.score >= 80 ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              <CheckCircle className="mr-1 h-3 w-3" /> Excellent Match
                            </Badge>
                          ) : analysisResult.score >= 60 ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              <AlertTriangle className="mr-1 h-3 w-3" /> Good Match - Needs Improvement
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              <AlertTriangle className="mr-1 h-3 w-3" /> Poor Match - Significant Changes Needed
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Matched Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.matchedKeywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500/20"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" /> {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Missing Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.missingKeywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-red-500/10 text-red-500 border-red-500/20"
                            >
                              <AlertTriangle className="mr-1 h-3 w-3" /> {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Improvement Suggestions</h3>
                        <div className="space-y-2">
                          {analysisResult.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-sm">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                      <FileCheck className="h-16 w-16 text-muted-foreground" />
                      <div className="text-center space-y-2">
                        <h3 className="font-medium">Ready to analyze your resume</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your resume and a job description, then click "Analyze Resume" to see how well they
                          match.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  {analysisResult && (
                    <>
                      <div className="flex gap-2 w-full">
                        <Button className="flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Download Report
                        </Button>
                        <Button variant="outline" className="flex-1" asChild>
                          <a href="/dashboard/resume-builder">Edit Resume</a>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Our AI analyzes your resume against the job description to identify missing keywords and provide
                        suggestions for improvement.
                      </p>
                    </>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
