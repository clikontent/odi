"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical } from "lucide-react"

// Define the section types
type SectionType = "personal" | "summary" | "experience" | "education" | "skills" | "custom"

// Define the section data structure
interface Section {
  id: string
  type: SectionType
  title: string
  content: any
}

// Define the props for the DragDropResumeBuilder component
interface DragDropResumeBuilderProps {
  initialData?: {
    personalInfo: any
    summary: string
    experience: any[]
    education: any[]
    skills: any[]
  }
  onSave: (data: any) => void
  templateHtml: string
  templateCss: string
}

export function DragDropResumeBuilder({ initialData, onSave, templateHtml, templateCss }: DragDropResumeBuilderProps) {
  // Initialize sections with default or provided data
  const [sections, setSections] = useState<Section[]>([])
  const [previewHtml, setPreviewHtml] = useState<string>("")

  // Initialize personal info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: initialData?.personalInfo?.fullName || "",
    email: initialData?.personalInfo?.email || "",
    phone: initialData?.personalInfo?.phone || "",
    address: initialData?.personalInfo?.address || "",
  })

  // Initialize on component mount
  useEffect(() => {
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

    setSections(initialSections)
  }, [initialData])

  // Update preview HTML whenever sections change
  useEffect(() => {
    generatePreview()
  }, [sections, templateHtml, templateCss])

  // Handle drag end event
  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    // If dropped outside the list or no movement
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Reorder the sections
    const newSections = Array.from(sections)
    const [removed] = newSections.splice(source.index, 1)
    newSections.splice(destination.index, 0, removed)

    setSections(newSections)
  }

  // Add a new section
  const addSection = (type: SectionType) => {
    const newId = `${type}-${Date.now()}`
    let newContent: any = {}

    switch (type) {
      case "experience":
        newContent = {
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
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
      case "custom":
        newContent = ""
        break
      default:
        newContent = ""
    }

    const newSection: Section = {
      id: newId,
      type,
      title: getDefaultTitle(type),
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

  // Generate the preview HTML
  const generatePreview = () => {
    if (!templateHtml) return

    let html = templateHtml
    const personalData = sections.find((s) => s.type === "personal")?.content || {}
    const summaryData = sections.find((s) => s.type === "summary")?.content || ""
    const experienceData = sections.filter((s) => s.type === "experience").map((s) => s.content)
    const educationData = sections.filter((s) => s.type === "education").map((s) => s.content)
    const skillsData = sections.find((s) => s.type === "skills")?.content || []

    // Replace personal info placeholders
    html = html.replace(/{{name}}/g, personalData.fullName || "")
    html = html.replace(/{{email}}/g, personalData.email || "")
    html = html.replace(/{{phone}}/g, personalData.phone || "")
    html = html.replace(/{{address}}/g, personalData.address || "")
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

    // Add CSS
    if (templateCss) {
      html = `<style>${templateCss}</style>${html}`
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
    }

    onSave(data)
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
          </div>
        )

      case "summary":
        return (
          <div>
            <Label htmlFor={`summary-${section.id}`}>Professional Summary</Label>
            <Textarea
              id={`summary-${section.id}`}
              value={section.content || ""}
              onChange={(e) => updateSectionContent(index, e.target.value)}
              className="mt-1"
              rows={4}
            />
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
            <div>
              <Label htmlFor={`description-${section.id}`}>Description</Label>
              <Textarea
                id={`description-${section.id}`}
                value={section.content.description || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, description: e.target.value })}
                className="mt-1"
                rows={4}
              />
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
            <div>
              <Label htmlFor={`eduDescription-${section.id}`}>Description</Label>
              <Textarea
                id={`eduDescription-${section.id}`}
                value={section.content.description || ""}
                onChange={(e) => updateSectionContent(index, { ...section.content, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )

      case "skills":
        return (
          <div className="space-y-4">
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
            <div>
              <Label htmlFor={`content-${section.id}`}>Content</Label>
              <Textarea
                id={`content-${section.id}`}
                value={section.content || ""}
                onChange={(e) => updateSectionContent(index, e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Resume Sections</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addSection("experience")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
            <Button variant="outline" size="sm" onClick={() => addSection("education")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
            <Button variant="outline" size="sm" onClick={() => addSection("custom")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="resume-sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <Card ref={provided.innerRef} {...provided.draggableProps} className="border border-gray-200">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                              <GripVertical className="h-5 w-5 text-gray-400" />
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Resume</Button>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-8 min-h-[800px]">
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
  )
}
