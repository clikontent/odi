"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Save,
  ZoomIn,
  ZoomOut,
  Edit,
  Eye,
  Maximize,
  Minimize,
  FileIcon,
  Sparkles,
  Lock,
  Unlock,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { generateSummary, suggestSkills, suggestAchievements } from "@/lib/gemini"
import { cn } from "@/lib/utils"

interface StructuredResumeBuilderProps {
  templateHtml: string
  templateCss: string
  onSave: (html: string) => void
}

// Define section types for structured editing
type SectionType = "header" | "summary" | "experience" | "education" | "skills" | "custom"

interface Section {
  id: string
  type: SectionType
  title: string
  content: string
  isLocked: boolean
}

const StructuredResumeBuilder = ({ templateHtml, templateCss, onSave }: StructuredResumeBuilderProps) => {
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string>("")
  const [aiSection, setAiSection] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Parse template into structured sections
  useEffect(() => {
    if (!templateHtml) return

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = templateHtml

    // Extract sections based on common resume structure
    const extractedSections: Section[] = []

    // Helper function to create a section from an element
    const createSectionFromElement = (element: Element, type: SectionType, title: string) => {
      return {
        id: `section-${type}-${extractedSections.length}`,
        type,
        title,
        content: element.innerHTML,
        isLocked: false,
      }
    }

    // Try to find header section (usually contains name, contact info)
    const headerElements = tempDiv.querySelectorAll(
      'header, .header, .contact, [class*="header"], [class*="contact"], h1',
    )
    if (headerElements.length > 0) {
      extractedSections.push(createSectionFromElement(headerElements[0], "header", "Contact Information"))
    }

    // Try to find summary section
    const summaryElements = tempDiv.querySelectorAll(
      '.summary, .objective, [class*="summary"], [class*="objective"], [class*="profile"]',
    )
    if (summaryElements.length > 0) {
      extractedSections.push(createSectionFromElement(summaryElements[0], "summary", "Professional Summary"))
    }

    // Try to find experience section
    const experienceElements = tempDiv.querySelectorAll('.experience, [class*="experience"], [class*="work"]')
    if (experienceElements.length > 0) {
      extractedSections.push(createSectionFromElement(experienceElements[0], "experience", "Work Experience"))
    }

    // Try to find education section
    const educationElements = tempDiv.querySelectorAll('.education, [class*="education"], [class*="academic"]')
    if (educationElements.length > 0) {
      extractedSections.push(createSectionFromElement(educationElements[0], "education", "Education"))
    }

    // Try to find skills section
    const skillsElements = tempDiv.querySelectorAll('.skills, [class*="skills"], [class*="competencies"]')
    if (skillsElements.length > 0) {
      extractedSections.push(createSectionFromElement(skillsElements[0], "skills", "Skills"))
    }

    // If we couldn't find structured sections, create a single custom section with all content
    if (extractedSections.length === 0) {
      extractedSections.push({
        id: "section-custom-0",
        type: "custom",
        title: "Resume Content",
        content: templateHtml,
        isLocked: false,
      })
    }

    setSections(extractedSections)
  }, [templateHtml])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Update preview when sections change
  useEffect(() => {
    if (previewRef.current && mode === "preview") {
      // Combine all sections into a single HTML document
      const combinedHtml = sections.map((section) => section.content).join("")

      previewRef.current.innerHTML = combinedHtml

      // Apply CSS
      if (templateCss) {
        const styleElement = document.createElement("style")
        styleElement.textContent = templateCss
        previewRef.current.appendChild(styleElement)
      }
    }
  }, [mode, sections, templateCss])

  // Handle saving the resume
  const handleSave = () => {
    // Combine all sections into a single HTML document
    const combinedHtml = sections.map((section) => section.content).join("")

    onSave(combinedHtml)
    setLastSaved(new Date())

    toast({
      title: "Resume Saved",
      description: "Your resume has been saved successfully.",
    })
  }

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 50))
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Export to PDF
  const exportToPdf = async () => {
    try {
      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default

      // Combine all sections into a single HTML document
      const combinedHtml = sections.map((section) => section.content).join("")

      // Create a temporary div for the PDF content
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = combinedHtml

      // Add CSS to the element
      const style = document.createElement("style")
      style.textContent = templateCss
      tempDiv.appendChild(style)

      const opt = {
        margin: 10,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      html2pdf().set(opt).from(tempDiv).save()

      toast({
        title: "PDF Exported",
        description: "Your resume has been exported as a PDF.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Export to Word (DOCX)
  const exportToWord = async () => {
    try {
      const fileSaverModule = await import("file-saver")
      const saveAs = fileSaverModule.saveAs

      // Combine all sections into a single HTML document
      const combinedHtml = sections.map((section) => section.content).join("")

      // Create a new Blob with HTML content
      const preHtml = `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Resume</title>
            <style>
              ${templateCss}
              body {
                font-family: Arial, sans-serif;
              }
            </style>
          </head>
          <body>`
      const postHtml = `</body></html>`

      const fullHtml = preHtml + combinedHtml + postHtml

      const blob = new Blob([fullHtml], { type: "application/msword" })
      saveAs(blob, "resume.doc")

      toast({
        title: "Word Document Exported",
        description: "Your resume has been exported as a Word document.",
      })
    } catch (error) {
      console.error("Error exporting to Word:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export Word document. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Generate AI content for a section
  const generateAiContent = async () => {
    if (!aiSection) return

    setAiLoading(true)

    try {
      const section = sections.find((s) => s.id === aiSection)
      if (!section) return

      let generatedContent = ""

      // Determine what type of content to generate based on the section type and prompt
      if (section.type === "summary" || aiPrompt.toLowerCase().includes("summary")) {
        // Find skills section to extract skills
        const skillsSection = sections.find((s) => s.type === "skills")
        const skills = skillsSection
          ? skillsSection.content
              .split(",")
              .map((s) => s.replace(/<[^>]*>/g, "").trim())
              .filter(Boolean)
          : []

        generatedContent = await generateSummary(section.content.replace(/<[^>]*>/g, ""), skills)
      } else if (section.type === "skills" || aiPrompt.toLowerCase().includes("skills")) {
        // Find experience section to extract job description
        const expSection = sections.find((s) => s.type === "experience")
        const jobDescription = expSection ? expSection.content.replace(/<[^>]*>/g, "") : ""

        // Extract current skills
        const currentSkills = section.content
          .replace(/<[^>]*>/g, "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)

        const suggestedSkills = await suggestSkills(jobDescription, currentSkills)
        generatedContent = `<ul>${suggestedSkills.map((skill) => `<li>${skill}</li>`).join("")}</ul>`
      } else if (section.type === "experience" || aiPrompt.toLowerCase().includes("achievements")) {
        const achievements = await suggestAchievements(section.content.replace(/<[^>]*>/g, ""))
        generatedContent = `<ul>${achievements.map((achievement) => `<li>${achievement}</li>`).join("")}</ul>`
      } else {
        // Generic content generation
        generatedContent = await generateSummary(section.content.replace(/<[^>]*>/g, ""), [])
      }

      // Update the section with the generated content
      if (generatedContent) {
        setSections(sections.map((s) => (s.id === aiSection ? { ...s, content: generatedContent } : s)))
      }

      toast({
        title: "Content Generated",
        description: "AI-generated content has been added to your resume.",
      })
    } catch (error) {
      console.error("Error generating AI content:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAiLoading(false)
      setAiDialogOpen(false)
    }
  }

  // Handle editing a section
  const handleEditSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    setEditingSection(sectionId)
    setEditContent(section.content)
  }

  // Save edited section content
  const saveEditedSection = () => {
    if (!editingSection) return

    setSections(
      sections.map((section) => (section.id === editingSection ? { ...section, content: editContent } : section)),
    )

    setEditingSection(null)
    setEditContent("")
  }

  // Toggle section lock
  const toggleSectionLock = (sectionId: string) => {
    setSections(
      sections.map((section) => (section.id === sectionId ? { ...section, isLocked: !section.isLocked } : section)),
    )
  }

  // Open AI dialog for a section
  const openAiDialog = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    setAiSection(sectionId)

    // Set default prompt based on section type
    let defaultPrompt = "Generate professional content for this section."

    switch (section.type) {
      case "summary":
        defaultPrompt = "Generate a professional summary highlighting my skills and experience."
        break
      case "experience":
        defaultPrompt = "Generate professional achievements for my work experience."
        break
      case "education":
        defaultPrompt = "Format my education details professionally."
        break
      case "skills":
        defaultPrompt = "Suggest relevant professional skills for my resume."
        break
    }

    setAiPrompt(defaultPrompt)
    setAiDialogOpen(true)
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "edit" | "preview")}>
            <TabsList>
              <TabsTrigger value="edit">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {lastSaved && (
            <span className="text-xs text-muted-foreground ml-4">Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate AI Content</DialogTitle>
                <DialogDescription>Use AI to generate professional content for your resume.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">What would you like to generate?</Label>
                  <Textarea
                    id="prompt"
                    placeholder="E.g., Generate a professional summary highlighting my skills in marketing and design"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={generateAiContent} disabled={aiLoading}>
                  {aiLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToPdf}>
                <FileIcon className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToWord}>
                <FileIcon className="h-4 w-4 mr-2" />
                Export as Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <>
                <Minimize className="h-4 w-4 mr-2" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>

          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save & Continue
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        {mode === "edit" ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center">
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                  width: "210mm", // A4 width
                  minHeight: "297mm", // A4 height
                  padding: "20mm",
                  backgroundColor: "white",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s ease",
                }}
                className="resume-page"
              >
                <div ref={editorRef} className="h-full">
                  {/* Section editing dialog */}
                  <Dialog
                    open={!!editingSection}
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditingSection(null)
                        setEditContent("")
                      }
                    }}
                  >
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>
                          Edit {sections.find((s) => s.id === editingSection)?.title || "Section"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[300px] font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">You can use HTML tags to format your content.</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingSection(null)}>
                          Cancel
                        </Button>
                        <Button onClick={saveEditedSection}>Save Changes</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Sections */}
                  <div className="space-y-6">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className={cn(
                          "relative border rounded-md p-4 transition-all",
                          section.isLocked ? "bg-gray-50" : "hover:border-primary",
                        )}
                      >
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleSectionLock(section.id)}
                            title={section.isLocked ? "Unlock Section" : "Lock Section"}
                          >
                            {section.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openAiDialog(section.id)}
                            title="Generate AI Content"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditSection(section.id)}
                            disabled={section.isLocked}
                            title="Edit Section"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>

                        <h3 className="text-sm font-medium text-muted-foreground mb-2">{section.title}</h3>

                        <div
                          className={cn("section-content", section.isLocked && "opacity-75")}
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 p-2 bg-muted rounded-b-md">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="w-32">
                <Slider value={[zoom]} min={50} max={200} step={10} onValueChange={(value) => setZoom(value[0])} />
              </div>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm">{zoom}%</span>
            </div>
          </div>
        ) : (
          <Card className="h-full">
            <CardContent className="p-8 h-full overflow-auto">
              <div ref={previewRef} className="min-h-[800px]" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default StructuredResumeBuilder
