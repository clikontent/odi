"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/lib/supabase"
import { PlusCircle, Trash2, Save, Download, ArrowRight, Loader2, Eye, Edit, FileText } from "lucide-react"

// Resume template types
const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional design with a modern touch",
    primaryColor: "#3b82f6",
    secondaryColor: "#f3f4f6",
    fontFamily: "'Inter', sans-serif",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional resume format that employers are familiar with",
    primaryColor: "#1e293b",
    secondaryColor: "#f8fafc",
    fontFamily: "'Georgia', serif",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stand out with a unique and creative design",
    primaryColor: "#8b5cf6",
    secondaryColor: "#f5f3ff",
    fontFamily: "'Poppins', sans-serif",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and clean design with focus on content",
    primaryColor: "#64748b",
    secondaryColor: "#f1f5f9",
    fontFamily: "'Roboto', sans-serif",
  },
]

interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    address: string
    linkedin?: string
    website?: string
  }
  summary: string
  experience: {
    company: string
    position: string
    location: string
    startDate: string
    endDate: string
    description: string
  }[]
  education: {
    school: string
    degree: string
    fieldOfStudy: string
    startDate: string
    endDate: string
    description: string
  }[]
  skills: {
    name: string
    level: string
  }[]
}

export function TemplateBasedResumeBuilder() {
  const { user, canUseFeature, calculateResumePrice, getFeatureLimit, getFeatureUsage } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const resumeId = searchParams.get("id")
  const previewRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState("template")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [resumeTitle, setResumeTitle] = useState("My Resume")
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0])
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")

  // Resume data state
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experience: [
      {
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    education: [
      {
        school: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ],
    skills: [{ name: "", level: "Intermediate" }],
  })

  // Load resume data if editing an existing resume
  useEffect(() => {
    const loadResumeData = async () => {
      if (!resumeId || !user) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", resumeId)
          .eq("user_id", user.id)
          .single()

        if (error) throw error

        if (data) {
          setResumeTitle(data.title || "My Resume")

          // Parse and set resume content
          const content = data.content || {}

          // Set template if available
          if (content.template) {
            const template = TEMPLATES.find((t) => t.id === content.template) || TEMPLATES[0]
            setSelectedTemplate(template)
          }

          // Set resume data
          if (content.personalInfo || content.summary || content.experience || content.education || content.skills) {
            setResumeData({
              personalInfo: content.personalInfo || resumeData.personalInfo,
              summary: content.summary || "",
              experience: Array.isArray(content.experience) ? content.experience : resumeData.experience,
              education: Array.isArray(content.education) ? content.education : resumeData.education,
              skills: Array.isArray(content.skills) ? content.skills : resumeData.skills,
            })
          }
        }
      } catch (error) {
        console.error("Error loading resume:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load resume data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadResumeData()
  }, [resumeId, user, toast])

  // Update preview when data changes
  useEffect(() => {
    if (viewMode === "preview" && previewRef.current) {
      renderResumePreview()
    }
  }, [viewMode, resumeData, selectedTemplate])

  const renderResumePreview = () => {
    if (!previewRef.current) return

    const { personalInfo, summary, experience, education, skills } = resumeData
    const { primaryColor, secondaryColor, fontFamily } = selectedTemplate

    // Generate HTML for the resume preview
    const html = `
      <style>
        .resume-container {
          font-family: ${fontFamily};
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 2px solid ${primaryColor};
        }
        .name {
          font-size: 28px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 5px;
        }
        .contact-info {
          font-size: 14px;
          color: #666;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid ${secondaryColor};
        }
        .summary {
          margin-bottom: 25px;
          line-height: 1.5;
        }
        .experience-item, .education-item {
          margin-bottom: 15px;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .item-title {
          font-weight: bold;
        }
        .item-subtitle {
          font-style: italic;
        }
        .item-date {
          color: #666;
        }
        .item-description {
          margin-top: 5px;
          line-height: 1.4;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .skill-item {
          background-color: ${secondaryColor};
          color: #333;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 14px;
        }
      </style>
      <div class="resume-container">
        <div class="header">
          <div class="name">${personalInfo.fullName || "Your Name"}</div>
          <div class="contact-info">
            ${personalInfo.email ? `${personalInfo.email} | ` : ""}
            ${personalInfo.phone ? `${personalInfo.phone} | ` : ""}
            ${personalInfo.address || ""}
            ${personalInfo.linkedin ? `<br>${personalInfo.linkedin}` : ""}
            ${personalInfo.website ? `${personalInfo.linkedin ? " | " : "<br>"}${personalInfo.website}` : ""}
          </div>
        </div>
        
        ${
          summary
            ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="summary">${summary}</div>
        </div>
        `
            : ""
        }
        
        ${
          experience.length > 0 && experience[0].company
            ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience
            .map(
              (exp) => `
            <div class="experience-item">
              <div class="item-header">
                <div>
                  <div class="item-title">${exp.position || "Position"}</div>
                  <div class="item-subtitle">${exp.company || "Company"}, ${exp.location || "Location"}</div>
                </div>
                <div class="item-date">
                  ${exp.startDate ? formatDate(exp.startDate) : "Start Date"} - 
                  ${exp.endDate ? formatDate(exp.endDate) : "Present"}
                </div>
              </div>
              <div class="item-description">${exp.description || ""}</div>
            </div>
          `,
            )
            .join("")}
        </div>
        `
            : ""
        }
        
        ${
          education.length > 0 && education[0].school
            ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${education
            .map(
              (edu) => `
            <div class="education-item">
              <div class="item-header">
                <div>
                  <div class="item-title">${edu.degree || "Degree"} in ${edu.fieldOfStudy || "Field of Study"}</div>
                  <div class="item-subtitle">${edu.school || "School"}</div>
                </div>
                <div class="item-date">
                  ${edu.startDate ? formatDate(edu.startDate) : "Start Date"} - 
                  ${edu.endDate ? formatDate(edu.endDate) : "End Date"}
                </div>
              </div>
              <div class="item-description">${edu.description || ""}</div>
            </div>
          `,
            )
            .join("")}
        </div>
        `
            : ""
        }
        
        ${
          skills.length > 0 && skills[0].name
            ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-list">
            ${skills
              .map(
                (skill) => `
              <div class="skill-item">${skill.name} ${skill.level ? `(${skill.level})` : ""}</div>
            `,
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }
      </div>
    `

    previewRef.current.innerHTML = html
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
    } catch (e) {
      return dateString
    }
  }

  const handleSaveResume = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save a resume",
      })
      router.push("/login?redirect=/dashboard/resume-builder")
      return
    }

    setIsSaving(true)
    try {
      const resumeContent = {
        ...resumeData,
        template: selectedTemplate.id,
      }

      if (resumeId) {
        // Update existing resume
        const { error } = await supabase
          .from("resumes")
          .update({
            title: resumeTitle,
            content: resumeContent,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resumeId)
          .eq("user_id", user.id)

        if (error) throw error

        toast({
          title: "Resume updated",
          description: "Your resume has been updated successfully",
        })
      } else {
        // Create new resume
        const { data, error } = await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            title: resumeTitle,
            content: resumeContent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: "draft",
            payment_status: "unpaid",
          })
          .select()

        if (error) throw error

        // Redirect to the edit page for the new resume
        router.push(`/dashboard/resume-builder?id=${data[0].id}`)

        toast({
          title: "Resume created",
          description: "Your resume has been created successfully",
        })
      }
    } catch (error) {
      console.error("Error saving resume:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save resume. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportResume = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to export a resume",
      })
      router.push("/login?redirect=/dashboard/resume-builder")
      return
    }

    if (!resumeId) {
      // Save the resume first
      toast({
        title: "Save required",
        description: "Please save your resume before exporting",
      })
      return
    }

    // Check if user can download the resume based on their plan
    const resumePrice = calculateResumePrice()
    const resumeLimit = getFeatureLimit("resumeDownload")
    const resumeUsage = getFeatureUsage("resumeDownload")

    if (resumePrice > 0) {
      // Free user needs to pay per resume
      router.push(`/payment?resumeId=${resumeId}`)
      return
    } else if (resumeUsage >= resumeLimit && resumeLimit !== Number.POSITIVE_INFINITY) {
      // Premium user has reached their limit
      toast({
        variant: "destructive",
        title: "Download limit reached",
        description: "You have reached your resume download limit. Please upgrade your plan to download more resumes.",
      })
      return
    }

    // If we get here, the user can download the resume
    // Redirect to the download page
    router.push(`/dashboard/resume-builder/download?id=${resumeId}`)
  }

  // Helper functions for updating resume data
  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    })
  }

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    })
  }

  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExperience = [...resumeData.experience]
    updatedExperience[index] = { ...updatedExperience[index], [field]: value }
    setResumeData({
      ...resumeData,
      experience: updatedExperience,
    })
  }

  const removeExperience = (index: number) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index),
    })
  }

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          school: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    })
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...resumeData.education]
    updatedEducation[index] = { ...updatedEducation[index], [field]: value }
    setResumeData({
      ...resumeData,
      education: updatedEducation,
    })
  }

  const removeEducation = (index: number) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index),
    })
  }

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, { name: "", level: "Intermediate" }],
    })
  }

  const updateSkill = (index: number, field: string, value: string) => {
    const updatedSkills = [...resumeData.skills]
    updatedSkills[index] = { ...updatedSkills[index], [field]: value }
    setResumeData({
      ...resumeData,
      skills: updatedSkills,
    })
  }

  const removeSkill = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index),
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading resume data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Input
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="text-2xl font-bold border-none px-0 text-3xl h-auto focus-visible:ring-0"
            placeholder="Resume Title"
          />
          <p className="text-sm text-muted-foreground">Create a professional resume with our template-based builder</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
              className="rounded-none"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="rounded-none"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
          <Button variant="outline" onClick={handleSaveResume} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
          <Button onClick={handleExportResume}>
            {calculateResumePrice() > 0 ? (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Proceed to Payment (${calculateResumePrice()})
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {viewMode === "edit" ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          {/* Template Selection Section */}
          <TabsContent value="template" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${selectedTemplate.id === template.id ? "ring-2 ring-primary" : "hover:border-primary"}`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: template.primaryColor }}
                      >
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: template.primaryColor }}
                        title="Primary Color"
                      ></div>
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: template.secondaryColor }}
                        title="Secondary Color"
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Personal Info Section */}
          <TabsContent value="personal-info" className="space-y-4 pt-4">
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={resumeData.personalInfo.address}
                    onChange={(e) => updatePersonalInfo("address", e.target.value)}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                  <Input
                    id="linkedin"
                    value={resumeData.personalInfo.linkedin || ""}
                    onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={resumeData.personalInfo.website || ""}
                    onChange={(e) => updatePersonalInfo("website", e.target.value)}
                    placeholder="johndoe.com"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Summary Section */}
          <TabsContent value="summary" className="space-y-4 pt-4">
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <div className="space-y-2">
                <Label htmlFor="summary">Write a brief summary of your professional background and goals</Label>
                <Textarea
                  id="summary"
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  placeholder="Experienced software developer with 5+ years of experience in web development..."
                  rows={6}
                />
              </div>
            </div>
          </TabsContent>

          {/* Experience Section */}
          <TabsContent value="experience" className="space-y-4 pt-4">
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Work Experience {index + 1}</h3>
                  {resumeData.experience.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`company-${index}`}>Company</Label>
                    <Input
                      id={`company-${index}`}
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`position-${index}`}>Position</Label>
                    <Input
                      id={`position-${index}`}
                      value={exp.position}
                      onChange={(e) => updateExperience(index, "position", e.target.value)}
                      placeholder="Job Title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`location-${index}`}>Location</Label>
                    <Input
                      id={`location-${index}`}
                      value={exp.location}
                      onChange={(e) => updateExperience(index, "location", e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                      <Input
                        id={`startDate-${index}`}
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`endDate-${index}`}>End Date</Label>
                      <Input
                        id={`endDate-${index}`}
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                        placeholder="Present"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={exp.description}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={4}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addExperience} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </TabsContent>

          {/* Education Section */}
          <TabsContent value="education" className="space-y-4 pt-4">
            {resumeData.education.map((edu, index) => (
              <div key={index} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Education {index + 1}</h3>
                  {resumeData.education.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`school-${index}`}>School</Label>
                    <Input
                      id={`school-${index}`}
                      value={edu.school}
                      onChange={(e) => updateEducation(index, "school", e.target.value)}
                      placeholder="University Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`degree-${index}`}>Degree</Label>
                    <Input
                      id={`degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      placeholder="Bachelor of Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`fieldOfStudy-${index}`}>Field of Study</Label>
                    <Input
                      id={`fieldOfStudy-${index}`}
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(index, "fieldOfStudy", e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`eduStartDate-${index}`}>Start Date</Label>
                      <Input
                        id={`eduStartDate-${index}`}
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`eduEndDate-${index}`}>End Date</Label>
                      <Input
                        id={`eduEndDate-${index}`}
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`eduDescription-${index}`}>Description (Optional)</Label>
                  <Textarea
                    id={`eduDescription-${index}`}
                    value={edu.description}
                    onChange={(e) => updateEducation(index, "description", e.target.value)}
                    placeholder="Relevant coursework, achievements, etc."
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addEducation} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm p-8 min-h-[800px]">
          <div ref={previewRef} className="resume-preview"></div>
        </div>
      )}
    </div>
  )
}
