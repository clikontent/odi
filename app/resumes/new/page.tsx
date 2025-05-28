"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Crown, Eye, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { generateResumeContent } from "@/lib/gemini"
import { getResumeTemplates, renderResumeHTML } from "@/lib/templates"
import { checkUsageLimit, incrementUsage, getUserSubscription } from "@/lib/subscription"
import type { ResumeTemplate } from "@/lib/types"

export default function NewResumePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [templates, setTemplates] = useState<ResumeTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [usageCheck, setUsageCheck] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)

  const [resumeData, setResumeData] = useState({
    title: "",
    personalInfo: {
      fullName: "",
      email: "",
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
        duration: "",
        description: "",
      },
    ],
    education: [
      {
        degree: "",
        school: "",
        year: "",
      },
    ],
    skills: [] as string[],
    achievements: [] as string[],
  })

  useEffect(() => {
    if (user) {
      fetchInitialData()
    }
  }, [user])

  const fetchInitialData = async () => {
    try {
      const [subData, usageData] = await Promise.all([
        getUserSubscription(user?.id || ""),
        checkUsageLimit(user?.id || "", "resumes"),
      ])

      setSubscription(subData)
      setUsageCheck(usageData)

      // Fetch templates based on subscription
      const includesPremium = subData?.plan_type !== "free"
      const templatesData = await getResumeTemplates(includesPremium)
      setTemplates(templatesData)

      if (templatesData.length > 0) {
        setSelectedTemplate(templatesData[0])
      }
    } catch (error) {
      console.error("Error fetching initial data:", error)
    }
  }

  const handleInputChange = (section: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
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
          duration: "",
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

  const updateExperience = (index: number, field: string, value: string) => {
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
          year: "",
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

  const generateWithAI = async () => {
    if (!usageCheck?.allowed && subscription?.plan_type === "free") {
      alert("You've reached your free resume limit. Upgrade to generate more resumes or pay $5 for this resume.")
      return
    }

    setAiGenerating(true)
    try {
      const userInfo = {
        ...resumeData.personalInfo,
        summary: resumeData.summary,
        skills: resumeData.skills,
      }

      const aiContent = await generateResumeContent(userInfo)
      // Parse AI response and update resume data
      console.log("AI Generated Content:", aiContent)

      // Increment usage
      await incrementUsage(user?.id || "", "resumes")
    } catch (error) {
      console.error("Error generating AI content:", error)
    } finally {
      setAiGenerating(false)
    }
  }

  const saveResume = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user?.id,
          template_id: selectedTemplate.id,
          title: resumeData.title,
          content: resumeData,
          is_active: true,
        })
        .select()

      if (error) throw error

      router.push("/resumes")
    } catch (error) {
      console.error("Error saving resume:", error)
    } finally {
      setLoading(false)
    }
  }

  const previewResume = () => {
    if (!selectedTemplate) return

    const html = renderResumeHTML(selectedTemplate, resumeData)
    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(html)
      newWindow.document.close()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Resume</h1>
        <p className="text-gray-600 mt-2">Choose a template and build your professional resume</p>
      </div>

      {/* Usage Alert */}
      {subscription?.plan_type === "free" && !usageCheck?.allowed && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertDescription>
            You've used {usageCheck?.current} of {usageCheck?.limit} free resumes this month. Upgrade your plan or pay
            $5 per resume to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Choose Template</CardTitle>
              <CardDescription>Select a professional template for your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.is_premium && (
                        <Badge variant="outline" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{template.description}</p>
                    <Badge variant="outline" className="text-xs mt-2">
                      {template.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resume Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resume Information</CardTitle>
              <CardDescription>Fill in your details to create your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
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
                        onChange={(e) => handleInputChange("personalInfo", "fullName", e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
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
                        onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => handleInputChange("personalInfo", "location", e.target.value)}
                        placeholder="New York, NY"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={resumeData.summary}
                      onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                      placeholder="Brief summary of your professional background and goals..."
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-4">
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

                      <div className="mb-4">
                        <Label>Duration</Label>
                        <Input
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, "duration", e.target.value)}
                          placeholder="Jan 2020 - Present"
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
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

                <TabsContent value="education" className="space-y-4">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="mt-4">
                        <Label>Year</Label>
                        <Input
                          value={edu.year}
                          onChange={(e) => updateEducation(index, "year", e.target.value)}
                          placeholder="2020"
                        />
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="skills" className="space-y-4">
                  <div>
                    <Label>Skills</Label>
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI Assistant Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900">
                <Sparkles className="mr-2 h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription className="text-purple-700">
                Let AI help you create a professional resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={generateWithAI} disabled={aiGenerating} className="w-full">
                {aiGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>See how your resume will look</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={previewResume} variant="outline" className="w-full" disabled={!selectedTemplate}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Resume
              </Button>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button onClick={saveResume} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Resume"}
                </Button>
                <Button variant="outline" className="w-full">
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
