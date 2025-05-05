"use client"

import { useState } from "react"
import { analyzeResumeForJobMatch, generateInterviewQuestions } from "@/lib/gemini"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle, FileText, MessageSquare } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    score: number
    missingKeywords: string[]
    suggestions: string[]
  } | null>(null)
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("analysis")
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      setError("Please provide both your resume and the job description")
      return
    }

    setError(null)
    setIsAnalyzing(true)

    try {
      // Analyze resume
      const result = await analyzeResumeForJobMatch(resumeText, jobDescription)
      setAnalysisResult(result)

      // Generate interview questions
      const questions = await generateInterviewQuestions(
        jobDescription.split("\n")[0] || "Job Position", // Use first line as job title
        jobDescription,
      )
      setInterviewQuestions(questions)
    } catch (error: any) {
      console.error("Analysis error:", error)
      setError(error.message || "Failed to analyze resume. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent match!"
    if (score >= 60) return "Good match with room for improvement"
    return "Needs significant improvement"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">AI Resume Analyzer</CardTitle>
        <CardDescription>
          Analyze how well your resume matches a job description and get personalized suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="resume" className="text-sm font-medium">
              Your Resume
            </label>
            <Textarea
              id="resume"
              placeholder="Paste your resume text here..."
              className="min-h-[200px]"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="jobDescription" className="text-sm font-medium">
              Job Description
            </label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here..."
              className="min-h-[200px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleAnalyze} disabled={isAnalyzing || !resumeText || !jobDescription} className="w-full">
          {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
        </Button>

        {analysisResult && (
          <div className="mt-8 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis" className="flex items-center justify-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Resume Analysis
                </TabsTrigger>
                <TabsTrigger value="interview" className="flex items-center justify-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Interview Prep
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-4 space-y-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">Match Score</h3>
                    <div className="mt-2">
                      <span className={`text-5xl font-bold ${getScoreColor(analysisResult.score)}`}>
                        {analysisResult.score}%
                      </span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{getScoreText(analysisResult.score)}</p>
                    <Progress
                      value={analysisResult.score}
                      className="mt-4 h-2"
                      indicatorClassName={
                        analysisResult.score >= 80
                          ? "bg-green-500"
                          : analysisResult.score >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.length > 0 ? (
                        analysisResult.missingKeywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No critical keywords missing!</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Improvement Suggestions</h3>
                    <ul className="space-y-2">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="mr-2 mt-1 h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="interview" className="mt-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Potential Interview Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on the job description, here are some questions you might be asked in an interview:
                  </p>
                  <ul className="space-y-4">
                    {interviewQuestions.map((question, index) => (
                      <li key={index} className="rounded-lg border p-4">
                        <div className="flex items-start">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs mr-3 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span>{question}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Preparation Tip</AlertTitle>
                    <AlertDescription>
                      Practice answering these questions using the STAR method: Situation, Task, Action, and Result.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
      </CardFooter>
    </Card>
  )
}
