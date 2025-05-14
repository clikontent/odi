"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, MessageSquare, Briefcase, Building } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { generateInterviewQuestions } from "@/lib/ai-integration-service"
import type { InterviewQuestion, CoverLetterData, ResumeData } from "@/types/ai-tools"
import { useAuth } from "@/contexts/auth-provider"

export function InterviewPrepTool() {
  const { user } = useAuth()
  const userId = user?.id

  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
  const [coverLetters, setCoverLetters] = useState<CoverLetterData[]>([])
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<string>("")
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("questions")
  const [coverLetterText, setCoverLetterText] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)

  const [hasFetchedDocuments, setHasFetchedDocuments] = useState(false)

  useEffect(() => {
    if (userId && !hasFetchedDocuments) {
      fetchUserDocuments()
      setHasFetchedDocuments(true)
    }
  }, [userId, hasFetchedDocuments])

  async function fetchUserDocuments() {
    setIsLoadingDocuments(true)
    try {
      // Fetch cover letters
      const { data: coverLettersData, error: coverLettersError } = await supabase
        .from("cover_letters")
        .select("id, title, content, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (coverLettersError) throw coverLettersError
      setCoverLetters(coverLettersData || [])

      // Fetch resumes
      const { data: resumesData, error: resumesError } = await supabase
        .from("resumes")
        .select("id, title, content, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (resumesError) throw resumesError
      setResumes(resumesData || [])
    } catch (error) {
      console.error("Error fetching user documents:", error)
      setError("Failed to load your documents. Please try again.")
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  useEffect(() => {
    async function fetchCoverLetterContent() {
      if (!selectedCoverLetterId) {
        setCoverLetterText("")
        return
      }

      try {
        const { data, error } = await supabase
          .from("cover_letters")
          .select("content")
          .eq("id", selectedCoverLetterId)
          .single()

        if (error) throw error
        if (data && data.content) {
          setCoverLetterText(data.content.generatedText || "")

          // If job details are empty, try to populate from cover letter
          if (!jobTitle && data.content.jobInfo) {
            setJobTitle(data.content.jobInfo.jobTitle || "")
            setJobDescription(data.content.jobInfo.jobDescription || "")
          }
        }
      } catch (error) {
        console.error("Error fetching cover letter:", error)
      }
    }

    fetchCoverLetterContent()
  }, [selectedCoverLetterId, jobTitle])

  useEffect(() => {
    async function fetchResumeContent() {
      if (!selectedResumeId) {
        setResumeText("")
        return
      }

      try {
        const { data, error } = await supabase.from("resumes").select("content").eq("id", selectedResumeId).single()

        if (error) throw error
        if (data && data.content) {
          // This assumes resume content has a text representation
          setResumeText(data.content.fullText || "")
        }
      } catch (error) {
        console.error("Error fetching resume:", error)
      }
    }

    fetchResumeContent()
  }, [selectedResumeId])

  const handleGenerateQuestions = async () => {
    if (!jobTitle || !jobDescription) {
      setError("Job title and description are required")
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const questions = await generateInterviewQuestions(jobTitle, jobDescription, coverLetterText, resumeText)

      setInterviewQuestions(questions)
      setActiveTab("questions")
    } catch (error: any) {
      console.error("Error generating questions:", error)
      setError(error.message || "Failed to generate interview questions. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!userId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>You need to be logged in to use this feature</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Please log in again to continue</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Interview Preparation Tool</CardTitle>
        <CardDescription>
          Generate personalized interview questions based on your job application materials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <input
                id="jobTitle"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div>
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="min-h-[150px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Select Cover Letter (Optional)</Label>
              <Select value={selectedCoverLetterId} onValueChange={setSelectedCoverLetterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a cover letter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {coverLetters.map((letter) => (
                    <SelectItem key={letter.id} value={letter.id}>
                      {letter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Resume (Optional)</Label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !jobTitle || !jobDescription}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Generate Interview Questions
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {interviewQuestions.length > 0 && (
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="questions" className="flex items-center justify-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Questions
                </TabsTrigger>
                <TabsTrigger value="job" className="flex items-center justify-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Job Insights
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center justify-center">
                  <Building className="mr-2 h-4 w-4" />
                  Company Research
                </TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="mt-4 space-y-4">
                <h3 className="text-lg font-medium">Potential Interview Questions</h3>
                <ul className="space-y-4">
                  {interviewQuestions.map((question, index) => (
                    <li key={index} className="rounded-lg border p-4">
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs mr-3 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-medium">{question.question}</span>
                        </div>

                        {question.context && (
                          <div className="ml-9 text-sm text-muted-foreground">
                            <strong>Context:</strong> {question.context}
                          </div>
                        )}

                        {question.suggestedAnswer && (
                          <div className="ml-9 mt-2 p-3 bg-muted rounded-md text-sm">
                            <strong>Suggested approach:</strong> {question.suggestedAnswer}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="job" className="mt-4 space-y-4">
                <h3 className="text-lg font-medium">Job-Specific Preparation</h3>
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">Research Required Skills</h4>
                          <p className="text-sm text-muted-foreground">
                            Make a list of all technical and soft skills mentioned in the job description. Prepare
                            examples of how you've demonstrated each skill.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">Understand the Role's Challenges</h4>
                          <p className="text-sm text-muted-foreground">
                            Consider what challenges someone in this position might face and how you would address them.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">Prepare Your Success Stories</h4>
                          <p className="text-sm text-muted-foreground">
                            Develop 3-5 detailed examples of past achievements that demonstrate your qualifications for
                            this role.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="mt-4 space-y-4">
                <h3 className="text-lg font-medium">Company Research Checklist</h3>
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-700">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">Company Mission and Values</h4>
                          <p className="text-sm text-muted-foreground">
                            Review the company's mission statement and core values. Prepare to discuss how your personal
                            values align.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-700">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">Recent News and Developments</h4>
                          <p className="text-sm text-muted-foreground">
                            Research recent company news, product launches, or industry developments that might affect
                            the organization.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-700">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">Competitive Landscape</h4>
                          <p className="text-sm text-muted-foreground">
                            Understand the company's main competitors and what differentiates this organization in the
                            market.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
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
