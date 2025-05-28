"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Save, Plus, Trash2, Eye, ArrowLeft, Brain } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { renderResumeHTML } from "@/lib/templates"
import { checkUsageLimit, getUserSubscription } from "@/lib/subscription"
import { generateProfessionalSummary, generateWorkDescription, generateSkillsSuggestions } from "@/lib/gemini"
import type { ResumeTemplate } from "@/lib/types"

export default function ResumeBuilderContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")

  const [template, setTemplate] = useState<ResumeTemplate | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [usageCheck, setUsageCheck] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)

  const [resumeData, setResumeData] = useState({
    title: "",
    personalInfo: {
      fullName: "",
      email: user?.email || "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
    },
    summary: "",
    experience: [
      {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],
    education: [
      {
        degree: "",
        school: "",
        location: "",
        graduationDate: "",
        gpa: "",
        description: "",
      },
    ],
    skills: [] as string[],
    achievements: [] as string[],
    certifications: [] as string[],
  })

  useEffect(() => {
    if (user && templateId) {
      fetchInitialData()
    }
  }, [user, templateId])

  const fetchInitialData = async () => {
    try {
      // Fetch template from Supabase
      const { data: templateData, error: templateError } = await supabase
        .from("resume_templates")
        .select("*")
        .eq("id", templateId)
        .eq("is_active", true)
        .single()

      if (templateError) throw templateError

      const [subData, usageData] = await Promise.all([
        getUserSubscription(user?.id || ""),
        checkUsageLimit(user?.id || "", "resumes"),
      ])

      setTemplate(templateData)
      setSubscription(subData)
      setUsageCheck(usageData)

      // Pre-fill user data
      setResumeData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: user?.user_metadata?.full_name || "",
          email: user?.email || "",
        },
      }))
    } catch (error) {
      console.error("Error fetching initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalInfoChange = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }))
  }

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }))
  }

  const removeExperience = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  const updateExperience = (index: number, field: string, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }))
  }

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          school: "",
          location: "",
          graduationDate: "",
          gpa: "",
          description: "",
        },
      ],
    }))
  }

  const removeEducation = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }))
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }))
    }
  }

  const removeSkill = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const generateSummaryWithAI = async () => {
    setAiLoading("summary")
    try {
      const userInfo = {
        ...resumeData.personalInfo,
        experience: resumeData.experience,
        skills: resumeData.skills,
      }

      const aiSummary = await generateProfessionalSummary(userInfo)
      setResumeData((prev) => ({ ...prev, summary: aiSummary }))
    } catch (error) {
      console.error("Error generating summary:", error)
      alert("Error generating summary. Please try again.")
    } finally {
      setAiLoading(null)
    }
  }

  const generateWorkDescriptionWithAI = async (index: number) => {
    setAiLoading(`experience-${index}`)
    try {
      const experience = resumeData.experience[index]
      const aiDescription = await generateWorkDescription(experience.title, experience.company)
      updateExperience(index, "description", aiDescription)
    } catch (error) {
      console.error("Error generating work description:", error)
      alert("Error generating work description. Please try again.")
    } finally {
      setAiLoading(null)
    }
  }

  const generateSkillsWithAI = async () => {
    setAiLoading("skills")
    try {
      const userInfo = {
        experience: resumeData.experience,
        education: resumeData.education,
        currentSkills: resumeData.skills,
      }

      const aiSkills = await generateSkillsSuggestions(userInfo)
      // Parse AI response and add suggested skills
      const suggestedSkills = aiSkills.split(",").map((skill) => skill.trim())

      setResumeData((prev) => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...suggestedSkills])], // Remove duplicates
      }))
    } catch (error) {
      console.error("Error generating skills:", error)
      alert("Error generating skills. Please try again.")
    } finally {
      setAiLoading(null)
    }
  }

  const saveResume = async () => {
    if (!template) {
      alert("Template not found")
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user?.id,
          template_id: template.id,
          title: resumeData.title || `${resumeData.personalInfo.fullName} Resume`,
          content: resumeData,
          is_active: false,
        })
        .select()
        .single()

      if (error) throw error

      alert("Resume saved successfully!")
      router.push(`/resume-builder/preview/${data.id}`)
    } catch (error) {
      console.error("Error saving resume:", error)
      alert("Error saving resume")
    } finally {
      setSaving(false)
    }
  }

  const previewResume = () => {
    if (!template) return

    const html = renderResumeHTML(template, resumeData)
    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(html)
      newWindow.document.close()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Template not found. Please go back and select a template.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold">Resume Builder</h1>
                <p className="text-sm text-gray-600">{template.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={previewResume}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={saveResume} disabled={saving}>
                {saving ? "Saving..." : "Save & Continue"}
                <Save className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Form */}
          <div className="space-y-6">
            {/* Resume Form */}
            <Card>
              <CardHeader>
                <CardTitle>Resume Information</CardTitle>
                <CardDescription>Fill in your details to create your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="title">Resume Title</Label>
                      <Input
                        id="title"
                        value={resumeData.title}
                        onChange={(e) => setResumeData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Software Engineer Resume"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                          placeholder="New York, NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedin">LinkedIn URL</Label>
                        <Input
                          id="linkedin"
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                          placeholder="https://linkedin.com/in/johndoe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portfolio">Portfolio URL</Label>
                        <Input
                          id="portfolio"
                          value={resumeData.personalInfo.portfolio}
                          onChange={(e) => handlePersonalInfoChange("portfolio", e.target.value)}
                          placeholder="https://johndoe.com"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="summary">Professional Summary</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateSummaryWithAI}
                          disabled={aiLoading === "summary"}
                        >
                          {aiLoading === "summary" ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-1"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Brain className="h-3 w-3 mr-1" />
                              AI Generate
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea
                        id="summary"
                        value={resumeData.summary}
                        onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                        placeholder="Brief summary of your professional background and goals..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Work Experience</h3>
                      <Button onClick={addExperience} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Experience
                      </Button>
                    </div>

                    {resumeData.experience.map((exp, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Experience {index + 1}</h4>
                          {resumeData.experience.length > 1 && (
                            <Button variant="outline" size="sm" onClick={() => removeExperience(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Job Title</Label>
                            <Input
                              value={exp.title}
                              onChange={(e) => updateExperience(index, "title", e.target.value)}
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(index, "company", e.target.value)}
                              placeholder="Tech Company Inc."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={exp.location}
                              onChange={(e) => updateExperience(index, "location", e.target.value)}
                              placeholder="San Francisco, CA"
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                              disabled={exp.current}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(index, "current", e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm">I currently work here</span>
                          </label>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Description</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateWorkDescriptionWithAI(index)}
                              disabled={aiLoading === `experience-${index}` || !exp.title || !exp.company}
                            >
                              {aiLoading === `experience-${index}` ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-1"></div>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Brain className="h-3 w-3 mr-1" />
                                  AI Generate
                                </>
                              )}
                            </Button>
                          </div>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(index, "description", e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={3}
                          />
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Education</h3>
                      <Button onClick={addEducation} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                      </Button>
                    </div>

                    {resumeData.education.map((edu, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Education {index + 1}</h4>
                          {resumeData.education.length > 1 && (
                            <Button variant="outline" size="sm" onClick={() => removeEducation(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, "degree", e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                          <div>
                            <Label>School</Label>
                            <Input
                              value={edu.school}
                              onChange={(e) => updateEducation(index, "school", e.target.value)}
                              placeholder="University of Technology"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={edu.location}
                              onChange={(e) => updateEducation(index, "location", e.target.value)}
                              placeholder="Boston, MA"
                            />
                          </div>
                          <div>
                            <Label>Graduation Date</Label>
                            <Input
                              type="month"
                              value={edu.graduationDate}
                              onChange={(e) => updateEducation(index, "graduationDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>GPA (Optional)</Label>
                            <Input
                              value={edu.gpa}
                              onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                              placeholder="3.8"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Description (Optional)</Label>
                          <Textarea
                            value={edu.description}
                            onChange={(e) => updateEducation(index, "description", e.target.value)}
                            placeholder="Relevant coursework, honors, activities..."
                            rows={2}
                          />
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4 mt-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Skills</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateSkillsWithAI}
                          disabled={aiLoading === "skills"}
                        >
                          {aiLoading === "skills" ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-1"></div>
                              Suggesting...
                            </>
                          ) : (
                            <>
                              <Brain className="h-3 w-3 mr-1" />
                              AI Suggest
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Input
                          placeholder="Add a skill and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addSkill(e.currentTarget.value)
                              e.currentTarget.value = ""
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {skill}
                          <button onClick={() => removeSkill(index)} className="ml-2 text-red-500">
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <Label>Achievements (Optional)</Label>
                      <Textarea placeholder="List your key achievements, awards, or accomplishments..." rows={4} />
                    </div>

                    <div>
                      <Label>Certifications (Optional)</Label>
                      <Textarea placeholder="List your professional certifications..." rows={3} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="lg:sticky lg:top-24">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Preview</span>
                  <Badge variant="outline">{template.name}</Badge>
                </CardTitle>
                <CardDescription>See how your resume will look in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[800px] overflow-auto">
                  <div
                    className="resume-preview"
                    dangerouslySetInnerHTML={{
                      __html: template ? renderResumeHTML(template, resumeData) : "",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
