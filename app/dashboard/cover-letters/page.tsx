"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Save, Sparkles, Eye, Loader2, FileText, MessageSquare } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { trackAIUsage } from "@/lib/gemini"
import { getCoverLetterTemplates } from "@/lib/templates"
import type { CoverLetterTemplate } from "@/lib/supabase"
import { CoverLetterAtsAnalyzer } from "@/components/cover-letter-ats-analyzer"
import type { AtsAnalysisResult } from "@/types/ai-tools"

export default function CoverLetterGenerator() {
  const [coverLetterTitle, setCoverLetterTitle] = useState("My Cover Letter")
  const [jobInfo, setJobInfo] = useState({
    companyName: "",
    jobTitle: "",
    hiringManager: "",
    jobDescription: "",
  })

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    relevantExperience: "",
  })

  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<CoverLetterTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [previewHtml, setPreviewHtml] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [atsAnalysisResult, setAtsAnalysisResult] = useState<AtsAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState("edit")

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data } = await supabase.auth.getUser()
        const isPremiumUser = data?.user ? true : false // For demo purposes, consider all logged-in users as premium

        if (data?.user) {
          setUserId(data.user.id)
        }

        const templates = await getCoverLetterTemplates(isPremiumUser)

        if (templates && templates.length > 0) {
          setTemplates(templates)
          setSelectedTemplateId(templates[0].id)
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleJobInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJobInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({ ...prev, [name]: value }))
  }

  const generateCoverLetterContent = async () => {
    if (!userId || !jobInfo.companyName || !jobInfo.jobTitle || !personalInfo.fullName) {
      alert("Please fill in the required fields: Company Name, Job Title, and Full Name")
      return
    }

    setIsGenerating(true)

    try {
      // Extract skills from relevant experience
      const skills = personalInfo.relevantExperience
        .split(/[,.]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 30)

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: jobInfo.jobTitle,
          companyName: jobInfo.companyName,
          jobDescription: jobInfo.jobDescription,
          relevantExperience: personalInfo.relevantExperience,
          skills,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API error:", errorData)
        throw new Error(errorData.error || "Failed to generate cover letter")
      }

      const data = await response.json()
      const coverLetterText = data.coverLetter

      setGeneratedCoverLetter(coverLetterText)

      // Apply the generated text to the selected template
      if (selectedTemplateId) {
        const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)
        if (selectedTemplate) {
          let html = selectedTemplate.html_content

          // Replace placeholders
          html = html.replace(/{{personal.firstName}}/g, personalInfo.fullName.split(" ")[0] || "")
          html = html.replace(/{{personal.lastName}}/g, personalInfo.fullName.split(" ").slice(1).join(" ") || "")
          html = html.replace(/{{personal.fullName}}/g, personalInfo.fullName || "")
          html = html.replace(/{{personal.email}}/g, personalInfo.email || "")
          html = html.replace(/{{personal.phone}}/g, personalInfo.phone || "")
          html = html.replace(/{{personal.address}}/g, personalInfo.address || "")
          html = html.replace(/{{date}}/g, new Date().toLocaleDateString())
          html = html.replace(/{{recipient.name}}/g, jobInfo.hiringManager || "Hiring Manager")
          html = html.replace(/{{recipient.title}}/g, "Hiring Manager")
          html = html.replace(/{{recipient.company}}/g, jobInfo.companyName || "")
          html = html.replace(/{{recipient.address}}/g, "")

          // Split the cover letter into paragraphs
          const paragraphs = coverLetterText.split("\n\n")

          html = html.replace(/{{opening}}/g, paragraphs[0] || "")
          html = html.replace(/{{body1}}/g, paragraphs[1] || "")
          html = html.replace(/{{body2}}/g, paragraphs[2] || "")
          html = html.replace(/{{closing}}/g, paragraphs[3] || "")

          // Add CSS
          if (selectedTemplate.css_content) {
            html = `<style>${selectedTemplate.css_content}</style>${html}`
          }

          setPreviewHtml(html)
        }
      }

      // Track AI usage
      await trackAIUsage("generate_cover_letter", 500, userId)
    } catch (error) {
      console.error("Error generating cover letter:", error)
      alert("Failed to generate cover letter. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const saveCoverLetter = async () => {
    if (!userId) {
      alert("You must be logged in to save a cover letter")
      return
    }

    try {
      // Prepare the content
      const content = {
        jobInfo,
        personalInfo,
        generatedText: generatedCoverLetter,
        atsAnalysis: atsAnalysisResult || null,
      }

      // Save to cover_letters table
      const { data, error } = await supabase.from("cover_letters").insert({
        user_id: userId,
        title: coverLetterTitle,
        content,
        template_id: selectedTemplateId,
        is_public: false,
      })

      if (error) throw error

      alert("Cover letter saved successfully!")
    } catch (error) {
      console.error("Error saving cover letter:", error)
      alert("Failed to save cover letter. Please try again.")
    }
  }

  const downloadCoverLetter = () => {
    // Create a Blob with the HTML content
    const blob = new Blob([previewHtml], { type: "text/html" })

    // Create a download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${coverLetterTitle.replace(/\s+/g, "_")}.html`

    // Trigger the download
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const togglePreviewMode = () => {
    setActiveTab(activeTab === "preview" ? "edit" : "preview")
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h1>
              <p className="text-muted-foreground">Create tailored cover letters for your job applications</p>
            </div>
            <div className="flex gap-2">
              {generatedCoverLetter && (
                <>
                  <Button variant="outline" onClick={() => setActiveTab(activeTab === "preview" ? "edit" : "preview")}>
                    <Eye className="mr-2 h-4 w-4" />
                    {activeTab === "preview" ? "Edit Mode" : "Preview"}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("analyze")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    ATS Analysis
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={saveCoverLetter} disabled={!generatedCoverLetter}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button onClick={downloadCoverLetter} disabled={!generatedCoverLetter}>
                <Download className="mr-2 h-4 w-4" />
                Download HTML
              </Button>
            </div>
          </div>

          {generatedCoverLetter ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="edit" className="flex items-center justify-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center justify-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="analyze" className="flex items-center justify-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  ATS Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <Label htmlFor="coverLetterTitle">Cover Letter Title</Label>
                      <Input
                        id="coverLetterTitle"
                        value={coverLetterTitle}
                        onChange={(e) => setCoverLetterTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <Tabs defaultValue="job" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="template">Template</TabsTrigger>
                        <TabsTrigger value="job">Job Details</TabsTrigger>
                        <TabsTrigger value="personal">Personal Info</TabsTrigger>
                      </TabsList>

                      <TabsContent value="template" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Choose a Template</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {loading ? (
                              <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-4">
                                {templates.map((template) => (
                                  <div
                                    key={template.id}
                                    className={`cursor-pointer border rounded-lg p-2 transition-all ${
                                      selectedTemplateId === template.id
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-border"
                                    }`}
                                    onClick={() => setSelectedTemplateId(template.id)}
                                  >
                                    <div className="aspect-[3/4] bg-muted flex items-center justify-center rounded overflow-hidden">
                                      {template.thumbnail_url ? (
                                        <img
                                          src={template.thumbnail_url || "/placeholder.svg"}
                                          alt={template.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="text-center p-4">
                                          <h3 className="font-medium">{template.name}</h3>
                                          {template.is_premium && (
                                            <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500 border-amber-500/20">
                                              Premium
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-center mt-2 font-medium">{template.name}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="job" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Job Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="companyName">Company Name</Label>
                              <Input
                                id="companyName"
                                name="companyName"
                                value={jobInfo.companyName}
                                onChange={handleJobInfoChange}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="jobTitle">Job Title</Label>
                              <Input
                                id="jobTitle"
                                name="jobTitle"
                                value={jobInfo.jobTitle}
                                onChange={handleJobInfoChange}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="hiringManager">Hiring Manager (if known)</Label>
                              <Input
                                id="hiringManager"
                                name="hiringManager"
                                value={jobInfo.hiringManager}
                                onChange={handleJobInfoChange}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="jobDescription">Job Description</Label>
                              <Textarea
                                id="jobDescription"
                                name="jobDescription"
                                value={jobInfo.jobDescription}
                                onChange={handleJobInfoChange}
                                className="mt-1"
                                rows={6}
                                placeholder="Paste the job description here to help our AI create a tailored cover letter"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="personal" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="fullName">Name</Label>
                              <Input
                                id="fullName"
                                name="fullName"
                                value={personalInfo.fullName}
                                onChange={handlePersonalInfoChange}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="relevantExperience">Relevant Experience</Label>
                              <Textarea
                                id="relevantExperience"
                                name="relevantExperience"
                                value={personalInfo.relevantExperience}
                                onChange={handlePersonalInfoChange}
                                className="mt-1"
                                rows={6}
                                placeholder="Describe your relevant experience and achievements that match the job requirements"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    <Button
                      className="w-full mt-6"
                      onClick={generateCoverLetterContent}
                      disabled={isGenerating || !jobInfo.companyName || !jobInfo.jobTitle || !personalInfo.fullName}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                          Generate Cover Letter
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-muted rounded-lg p-8 min-h-[800px]">
                    <div className="bg-white shadow-lg rounded-lg h-full overflow-hidden">
                      {previewHtml ? (
                        <iframe
                          srcDoc={previewHtml}
                          title="Cover Letter Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-same-origin"
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <div className="mb-4 text-muted-foreground">
                            {isGenerating ? (
                              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mx-auto"
                              >
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <line x1="10" y1="9" x2="8" y2="9" />
                              </svg>
                            )}
                          </div>
                          <h3 className="text-lg font-medium">
                            {isGenerating ? "Generating your cover letter..." : "Your cover letter will appear here"}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {isGenerating
                              ? "Our AI is crafting a personalized cover letter based on your information"
                              : "Fill out the job and personal information, then click 'Generate Cover Letter'"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="bg-white shadow-lg rounded-lg min-h-[1000px] overflow-hidden">
                    <iframe
                      srcDoc={previewHtml}
                      title="Cover Letter Preview"
                      className="w-full h-[1000px] border-0"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analyze" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cover Letter Content</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-[600px] overflow-y-auto p-4 border rounded-md">
                          {generatedCoverLetter.split("\n\n").map((paragraph, index) => (
                            <p key={index} className="mb-4">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <CoverLetterAtsAnalyzer
                      coverLetterText={generatedCoverLetter}
                      jobDescription={jobInfo.jobDescription}
                      onAnalysisComplete={setAtsAnalysisResult}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <Label htmlFor="coverLetterTitle">Cover Letter Title</Label>
                  <Input
                    id="coverLetterTitle"
                    value={coverLetterTitle}
                    onChange={(e) => setCoverLetterTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Tabs defaultValue="job" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="template">Template</TabsTrigger>
                    <TabsTrigger value="job">Job Details</TabsTrigger>
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="template" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Choose a Template</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            {templates.map((template) => (
                              <div
                                key={template.id}
                                className={`cursor-pointer border rounded-lg p-2 transition-all ${
                                  selectedTemplateId === template.id
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border"
                                }`}
                                onClick={() => setSelectedTemplateId(template.id)}
                              >
                                <div className="aspect-[3/4] bg-muted flex items-center justify-center rounded overflow-hidden">
                                  {template.thumbnail_url ? (
                                    <img
                                      src={template.thumbnail_url || "/placeholder.svg"}
                                      alt={template.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-center p-4">
                                      <h3 className="font-medium">{template.name}</h3>
                                      {template.is_premium && (
                                        <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-500 border-amber-500/20">
                                          Premium
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <p className="text-center mt-2 font-medium">{template.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="job" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Job Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            name="companyName"
                            value={jobInfo.companyName}
                            onChange={handleJobInfoChange}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Input
                            id="jobTitle"
                            name="jobTitle"
                            value={jobInfo.jobTitle}
                            onChange={handleJobInfoChange}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hiringManager">Hiring Manager (if known)</Label>
                          <Input
                            id="hiringManager"
                            name="hiringManager"
                            value={jobInfo.hiringManager}
                            onChange={handleJobInfoChange}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="jobDescription">Job Description</Label>
                          <Textarea
                            id="jobDescription"
                            name="jobDescription"
                            value={jobInfo.jobDescription}
                            onChange={handleJobInfoChange}
                            className="mt-1"
                            rows={6}
                            placeholder="Paste the job description here to help our AI create a tailored cover letter"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="personal" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={personalInfo.fullName}
                            onChange={handlePersonalInfoChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="relevantExperience">Relevant Experience</Label>
                          <Textarea
                            id="relevantExperience"
                            name="relevantExperience"
                            value={personalInfo.relevantExperience}
                            onChange={handlePersonalInfoChange}
                            className="mt-1"
                            rows={6}
                            placeholder="Describe your relevant experience and achievements that match the job requirements"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Button
                  className="w-full mt-6"
                  onClick={generateCoverLetterContent}
                  disabled={isGenerating || !jobInfo.companyName || !jobInfo.jobTitle || !personalInfo.fullName}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-muted rounded-lg p-8 min-h-[800px]">
                <div className="bg-white shadow-lg rounded-lg h-full overflow-hidden">
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      title="Cover Letter Preview"
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="mb-4 text-muted-foreground">
                        {isGenerating ? (
                          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <line x1="10" y1="9" x2="8" y2="9" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-lg font-medium">
                        {isGenerating ? "Generating your cover letter..." : "Your cover letter will appear here"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isGenerating
                          ? "Our AI is crafting a personalized cover letter based on your information"
                          : "Fill out the job and personal information, then click 'Generate Cover Letter'"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
