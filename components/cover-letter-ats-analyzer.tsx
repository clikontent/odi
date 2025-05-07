"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AtsAnalysisResult } from "@/types/ai-tools"

interface CoverLetterAtsAnalyzerProps {
  coverLetterText: string
  jobDescription: string
  onAnalysisComplete?: (result: AtsAnalysisResult) => void
}

export function CoverLetterAtsAnalyzer({
  coverLetterText,
  jobDescription,
  onAnalysisComplete,
}: CoverLetterAtsAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AtsAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!coverLetterText || !jobDescription) {
      setError("Cover letter and job description are required for analysis")
      return
    }

    setError(null)
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/analyze-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverLetterText,
          jobDescription,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to analyze cover letter")
      }

      const result = await response.json()
      setAnalysisResult(result)

      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }
    } catch (error: any) {
      console.error("Analysis error:", error)
      setError(error.message || "Failed to analyze cover letter. Please try again.")
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
        <CardTitle className="text-xl">ATS Cover Letter Analysis</CardTitle>
        <CardDescription>Analyze how well your cover letter matches the job description</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !coverLetterText || !jobDescription}
          className="w-full"
        >
          {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isAnalyzing ? "Analyzing..." : "Analyze Cover Letter"}
        </Button>

        {analysisResult && (
          <div className="mt-4 space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold">Match Score</h3>
              <div className="mt-2">
                <span className={`text-4xl font-bold ${getScoreColor(analysisResult.score)}`}>
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
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
      </CardFooter>
    </Card>
  )
}
