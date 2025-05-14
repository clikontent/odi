"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Trash2, Lightbulb, RefreshCw, Settings, Palette, ArrowUpDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Define the section types
type SectionType =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "awards"
  | "languages"
  | "custom"

// Define the section data structure
interface Section {
  id: string
  type: SectionType
  title: string
  content: any
  suggestions?: any[]
}

// Define the resume template interface
interface ResumeTemplate {
  id: string
  name: string
  html_content: string
  css_content?: string
  fonts?: string[]
  colors?: {
    primary: string
    secondary: string
    text: string
    background: string
  }
}

// Define the props for the AIDragDropResumeBuilder component
interface AIDragDropResumeBuilderProps {
  initialData?: {
    personalInfo: any
    summary: string
    experience: any[]
    education: any[]
    skills: any[]
    projects?: any[]
    awards?: any[]
    languages?: any[]
    custom?: any[]
  }
  onSave: (data: any) => void
  templates: ResumeTemplate[]
}

export function AIDragDropResumeBuilder({ initialData, onSave, templates }: AIDragDropResumeBuilderProps) {
  const supabase = createClientComponentClient()
  const [sections, setSections] = useState<Section[]>([])
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [jobDescription, setJobDescription] = useState<string>("")
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [colorScheme, setColorScheme] = useState<{
    primary: string
    secondary: string
    text: string
    background: string
  }>({
    primary: "#0f766e",
    secondary: "#0e7490",
    text: "#1e293b",
    background: "#f8fafc",
  })
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [showAiDialog, setShowAiDialog] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)
  const resumeContentRef = useRef<HTMLDivElement>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Initialize on component mount
  useEffect(() => {
    async function getUserId() {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
      }
    }

    getUserId()

    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0])
    }

    const initialSections: Section[] = [
      {
        id: "personal",
        type: "personal",
        title: "Personal Information",
        content: initialData?.personalInfo || {
          fullName: "",
          email: "",
          phone: "",
          address: "",
          linkedin: "",
          website: "",
        },
      },
      {
        id: "summary",
        type: "summary",
        title: "Professional Summary",
        content: initialData?.summary || "",
      },
    ]

    // Add experience sections
    if (initialData?.experience && initialData.experience.length > 0) {
      initialData.experience.forEach((exp, index) => {
        initialSections.push({
          id: `experience-${index}`,
          type: "experience",
          title: "Work Experience",
          content: exp,
        })
      })
    } else {
      initialSections.push({
        id: "experience-0",
        type: "experience",
        title: "Work Experience",
        content: {
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          achievements: [],
        },
      })
    }

    // Add education sections
    if (initialData?.education && initialData.education.length > 0) {
      initialData.education.forEach((edu, index) => {
        initialSections.push({
          id: `education-${index}`,
          type: "education",
          title: "Education",
          content: edu,
        })
      })
    } else {
      initialSections.push({
        id: "education-0",
        type: "education",
        title: "Education",
        content: {
          school: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      })
    }

    // Add skills section
    initialSections.push({
      id: "skills",
      type: "skills",
      title: "Skills",
      content: initialData?.skills || [{ id: 1, name: "" }],
    })

    // Add projects section if exists
    if (initialData?.projects && initialData.projects.length > 0) {
      initialData.projects.forEach((project, index) => {
        initialSections.push({
          id: `project-${index}`,
          type: "projects",
          title: "Projects",
          content: project,
        })
      })
    }

    // Add languages section if exists
    if (initialData?.languages && initialData.languages.length > 0) {
      initialSections.push({
        id: "languages",
        type: "languages",
        title: "Languages",
        content: initialData.languages,
      })
    }

    setSections(initialSections)
  }, [initialData, templates, selectedTemplate, supabase])

  // Update preview HTML whenever sections change
  useEffect(() => {
    if (selectedTemplate) {
      generatePreview()
    }
  }, [sections, selectedTemplate, colorScheme])

  // Move a section up or down
  const moveSection = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === sections.length - 1)) {
      return
    }

    const newSections = [...sections]
    const newIndex = direction === "up" ? index - 1 : index + 1

    // Swap the sections
    const temp = newSections[index]
    newSections[index] = newSections[newIndex]
    newSections[newIndex] = temp

    setSections(newSections)
  }

  // Add a new section
  const addSection = (type: SectionType) => {
    const newId = `${type}-${Date.now()}`
    let newContent: any = {}
    const title = getDefaultTitle(type)

    switch (type) {
      case "experience":
        newContent = {
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          achievements: [],
        }
        break
      case "education":
        newContent = {
          school: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          description: "",
        }
        break
      case "skills":
        newContent = [{ id: 1, name: "" }]
        break
      case "projects":
        newContent = {
          name: "",
          description: "",
          url: "",
          technologies: "",
          startDate: "",
          endDate: "",
        }
        break
      case "awards":
        newContent = {
          title: "",
          issuer: "",
          date: "",
          description: "",
        }
        break
      case "languages":
        newContent = [{ language: "", proficiency: "" }]
        break
      case "custom":
        newContent = ""
        break
      default:
        newContent = ""
    }

    const newSection: Section = {
      id: newId,
      type,
      title,
      content: newContent,
    }

    setSections([...sections, newSection])
  }

  // Get default title for a section type
  const getDefaultTitle = (type: SectionType): string => {
    switch (type) {
      case "personal":
        return "Personal Information"
      case "summary":
        return "Professional Summary"
      case "experience":
        return "Work Experience"
      case "education":
        return "Education"
      case "skills":
        return "Skills"
      case "projects":
        return "Projects"
      case "awards":
        return "Awards & Certifications"
      case "languages":
        return "Languages"
      case "custom":
        return "Custom Section"
      default:
        return "Section"
    }
  }

  // Remove a section
  const removeSection = (index: number) => {
    const newSections = [...sections]
    newSections.splice(index, 1)
    setSections(newSections)
  }

  // Update section content
  const updateSectionContent = (index: number, content: any) => {
    const newSections = [...sections]
    newSections[index].content = content
    setSections(newSections)
  }

  // Update section title
  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...sections]
    newSections[index].title = title
    setSections(newSections)
  }

  // Generate AI suggestions for content
  const generateAiSuggestions = async (sectionIndex: number, type: SectionType) => {
    if (!jobDescription) {
      toast({
        title: "Job description required",
        description: "Please enter a job description to generate AI suggestions",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingSuggestions(true)
    setActiveSection(sections[sectionIndex].id)

    try {
      let prompt = ""
      let endpoint = ""

      switch (type) {
        case "summary":
          endpoint = "/api/generate-summary"
          prompt = `Generate a professional summary for a resume based on this job description: ${jobDescription}`
          break
        case "skills":
          endpoint = "/api/suggest-skills"
          const currentSkills = sections[sectionIndex].content.map((s: any) => s.name).filter(Boolean)
          prompt = `Suggest skills for this job: ${jobDescription}. Current skills: ${currentSkills.join(", ")}`
          break
        case "experience":
          endpoint = "/api/suggest-achievements"
          prompt = `Suggest achievements for this position: ${sections[sectionIndex].content.position} at ${sections[sectionIndex].content.company} based on this job description: ${jobDescription}`
          break
        default:
          toast({
            title: "Not supported",
            description: `AI suggestions not supported for ${type} sections yet`,
            variant: "destructive",
          })
          setIsGeneratingSuggestions(false)
          setActiveSection(null)
          return
      }

      // Simulate API response for now
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let suggestions: string[] = []

      if (type === "summary") {
        suggestions = [
          "Experienced software engineer with a strong background in web development and a passion for creating efficient, scalable applications. Proficient in JavaScript, React, and Node.js with a track record of delivering high-quality solutions that meet business requirements.",
          "Detail-oriented software developer with 5+ years of experience building responsive web applications. Skilled in modern JavaScript frameworks and committed to writing clean, maintainable code that delivers exceptional user experiences.",
        ]
      } else if (type === "skills") {
        suggestions = ["JavaScript", "React", "Node.js", "TypeScript", "REST APIs", "Git", "Agile Methodologies"]
      } else if (type === "experience") {
        suggestions = [
          "Reduced application load time by 40% through code optimization and implementing lazy loading techniques",
          "Developed and maintained RESTful APIs that processed over 1M requests daily",
          "Implemented automated testing that increased code coverage from 65% to 90%",
          "Led a team of 3 developers to deliver a critical project ahead of schedule",
        ]
      }

      // Update the section with suggestions
      const newSections = [...sections]
      newSections[sectionIndex].suggestions = suggestions
      setSections(newSections)

      toast({
        title: "AI suggestions generated",
        description: "You can now choose from the suggested content",
      })
    } catch (error) {
      console.error("Error generating AI suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  // Apply an AI suggestion to a section
  const applySuggestion = (sectionIndex: number, suggestionIndex: number) => {
    const section = sections[sectionIndex]
    if (!section.suggestions || !section.suggestions[suggestionIndex]) return

    const suggestion = section.suggestions[suggestionIndex]
    const newSections = [...sections]

    switch (section.type) {
      case "summary":
        newSections[sectionIndex].content = suggestion
        break
      case "skills":
        // For skills, we'll add new skills but keep existing ones
        const existingSkills = section.content
        const newSkillNames = suggestion.split(",").map((s: string) => s.trim())
        const lastId = Math.max(...existingSkills.map((s: any) => s.id), 0)

        const newSkills = newSkillNames.map((name: string, i: number) => ({
          id: lastId + i + 1,
          name,
        }))

        newSections[sectionIndex].content = [...existingSkills, ...newSkills]
        break
      case "experience":
        // For experience, we'll add the suggestions as achievements
        const currentContent = { ...section.content }
        const achievements = Array.isArray(currentContent.achievements) ? [...currentContent.achievements] : []

        if (typeof suggestion === "string") {
          achievements.push(suggestion)
        } else if (Array.isArray(suggestion)) {
          achievements.push(...suggestion)
        }

        newSections[sectionIndex].content = {
          ...currentContent,
          achievements,
        }
        break
      default:
        // For other types, just replace the content
        newSections[sectionIndex].content = suggestion
    }

    // Clear the suggestions after applying
    newSections[sectionIndex].suggestions = []
    setSections(newSections)
    setActiveSection(null)

    toast({
      title: "Suggestion applied",
      description: "The AI suggestion has been applied to your resume",
    })
  }

  // Generate custom AI content
  const generateCustomAiContent = async () => {
    if (!aiPrompt || !currentSectionId) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingContent(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const generatedText =
        "This is AI-generated content based on your prompt. In a real implementation, this would be generated by an AI model like GPT-4 or Gemini."

      // Find the section and update it
      const sectionIndex = sections.findIndex((s) => s.id === currentSectionId)
      if (sectionIndex === -1) return

      const newSections = [...sections]
      const section = newSections[sectionIndex]

      if (section.type === "summary" || section.type === "custom") {
        newSections[sectionIndex].content = generatedText
      } else if (section.type === "experience") {
        newSections[sectionIndex].content = {
          ...section.content,
          description: generatedText,
        }
      } else if (section.type === "education") {
        newSections[sectionIndex].content = {
          ...section.content,
          description: generatedText,
        }
      } else if (section.type === "projects") {
        newSections[sectionIndex].content = {
          ...section.content,
          description: generatedText,
        }
      }

      setSections(newSections)

      setShowAiDialog(false)
      setAiPrompt("")
      setCurrentSectionId(null)

      toast({
        title: "Content generated",
        description: "The AI-generated content has been added to your resume",
      })
    } catch (error) {
      console.error("Error generating content:", error)
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingContent(false)
    }
  }

  // Generate the preview HTML
  const generatePreview = () => {
    if (!selectedTemplate?.html_content) return

    let html = selectedTemplate.html_content
    const personalData = sections.find((s) => s.type === "personal")?.content || {}
    const summaryData = sections.find((s) => s.type === "summary")?.content || ""
    const experienceData = sections.filter((s) => s.type === "experience").map((s) => s.content)
    const educationData = sections.filter((s) => s.type === "education").map((s) => s.content)
    const skillsData = sections.find((s) => s.type === "skills")?.content || []
    const projectsData = sections.filter((s) => s.type === "projects").map((s) => s.content)
    const languagesData = sections.find((s) => s.type === "languages")?.content || []

    // Replace personal info placeholders
    html = html.replace(/{{name}}/g, personalData.fullName || "")
    html = html.replace(/{{email}}/g, personalData.email || "")
    html = html.replace(/{{phone}}/g, personalData.phone || "")
    html = html.replace(/{{address}}/g, personalData.address || "")
    html = html.replace(/{{linkedin}}/g, personalData.linkedin || "")
    html = html.replace(/{{website}}/g, personalData.website || "")
    html = html.replace(/{{summary}}/g, summaryData || "")

    // Replace experience placeholders
    let experienceHtml = ""
    if (html.includes("{{#each experience}}")) {
      const expTemplate = html.match(/{{#each experience}}([\s\S]*?){{\/each}}/)?.[1] || ""

      experienceData.forEach((exp) => {
        let expHtml = expTemplate
        expHtml = expHtml.replace(/{{position}}/g, exp.position || "")
        expHtml = expHtml.replace(/{{company}}/g, exp.company || "")
        expHtml = expHtml.replace(/{{location}}/g, exp.location || "")
        expHtml = expHtml.replace(/{{startDate}}/g, exp.startDate || "")
        expHtml = expHtml.replace(/{{endDate}}/g, exp.endDate || "")
        expHtml = expHtml.replace(/{{description}}/g, exp.description || "")

        // Add achievements if they exist
        if (Array.isArray(exp.achievements) && exp.achievements.length > 0) {
          let achievementsHtml = "<ul class='achievements'>"
          exp.achievements.forEach((achievement: string) => {
            achievementsHtml += `<li>${achievement}</li>`
          })
          achievementsHtml += "</ul>"
          expHtml = expHtml.replace(/{{achievements}}/g, achievementsHtml)
        } else {
          expHtml = expHtml.replace(/{{achievements}}/g, "")
        }

        experienceHtml += expHtml
      })

      html = html.replace(/{{#each experience}}[\s\S]*?{{\/each}}/g, experienceHtml)
    }

    // Replace education placeholders
    let educationHtml = ""
    if (html.includes("{{#each education}}")) {
      const eduTemplate = html.match(/{{#each education}}([\s\S]*?){{\/each}}/)?.[1] || ""

      educationData.forEach((edu) => {
        let eduHtml = eduTemplate
        eduHtml = eduHtml.replace(/{{degree}}/g, edu.degree || "")
        eduHtml = eduHtml.replace(/{{fieldOfStudy}}/g, edu.fieldOfStudy || "")
        eduHtml = eduHtml.replace(/{{school}}/g, edu.school || "")
        eduHtml = eduHtml.replace(/{{startDate}}/g, edu.startDate || "")
        eduHtml = eduHtml.replace(/{{endDate}}/g, edu.endDate || "")
        eduHtml = eduHtml.replace(/{{description}}/g, edu.description || "")
        educationHtml += eduHtml
      })

      html = html.replace(/{{#each education}}[\s\S]*?{{\/each}}/g, educationHtml)
    }

    // Replace skills placeholders
    let skillsHtml = ""
    if (html.includes("{{#each skills}}")) {
      const skillTemplate = html.match(/{{#each skills}}([\s\S]*?){{\/each}}/)?.[1] || ""

      skillsData.forEach((skill: any) => {
        let skillHtml = skillTemplate
        skillHtml = skillHtml.replace(/{{name}}/g, skill.name || "")
        skillsHtml += skillHtml
      })

      html = html.replace(/{{#each skills}}[\s\S]*?{{\/each}}/g, skillsHtml)
    }

    // Replace projects placeholders
    let projectsHtml = ""
    if (html.includes("{{#each projects}}")) {
      const projectTemplate = html.match(/{{#each projects}}([\s\S]*?){{\/each}}/)?.[1] || ""

      projectsData.forEach((project) => {
        let projectHtml = projectTemplate
        projectHtml = projectHtml.replace(/{{name}}/g, project.name || "")
        projectHtml = projectHtml.replace(/{{description}}/g, project.description || "")
        projectHtml = projectHtml.replace(/{{url}}/g, project.url || "")
        projectHtml = projectHtml.replace(/{{technologies}}/g, project.technologies || "")
        projectHtml = projectHtml.replace(/{{startDate}}/g, project.startDate || "")
        projectHtml = projectHtml.replace(/{{endDate}}/g, project.endDate || "")
        projectsHtml += projectHtml
      })

      html = html.replace(/{{#each projects}}[\s\S]*?{{\/each}}/g, projectsHtml)
    }

    // Replace languages placeholders
    let languagesHtml = ""
    if (html.includes("{{#each languages}}")) {
      const langTemplate = html.match(/{{#each languages}}([\s\S]*?){{\/each}}/)?.[1] || ""

      languagesData.forEach((lang: any) => {
        let langHtml = langTemplate
        langHtml = langHtml.replace(/{{language}}/g, lang.language || "")
        langHtml = langHtml.replace(/{{proficiency}}/g, lang.proficiency || "")
        languagesHtml += langHtml
      })

      html = html.replace(/{{#each languages}}[\s\S]*?{{\/each}}/g, languagesHtml)
    }

    // Custom color scheme
    let css = selectedTemplate.css_content || ""
    css = css.replace(/--primary-color:[^;]+;/g, `--primary-color: ${colorScheme.primary};`)
    css = css.replace(/--secondary-color:[^;]+;/g, `--secondary-color: ${colorScheme.secondary};`)
    css = css.replace(/--text-color:[^;]+;/g, `--text-color: ${colorScheme.text};`)
    css = css.replace(/--background-color:[^;]+;/g, `--background-color: ${colorScheme.background};`)

    // Add CSS
    if (css) {
      html = `<style>${css}</style>${html}`
    }

    setPreviewHtml(html)
  }

  // Save the resume data
  const handleSave = () => {
    const data = {
      personalInfo: sections.find((s) => s.type === "personal")?.content || {},
      summary: sections.find((s) => s.type === "summary")?.content || "",
      experience: sections.filter((s) => s.type === "experience").map((s) => s.content),
      education: sections.filter((s) => s.type === "education").map((s) => s.content),
      skills: sections.find((s) => s.type === "skills")?.content || [],
      projects: sections.filter((s) => s.type === "projects").map((s) => s.content),
      languages: sections.find((s) => s.type === "languages")?.content || [],
      templateId: selectedTemplate?.id,
      colorScheme,
      html: previewHtml,
    }

    onSave(data)
  }

  // Handle template selection
  const handleTemplateSelection = (template: ResumeTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateSelector(false)
  }

  // Optimize resume for job description
  const optimizeForJob = async () => {
    if (!jobDescription) {
      toast({
        title: "Job description required",
        description: "Please enter a job description to optimize your resume",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Optimizing your resume",
      description: "This may take a moment...",
    })

    // Optimize each section
    const personalSection = sections.find((s) => s.type === "personal")
    const summarySection = sections.find((s) => s.type === "summary")
    const skillsSection = sections.find((s) => s.type === "skills")

    if (summarySection) {
      const summaryIndex = sections.findIndex((s) => s.id === summarySection.id)
      await generateAiSuggestions(summaryIndex, "summary")
    }

    if (skillsSection) {
      const skillsIndex = sections.findIndex((s) => s.id === skillsSection.id)
      await generateAiSuggestions(skillsIndex, "skills")
    }

    toast({
      title: "Resume optimized",
      description: "Review the AI suggestions for each section",
    })
  }

  // Toggle AI dialog
  const openAiDialog = (sectionId: string) => {
    setCurrentSectionId(sectionId)
    setShowAiDialog(true)
  }

  // Render the section editor based on section type
  const renderSectionEditor = (section: Section, index: number) => {
    switch (section.type) {
      case "personal":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`fullName-${section.id}`}>Full Name</Label>
              <Input
                id={`fullName-${section.id}`}
                value={section.content.fullName || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, fullName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`email-${section.id}`}>Email</Label>
              <Input
                id={`email-${section.id}`}
                value={section.content.email || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`phone-${section.id}`}>Phone</Label>
              <Input
                id={`phone-${section.id}`}
                value={section.content.phone || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`address-${section.id}`}>Address</Label>
              <Input
                id={`address-${section.id}`}
                value={section.content.address || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, address: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`linkedin-${section.id}`}>LinkedIn (optional)</Label>
              <Input
                id={`linkedin-${section.id}`}
                value={section.content.linkedin || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, linkedin: e.target.value })}
                className="mt-1"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label htmlFor={`website-${section.id}`}>Website (optional)</Label>
              <Input
                id={`website-${section.id}`}
                value={section.content.website || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, website: e.target.value })}
                className="mt-1"
                placeholder="https://example.com"
              />
            </div>
          </div>
        )

      case "summary":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Label htmlFor={`summary-${section.id}`}>Professional Summary</Label>
                <Textarea
                  id={`summary-${section.id}`}
                  value={section.content || ""}
                  onChange={(e) => updateSectionContent(index, e.target.value)}
                  className="mt-1"
                  rows={5}
                />
              </div>
              <div className="ml-2 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => generateAiSuggestions(index, "summary")}
                  disabled={isGeneratingSuggestions}
                  title="Generate AI suggestions based on job description"
                >
                  <Lightbulb className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => openAiDialog(section.id)}
                  title="Write custom AI prompt"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {activeSection === section.id && section.suggestions && section.suggestions.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md mt-2 border">
                <h4 className="text-sm font-medium mb-2">AI Suggestions</h4>
                <div className="space-y-2">
                  {section.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-2 rounded border text-sm">
                      <p className="mb-2">{suggestion}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion(index, idx)}
                        className="text-xs"
                      >
                        Apply This Suggestion
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "experience":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`company-${section.id}`}>Company</Label>
              <Input
                id={`company-${section.id}`}
                value={section.content.company || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, company: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`position-${section.id}`}>Position</Label>
              <Input
                id={`position-${section.id}`}
                value={section.content.position || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, position: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`location-${section.id}`}>Location</Label>
              <Input
                id={`location-${section.id}`}
                value={section.content.location || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, location: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`startDate-${section.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${section.id}`}
                  value={section.content.startDate || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, startDate: e.target.value })}
                  className="mt-1"
                  placeholder="MM/YYYY"
                />
              </div>
              <div>
                <Label htmlFor={`endDate-${section.id}`}>End Date</Label>
                <Input
                  id={`endDate-${section.id}`}
                  value={section.content.endDate || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, endDate: e.target.value })}
                  className="mt-1"
                  placeholder="MM/YYYY or Present"
                />
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Label htmlFor={`description-${section.id}`}>Description</Label>
                <Textarea
                  id={`description-${section.id}`}
                  value={section.content.description || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, description: e.target.value })}
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div className="ml-2 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => openAiDialog(section.id)}
                  title="Write custom AI prompt"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label>Key Achievements</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateAiSuggestions(index, "experience")}
                  disabled={isGeneratingSuggestions}
                  className="h-8"
                >
                  {isGeneratingSuggestions && activeSection === section.id ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Lightbulb className="h-3 w-3 mr-1" />
                  )}
                  Suggest Achievements
                </Button>
              </div>

              <div className="mt-2 space-y-2">
                {Array.isArray(section.content.achievements) &&
                  section.content.achievements.map((achievement: string, achIdx: number) => (
                    <div key={achIdx} className="flex items-center gap-2">
                      <Input
                        value={achievement}
                        onChange={(e) => {
                          const newAchievements = [...section.content.achievements]
                          newAchievements[achIdx] = e.target.value
                          updateSectionContent(index, { ...section.content, achievements: newAchievements })
                        }}
                        placeholder="Describe a key achievement"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newAchievements = [...section.content.achievements]
                          newAchievements.splice(achIdx, 1)
                          updateSectionContent(index, { ...section.content, achievements: newAchievements })
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const achievements = Array.isArray(section.content.achievements)
                      ? [...section.content.achievements]
                      : []
                    achievements.push("")
                    updateSectionContent(index, { ...section.content, achievements })
                  }}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Achievement
                </Button>
              </div>

              {activeSection === section.id && section.suggestions && section.suggestions.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md mt-3 border">
                  <h4 className="text-sm font-medium mb-2">Suggested Achievements</h4>
                  <div className="space-y-2">
                    {section.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-2 rounded border text-sm">
                        <p className="mb-2">{suggestion}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applySuggestion(index, idx)}
                          className="text-xs"
                        >
                          Add This Achievement
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case "education":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`school-${section.id}`}>School/University</Label>
              <Input
                id={`school-${section.id}`}
                value={section.content.school || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, school: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`degree-${section.id}`}>Degree</Label>
              <Input
                id={`degree-${section.id}`}
                value={section.content.degree || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, degree: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`fieldOfStudy-${section.id}`}>Field of Study</Label>
              <Input
                id={`fieldOfStudy-${section.id}`}
                value={section.content.fieldOfStudy || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, fieldOfStudy: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`eduStartDate-${section.id}`}>Start Date</Label>
                <Input
                  id={`eduStartDate-${section.id}`}
                  value={section.content.startDate || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, startDate: e.target.value })}
                  className="mt-1"
                  placeholder="MM/YYYY"
                />
              </div>
              <div>
                <Label htmlFor={`eduEndDate-${section.id}`}>End Date</Label>
                <Input
                  id={`eduEndDate-${section.id}`}
                  value={section.content.endDate || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, endDate: e.target.value })}
                  className="mt-1"
                  placeholder="MM/YYYY or Present"
                />
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Label htmlFor={`eduDescription-${section.id}`}>Description</Label>
                <Textarea
                  id={`eduDescription-${section.id}`}
                  value={section.content.description || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="ml-2 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => openAiDialog(section.id)}
                  title="Write custom AI prompt"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )

      case "skills":
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Skills</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateAiSuggestions(index, "skills")}
                disabled={isGeneratingSuggestions}
                className="h-8"
              >
                {isGeneratingSuggestions && activeSection === section.id ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Lightbulb className="h-3 w-3 mr-1" />
                )}
                Suggest Skills
              </Button>
            </div>

            {section.content.map((skill: any, skillIndex: number) => (
              <div key={skill.id} className="flex items-center gap-2">
                <Input
                  value={skill.name || ""}
                  onChange={(e) => {
                    const newSkills = [...section.content]
                    newSkills[skillIndex].name = e.target.value
                    updateSectionContent(index, newSkills)
                  }}
                  placeholder="Enter a skill"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (section.content.length > 1) {
                      const newSkills = [...section.content]
                      newSkills.splice(skillIndex, 1)
                      updateSectionContent(index, newSkills)
                    }
                  }}
                  disabled={section.content.length <= 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newSkills = [...section.content]
                const newId = newSkills.length > 0 ? Math.max(...newSkills.map((s: any) => s.id)) + 1 : 1
                newSkills.push({ id: newId, name: "" })
                updateSectionContent(index, newSkills)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>

            {activeSection === section.id && section.suggestions && section.suggestions.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md mt-2 border">
                <h4 className="text-sm font-medium mb-2">Suggested Skills</h4>
                <div>
                  <div className="bg-white dark:bg-slate-800 p-2 rounded border text-sm">
                    <p className="mb-2">{section.suggestions.join(", ")}</p>
                    <Button size="sm" variant="outline" onClick={() => applySuggestion(index, 0)} className="text-xs">
                      Add These Skills
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case "projects":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`projectName-${section.id}`}>Project Name</Label>
              <Input
                id={`projectName-${section.id}`}
                value={section.content.name || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Label htmlFor={`projectDescription-${section.id}`}>Description</Label>
                <Textarea
                  id={`projectDescription-${section.id}`}
                  value={section.content.description || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="ml-2 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => openAiDialog(section.id)}
                  title="Write custom AI prompt"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor={`projectTechnologies-${section.id}`}>Technologies Used</Label>
              <Input
                id={`projectTechnologies-${section.id}`}
                value={section.content.technologies || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, technologies: e.target.value })}
                className="mt-1"
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>
            <div>
              <Label htmlFor={`projectUrl-${section.id}`}>Project URL (optional)</Label>
              <Input
                id={`projectUrl-${section.id}`}
                value={section.content.url || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, url: e.target.value })}
                className="mt-1"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`projectStartDate-${section.id}`}>Start Date (optional)</Label>
                <Input
                  id={`projectStartDate-${section.id}`}
                  value={section.content.startDate || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, startDate: e.target.value })}
                  className="mt-1"
                  placeholder="MM/YYYY"
                />
              </div>
              <div>
                <Label htmlFor={`projectEndDate-${section.id}`}>End Date (optional)</Label>
                <Input
                  id={`projectEndDate-${section.id}`}
                  value={section.content.endDate || ""}
                  onChange={(e) => updateSectionContent(index, { ...section.content, endDate: e.target.value })}
                  className="mt-1"
                  placeholder="MM/YYYY or Present"
                />
              </div>
            </div>
          </div>
        )

      case "languages":
        return (
          <div className="space-y-4">
            {Array.isArray(section.content) &&
              section.content.map((lang: any, langIndex: number) => (
                <div key={langIndex} className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <Label htmlFor={`language-${section.id}-${langIndex}`}>Language</Label>
                    <Input
                      id={`language-${section.id}-${langIndex}`}
                      value={lang.language || ""}
                      onChange={(e) => {
                        const newLangs = [...section.content]
                        newLangs[langIndex].language = e.target.value
                        updateSectionContent(index, newLangs)
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`proficiency-${section.id}-${langIndex}`}>Proficiency</Label>
                      <Input
                        id={`proficiency-${section.id}-${langIndex}`}
                        value={lang.proficiency || ""}
                        onChange={(e) => {
                          const newLangs = [...section.content]
                          newLangs[langIndex].proficiency = e.target.value
                          updateSectionContent(index, newLangs)
                        }}
                        className="mt-1"
                        placeholder="e.g., Fluent, Native, Intermediate"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-7"
                      onClick={() => {
                        if (section.content.length > 1) {
                          const newLangs = [...section.content]
                          newLangs.splice(langIndex, 1)
                          updateSectionContent(index, newLangs)
                        }
                      }}
                      disabled={section.content.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newLangs = [...section.content]
                newLangs.push({ language: "", proficiency: "" })
                updateSectionContent(index, newLangs)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </div>
        )

      case "custom":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${section.id}`}>Section Title</Label>
              <Input
                id={`title-${section.id}`}
                value={section.title}
                onChange={(e) => updateSectionTitle(index, e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Label htmlFor={`content-${section.id}`}>Content</Label>
                <Textarea
                  id={`content-${section.id}`}
                  value={section.content || ""}
                  onChange={(e) => updateSectionContent(index, e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div className="ml-2 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => openAiDialog(section.id)}
                  title="Write custom AI prompt"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Resume Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="jobDescription">Job Description (for AI optimization)</Label>
            <div className="flex gap-2 mt-1">
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here to get AI suggestions..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={optimizeForJob}
                  disabled={!jobDescription}
                  className="whitespace-nowrap"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Optimize Resume
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <Label>Template & Design</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Palette className="h-4 w-4 mr-2" />
                    Colors
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Color Scheme</h4>
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: colorScheme.primary }} />
                        <Input
                          id="primaryColor"
                          type="text"
                          value={colorScheme.primary}
                          onChange={(e) => setColorScheme({ ...colorScheme, primary: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: colorScheme.secondary }}
                        />
                        <Input
                          id="secondaryColor"
                          type="text"
                          value={colorScheme.secondary}
                          onChange={(e) => setColorScheme({ ...colorScheme, secondary: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: colorScheme.text }} />
                        <Input
                          id="textColor"
                          type="text"
                          value={colorScheme.text}
                          onChange={(e) => setColorScheme({ ...colorScheme, text: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: colorScheme.background }}
                        />
                        <Input
                          id="backgroundColor"
                          type="text"
                          value={colorScheme.background}
                          onChange={(e) => setColorScheme({ ...colorScheme, background: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Presets</h4>
                      <ToggleGroup type="single" className="justify-start">
                        <ToggleGroupItem
                          value="modern"
                          onClick={() =>
                            setColorScheme({
                              primary: "#0f766e",
                              secondary: "#0e7490",
                              text: "#1e293b",
                              background: "#f8fafc",
                            })
                          }
                        >
                          Modern
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="classic"
                          onClick={() =>
                            setColorScheme({
                              primary: "#1e40af",
                              secondary: "#1e3a8a",
                              text: "#111827",
                              background: "#ffffff",
                            })
                          }
                        >
                          Classic
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="bold"
                          onClick={() =>
                            setColorScheme({
                              primary: "#9333ea",
                              secondary: "#7e22ce",
                              text: "#1e293b",
                              background: "#f8fafc",
                            })
                          }
                        >
                          Bold
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="sm" onClick={() => setShowTemplateSelector(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Change Template
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 overflow-y-auto max-h-[800px] pr-2">
              {sections.map((section, index) => (
                <Card key={section.id} className="border border-gray-200">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex flex-col mr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSection(index, "up")}
                          disabled={index === 0}
                          className="h-5 w-5"
                        >
                          <ArrowUpDown className="h-4 w-4 rotate-90" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSection(index, "down")}
                          disabled={index === sections.length - 1}
                          className="h-5 w-5"
                        >
                          <ArrowUpDown className="h-4 w-4 -rotate-90" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                    {section.type !== "personal" && section.type !== "summary" && (
                      <Button variant="ghost" size="icon" onClick={() => removeSection(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>{renderSectionEditor(section, index)}</CardContent>
                </Card>
              ))}

              <div className="flex gap-2 justify-between mt-6">
                <div>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => addSection("experience")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => addSection("education")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => addSection("projects")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Projects
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSection("custom")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 min-h-[800px]" ref={resumeContentRef}>
              <div className="bg-white shadow-lg rounded-lg h-full overflow-auto">
                {previewHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSave}>Save Resume</Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Selector Dialog */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
            <DialogDescription>
              Select a template for your resume. You can customize it further in the editor.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 max-h-96 overflow-y-auto p-1">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-all ${
                  selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleTemplateSelection(template)}
              >
                <div className="aspect-[3/4] bg-muted">
                  {template.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-4">
                        <h3 className="font-medium">{template.name}</h3>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 text-center">
                  <h3 className="font-medium text-sm">{template.name}</h3>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Prompt Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write AI Prompt</DialogTitle>
            <DialogDescription>Enter a custom prompt to generate AI content for this section</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">Prompt</Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: Write a professional summary for a software engineer with 5 years of experience"
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAiDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateCustomAiContent} disabled={isGeneratingContent}>
              {isGeneratingContent ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate Content"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
