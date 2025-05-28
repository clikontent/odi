"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, FileText, Target, TrendingUp, Crown, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { checkUsageLimit, incrementUsage, getUserSubscription } from "@/lib/subscription"

export default function ATSOptimizerPage() {
  const { user } = useAuth()
  const [resumeContent, setResumeContent] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [optimization, setOptimization] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [usageCheck, setUsageCheck] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const [subData, usageData] = await Promise.all([
        getUserSubscription(user?.id || ""),
        checkUsageLimit(user?.id || "", "ats_optimizations"),
      ])

      setSubscription(subData)
      setUsageCheck(usageData)
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const analyzeResume = async () => {
    if (!resumeContent.trim() || !jobDescription.trim()) {
      alert("Please provide both resume content and job description")
      return
    }

    if (!usageCheck?.allowed && subscription?.plan_type === "free") {
      alert("You've reached your ATS optimization limit. Upgrade your plan to continue.")
      return
    }

    setLoading(true)
    try {
      const optimizationType =
        subscription?.plan_type === "professional"
          ? "advanced"
          : subscription?.plan_type === "premium"
            ? "full"
            : "basic"

      // For demo purposes, we'll create a mock analysis
      // In production, this would call your AI service
      const mockAnalysis = {
        keyword_score: Math.floor(Math.random() * 40) + 60, // 60-100
        ats_score: Math.floor(Math.random() * 30) + 70, // 70-100
        missing_keywords: ["JavaScript", "React", "Node.js", "AWS", "Agile"],
        suggestions: [
          "Add more relevant keywords from the job description",
          "Use standard section headings like 'Work Experience' and 'Education'",
          "Include specific technologies mentioned in the job posting",
          "Quantify your achievements with numbers and percentages",
          "Use bullet points for better readability",
        ],
        strengths: ["Good use of action verbs", "Clear contact information", "Relevant work experience"],
        weaknesses: [
          "Missing key technical skills",
          "Could use more quantified achievements",
          "Some formatting issues detected",
        ],
      }

      if (optimizationType === "advanced") {
        mockAnalysis.detailed_recommendations = [
          "Restructure your technical skills section to match the job requirements exactly",
          "Add a 'Key Achievements' section with specific metrics and results",
          "Include industry-specific certifications and training",
          "Optimize your professional summary with keywords from the job description",
        ]
      }

      // Save to database
      const { data, error } = await supabase
        .from("ats_optimizations")
        .insert({
          user_id: user?.id,
          job_description: jobDescription,
          optimization_type: optimizationType,
          suggestions: mockAnalysis.suggestions,
          keyword_score: mockAnalysis.keyword_score,
          ats_score: mockAnalysis.ats_score,
        })
        .select()
        .single()

      if (error) throw error

      setOptimization(mockAnalysis)
      await incrementUsage(user?.id || "", "ats_optimizations")
    } catch (error) {
      console.error("Error analyzing resume:", error)
      alert("Error analyzing resume. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ATS Resume Optimizer</h1>
        <p className="text-gray-600 mt-2">
          Optimize your resume for Applicant Tracking Systems and improve your chances of getting noticed
        </p>
      </div>

      {/* Usage Alert */}
      {subscription?.plan_type === "free" && !usageCheck?.allowed && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've used {usageCheck?.current} of {usageCheck?.limit} ATS optimizations this month. Upgrade your plan for
            more optimizations.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Resume Content
              </CardTitle>
              <CardDescription>Paste your resume content here for ATS analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resumeContent}
                onChange={(e) => setResumeContent(e.target.value)}
                placeholder="Paste your resume content here..."
                rows={12}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Job Description
              </CardTitle>
              <CardDescription>Paste the job description you're targeting</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={8}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Button
            onClick={analyzeResume}
            disabled={loading || !resumeContent.trim() || !jobDescription.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {optimization ? (
            <>
              {/* Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    ATS Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-lg ${getScoreBackground(optimization.ats_score)}`}>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(optimization.ats_score)}`}>
                          {optimization.ats_score}%
                        </div>
                        <div className="text-sm text-gray-600">ATS Score</div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${getScoreBackground(optimization.keyword_score)}`}>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(optimization.keyword_score)}`}>
                          {optimization.keyword_score}%
                        </div>
                        <div className="text-sm text-gray-600">Keyword Match</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall ATS Compatibility</span>
                        <span>{optimization.ats_score}%</span>
                      </div>
                      <Progress value={optimization.ats_score} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Keyword Optimization</span>
                        <span>{optimization.keyword_score}%</span>
                      </div>
                      <Progress value={optimization.keyword_score} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Missing Keywords */}
              {optimization.missing_keywords && optimization.missing_keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Missing Keywords</CardTitle>
                    <CardDescription>
                      Important keywords from the job description that are missing from your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {optimization.missing_keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Suggestions</CardTitle>
                  <CardDescription>Recommendations to improve your resume's ATS compatibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimization.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Recommendations (Professional Plan) */}
              {subscription?.plan_type === "professional" && optimization.detailed_recommendations && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-900">
                      <Crown className="mr-2 h-5 w-5" />
                      Advanced Recommendations
                    </CardTitle>
                    <CardDescription className="text-purple-700">
                      Professional-level insights for maximum ATS optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {optimization.detailed_recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Crown className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-800">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Optimize</h3>
                <p className="text-gray-600 text-center">
                  Provide your resume content and job description to get started with ATS optimization
                </p>
              </CardContent>
            </Card>
          )}

          {/* Plan Upgrade Prompt */}
          {subscription?.plan_type === "free" && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Crown className="mr-2 h-5 w-5" />
                  Unlock Advanced ATS Features
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Upgrade to get unlimited optimizations and advanced insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-blue-800 mb-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Unlimited ATS optimizations
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Advanced keyword analysis
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Industry-specific recommendations
                  </div>
                </div>
                <Button className="w-full">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
