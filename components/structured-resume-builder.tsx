"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/lib/supabase"
import { PlusCircle, Trash2, Save, Download, ArrowRight, Loader2 } from "lucide-react"

interface ResumeSection {
  id: string
  type: string
  title: string
  content: any
}

interface Education {
  school: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  description: string
}

interface Experience {
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  description: string
}

interface Skill {
  name: string
  level: string
}

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  address: string
  linkedin?: string
  website?: string
}

export function StructuredResumeBuilder() {
  const { user, canUseFeature, calculateResumePrice, getFeatureLimit, getFeatureUsage } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const resumeId = searchParams.get("id")

  const [activeTab, setActiveTab] = useState("personal-info")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [resumeTitle, setResumeTitle] = useState("My Resume")
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    website: "",
  })
  const [education, setEducation] = useState<Education[]>([
    {
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ])
  const [experience, setExperience] = useState<Experience[]>([
    {
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ])
  const [skills, setSkills] = useState<Skill[]>([{ name: "", level: "Intermediate" }])
  const [summary, setSummary] = useState("")

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

          if (content.personalInfo) {
            setPersonalInfo(content.personalInfo)
          }

          if (content.education && Array.isArray(content.education)) {
            setEducation(content.education)
          }

          if (content.experience && Array.isArray(content.experience)) {
            setExperience(content.experience)
          }

          if (content.skills && Array.isArray(content.skills)) {
            setSkills(content.skills)
          }

          if (content.summary) {
            setSummary(content.summary)
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
        personalInfo,
        education,
        experience,
        skills,
        summary,
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

  const addEducation = () => {
    setEducation([
      ...education,
      {
        school: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ])
  }

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = [...education]
    updatedEducation[index] = { ...updatedEducation[index], [field]: value }
    setEducation(updatedEducation)
  }

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ])
  }

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
  }

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updatedExperience = [...experience]
    updatedExperience[index] = { ...updatedExperience[index], [field]: value }
    setExperience(updatedExperience)
  }

  const addSkill = () => {
    setSkills([...skills, { name: "", level: "Intermediate" }])
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updatedSkills = [...skills]
    updatedSkills[index] = { ...updatedSkills[index], [field]: value }
    setSkills(updatedSkills)
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
          <p className="text-sm text-muted-foreground">Fill in the sections below to create your professional resume</p>
        </div>
        <div className="flex gap-2">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        {/* Personal Info Section */}
        <TabsContent value="personal-info" className="space-y-4 pt-4">
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  placeholder="123 Main St, City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                <Input
                  id="linkedin"
                  value={personalInfo.linkedin || ""}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={personalInfo.website || ""}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
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
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Experienced software developer with 5+ years of experience in web development..."
                rows={6}
              />
            </div>
          </div>
        </TabsContent>

        {/* Experience Section */}
        <TabsContent value="experience" className="space-y-4 pt-4">
          {experience.map((exp, index) => (
            <div key={index} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Work Experience {index + 1}</h3>
                {experience.length > 1 && (
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
          {education.map((edu, index) => (
            <div key={index} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Education {index + 1}</h3>
                {education.length > 1 && (
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

        {/* Skills Section */}
        <TabsContent value="skills" className="space-y-4 pt-4">
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Skills</h3>
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(index, "name", e.target.value)}
                    placeholder="Skill name (e.g., JavaScript, Project Management)"
                  />
                </div>
                <div className="w-40">
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(index, "level", e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                {skills.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addSkill} className="w-full mt-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
