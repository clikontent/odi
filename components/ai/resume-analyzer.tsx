"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Lightbulb, Wand2 } from "lucide-react"

interface ResumeAnalyzerProps {
  resumeContent: string
  jobDescription?: string
}

export function ResumeAnalyzer({ resumeContent, jobDescription }: ResumeAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [scores, setScores] = useState({
    overall: 0,
    relevance: 0,
    completeness: 0,
    formatting: 0,
    keywords: 0,
  })
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [keywords, setKeywords] = useState<{ word: string; found: boolean }[]>([])
  const [improvements, setImprovements] = useState<{ section: string; suggestion: string }[]>([])

  const analyzeResume = async () => {
    setIsAnalyzing(true)

    try {
      // In a real implementation, this would call an AI service using the Gemini API
      // const response = await fetch('/api/analyze-resume', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ resumeContent, jobDescription })
      // })
      // const data = await response.json()

      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock response data
      const data = {
        scores: {
          overall: 72,
          relevance: 65,
          completeness: 80,
          formatting: 85,
          keywords: 60,
        },
        suggestions: [
          "Add more quantifiable achievements to your work experience",
          "Include more industry-specific keywords from the job description",
          "Improve your skills section with more technical competencies",
          "Use more action verbs in your experience descriptions",
          "Add a professional summary that highlights your key qualifications",
        ],
        keywords: [
          { word: "JavaScript", found: true },
          { word: "React", found: true },
          { word: "Node.js", found: true },
          { word: "TypeScript", found: false },
          { word: "API Development", found: true },
          { word: "Agile", found: false },
          { word: "Project Management", found: true },
          { word: "CI/CD", found: false },
          { word: "Cloud Infrastructure", found: false },
        ],
        improvements: [
          { section: "Work Experience", suggestion: "Add metrics and quantifiable results to demonstrate impact" },
          { section: "Skills", suggestion: "Organize skills by category and highlight proficiency levels" },
          { section: "Education", suggestion: "Include relevant coursework and academic achievements" },
          { section: "Summary", suggestion: "Tailor your summary to match the specific job requirements" },
        ],
      }

      setScores(data.scores)
      setSuggestions(data.suggestions)
      setKeywords(data.keywords)
      setImprovements(data.improvements)
      setAnalyzed(true)
    } catch (error) {
      console.error("Error analyzing resume:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Resume Analysis</CardTitle>
        <CardDescription>Get AI-powered feedback on your resume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analyzed ? (
          <>
            {jobDescription ? null : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description (Optional)</label>
                <Textarea placeholder="Paste the job description here for more targeted analysis..." rows={4} />
                <p className="text-xs text-muted-foreground">
                  Adding a job description helps tailor the analysis to specific requirements
                </p>
              </div>
            )}

            <Button onClick={analyzeResume} disabled={isAnalyzing || !resumeContent} className="w-full">
              <Wand2 className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className="text-sm font-medium">{scores.overall}%</span>
                </div>
                <Progress value={scores.overall} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Relevance</span>
                  <span className="text-sm font-medium">{scores.relevance}%</span>
                </div>
                <Progress value={scores.relevance} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completeness</span>
                  <span className="text-sm font-medium">{scores.completeness}%</span>
                </div>
                <Progress value={scores.completeness} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Formatting</span>
                  <span className="text-sm font-medium">{scores.formatting}%</span>
                </div>
                <Progress value={scores.formatting} className="h-2" />
              </div>
            </div>

            <Tabs defaultValue="suggestions">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="improvements">Improvements</TabsTrigger>
              </TabsList>

              <TabsContent value="suggestions" className="space-y-4 pt-4">
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="keywords" className="pt-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Keywords found in the job description:</p>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                          keyword.found
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {keyword.found ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        <span>{keyword.word}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium">Keyword Match Rate: {scores.keywords}%</p>
                    <p className="text-muted-foreground mt-1">
                      {scores.keywords >= 80
                        ? "Excellent keyword matching! Your resume is well-optimized for ATS."
                        : scores.keywords >= 60
                          ? "Good keyword matching, but consider adding more relevant terms."
                          : "Your resume needs more relevant keywords to pass ATS filters."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="improvements" className="pt-4">
                <div className="space-y-4">
                  {improvements.map((item, index) => (
                    <div key={index} className="rounded-md border p-3">
                      <h4 className="font-medium">{item.section}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      {analyzed && (
        <CardFooter>
          <Button variant="outline" onClick={() => setAnalyzed(false)} className="w-full">
            Analyze Again
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

