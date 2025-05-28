"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Download, FileText, Wand2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateCoverLetter } from "@/lib/gemini"
import { checkUsageLimit, incrementUsage } from "@/lib/subscription"

export default function CoverLetterPage() {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [userSkills, setUserSkills] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedLetters, setSavedLetters] = useState<any[]>([])
  const [usageCheck, setUsageCheck] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchSavedLetters()
      checkUsage()
    }
  }, [user])

  const fetchSavedLetters = async () => {
    try {
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error
      setSavedLetters(data || [])
    } catch (error) {
      console.error("Error fetching saved letters:", error)
    }
  }

  const checkUsage = async () => {
    try {
      const usage = await checkUsageLimit(user?.id || "", "cover_letters")
      setUsageCheck(usage)
    } catch (error) {
      console.error("Error checking usage:", error)
    }
  }

  const generateWithAI = async () => {
    if (!jobTitle || !companyName) {
      alert("Please provide job title and company name")
      return
    }

    if (!usageCheck?.allowed) {
      alert("You've reached your monthly cover letter limit. Upgrade your plan to generate more.")
      return
    }

    setIsGenerating(true)
    try {
      const userInfo = {
        skills: userSkills,
        name: user?.user_metadata?.full_name || "Your Name",
      }

      const generatedContent = await generateCoverLetter(userInfo, jobTitle, companyName, jobDescription)
      setContent(generatedContent)

      // Increment usage
      await incrementUsage(user?.id || "", "cover_letters")
      await checkUsage() // Refresh usage
    } catch (error) {
      console.error("Error generating cover letter:", error)
      alert("Error generating cover letter. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const saveCoverLetter = async () => {
    if (!content.trim()) {
      alert("Please write some content first")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase.from("cover_letters").insert({
        user_id: user?.id,
        title: `${jobTitle} at ${companyName}` || "Untitled Cover Letter",
        content: content,
        job_title: jobTitle,
        company_name: companyName,
      })

      if (error) throw error
      alert("Cover letter saved successfully!")
      await fetchSavedLetters()
    } catch (error) {
      console.error("Error saving cover letter:", error)
      alert("Error saving cover letter")
    } finally {
      setIsSaving(false)
    }
  }

  const loadSavedLetter = (letter: any) => {
    setContent(letter.content)
    setJobTitle(letter.job_title || "")
    setCompanyName(letter.company_name || "")
  }

  const formatContent = (text: string) => {
    return text.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cover Letter Generator</h1>
        <p className="text-gray-600 mt-2">Create compelling cover letters with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Editor */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Job Details
              </CardTitle>
              <CardDescription>Provide information about the position you're applying for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here for better AI generation..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="userSkills">Your Key Skills</Label>
                <Textarea
                  id="userSkills"
                  value={userSkills}
                  onChange={(e) => setUserSkills(e.target.value)}
                  placeholder="List your relevant skills and experience..."
                  rows={3}
                />
              </div>

              <Button onClick={generateWithAI} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>

              {usageCheck && (
                <div className="text-sm text-gray-600">
                  Usage: {usageCheck.current}/{usageCheck.limit === -1 ? "∞" : usageCheck.limit} this month
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter Content</CardTitle>
              <CardDescription>Write or edit your cover letter content</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your cover letter here, or use AI to generate one..."
                rows={15}
                className="w-full"
              />

              <div className="flex space-x-4 mt-4">
                <Button onClick={saveCoverLetter} disabled={isSaving} variant="outline">
                  {isSaving ? "Saving..." : "Save Letter"}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Letters */}
          {savedLetters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Cover Letters</CardTitle>
                <CardDescription>Load a previously saved cover letter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedLetters.map((letter) => (
                    <div
                      key={letter.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => loadSavedLetter(letter)}
                    >
                      <div>
                        <p className="font-medium text-sm">{letter.title}</p>
                        <p className="text-xs text-gray-500">{new Date(letter.created_at).toLocaleDateString()}</p>
                      </div>
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:sticky lg:top-8">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See how your cover letter will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[600px]">
                {content ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user?.user_metadata?.full_name || "Your Name"}
                      </h3>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>

                    <div className="mb-6">
                      <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
                      {companyName && (
                        <div className="mt-2">
                          <p className="font-medium">{companyName}</p>
                          {jobTitle && <p className="text-gray-600">Re: {jobTitle} Position</p>}
                        </div>
                      )}
                    </div>

                    <div className="text-gray-800">{formatContent(content)}</div>

                    <div className="mt-6">
                      <p>Sincerely,</p>
                      <p className="font-medium">{user?.user_metadata?.full_name || "Your Name"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 mb-4" />
                      <p>Your cover letter preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
