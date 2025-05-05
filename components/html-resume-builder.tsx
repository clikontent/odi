"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
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
  Undo,
  Redo,
  Sparkles,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
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
import { supabase } from "@/lib/supabase"
import { generateSummary, suggestSkills, suggestAchievements } from "@/lib/gemini"

interface HTMLResumeBuilderProps {
  templateHtml: string
  templateCss: string
  onSave: (html: string) => void
}

// Main component
const HTMLResumeBuilder = ({ templateHtml, templateCss, onSave }: HTMLResumeBuilderProps) => {
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [editableHtml, setEditableHtml] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiTarget, setAiTarget] = useState<string>("")
  const [aiPrompt, setAiPrompt] = useState<string>("")
  const [aiLoading, setAiLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontSize, setFontSize] = useState("16px")
  const [textColor, setTextColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("transparent")
  const [textAlign, setTextAlign] = useState("left")

  const editorRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)

    // Get current user
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
      }
    }

    getUserId()
  }, [])

  // Initialize with template HTML
  useEffect(() => {
    if (templateHtml && isClient) {
      setEditableHtml(templateHtml)
      // Initialize history with the template HTML
      setHistory([templateHtml])
      setHistoryIndex(0)
    }
  }, [templateHtml, isClient])

  // Update preview when editableHtml changes
  useEffect(() => {
    if (previewRef.current && mode === "preview" && isClient) {
      // Set the HTML content
      previewRef.current.innerHTML = editableHtml

      // Apply CSS
      if (templateCss) {
        const styleElement = document.createElement("style")
        styleElement.textContent = templateCss
        previewRef.current.appendChild(styleElement)
      }
    }
  }, [editableHtml, mode, templateCss, isClient])

  // Make content editable when in edit mode
  useEffect(() => {
    if (editorRef.current && mode === "edit" && isClient) {
      // Apply the HTML
      editorRef.current.innerHTML = editableHtml

      // Apply CSS
      if (templateCss) {
        const styleElement = document.createElement("style")
        styleElement.textContent = templateCss
        editorRef.current.appendChild(styleElement)
      }

      // Add custom CSS for the editor
      const editorStyles = document.createElement("style")
      editorStyles.textContent = `
        [contenteditable] {
          outline: none;
        }
        
        [contenteditable]:hover {
          outline: 1px dashed #3b82f6;
        }
        
        [contenteditable]:focus {
          outline: 2px solid #3b82f6;
        }
      `
      editorRef.current.appendChild(editorStyles)

      // Make all elements editable
      const makeEditable = (element: HTMLElement) => {
        // Skip style elements
        if (element.tagName === "STYLE") return

        // Make the element editable
        element.setAttribute("contenteditable", "true")

        // Add click handler to select the element
        element.addEventListener("click", (e) => {
          e.stopPropagation()
          setSelectedElement(element)

          // Get current styles
          const computedStyle = window.getComputedStyle(element)
          setFontFamily(computedStyle.fontFamily)
          setFontSize(computedStyle.fontSize)
          setTextColor(computedStyle.color)
          setBackgroundColor(computedStyle.backgroundColor)
          setTextAlign(computedStyle.textAlign)
        })
      }

      // Find all elements and make them editable
      const elements = editorRef.current.querySelectorAll("*")
      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          makeEditable(element)
        }
      })

      // Add event listener to save changes when content is edited
      editorRef.current.addEventListener("input", handleContentChange)

      return () => {
        if (editorRef.current) {
          editorRef.current.removeEventListener("input", handleContentChange)
        }
      }
    }
  }, [editableHtml, mode, templateCss, isClient])

  // Handle fullscreen changes
  useEffect(() => {
    if (!isClient) return

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [isClient])

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      // Get the updated HTML content
      const updatedHtml = editorRef.current.innerHTML

      // Update the editable HTML state
      setEditableHtml(updatedHtml)

      // Save to history
      saveToHistory()
    }
  }

  // Save current state to history
  const saveToHistory = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML

      // Only save if content has changed
      if (currentHtml !== history[historyIndex]) {
        // Remove any future history states if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1)

        // Add the new state to history
        setHistory([...newHistory, currentHtml])
        setHistoryIndex(historyIndex + 1)

        // Update the editable HTML state
        setEditableHtml(currentHtml)
      }
    }
  }

  // Undo the last change
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setEditableHtml(history[newIndex])
    }
  }

  // Redo the last undone change
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setEditableHtml(history[newIndex])
    }
  }

  // Handle saving the resume
  const handleSave = () => {
    if (editorRef.current) {
      const finalHtml = editorRef.current.innerHTML
      onSave(finalHtml)
      setLastSaved(new Date())

      toast({
        title: "Resume Saved",
        description: "Your resume has been saved successfully.",
      })
    }
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
    if (!isClient) return

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
    if (!isClient || !previewRef.current) return

    try {
      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default

      // Clone the content to avoid modifying the original
      const element = previewRef.current.cloneNode(true) as HTMLElement

      // Add CSS to the element
      const style = document.createElement("style")
      style.textContent = templateCss
      element.appendChild(style)

      const opt = {
        margin: 0,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      html2pdf().set(opt).from(element).save()

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
    if (!isClient) return

    try {
      const fileSaverModule = await import("file-saver")
      const saveAs = fileSaverModule.saveAs

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

      const fullHtml = preHtml + editableHtml + postHtml

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

  // Apply styles to selected element
  const applyFontFamily = (family: string) => {
    if (selectedElement) {
      selectedElement.style.fontFamily = family
      setFontFamily(family)
      saveToHistory()
    }
  }

  const applyFontSize = (size: string) => {
    if (selectedElement) {
      selectedElement.style.fontSize = size
      setFontSize(size)
      saveToHistory()
    }
  }

  const applyTextColor = (color: string) => {
    if (selectedElement) {
      selectedElement.style.color = color
      setTextColor(color)
      saveToHistory()
    }
  }

  const applyBackgroundColor = (color: string) => {
    if (selectedElement) {
      selectedElement.style.backgroundColor = color
      setBackgroundColor(color)
      saveToHistory()
    }
  }

  const applyTextAlign = (align: string) => {
    if (selectedElement) {
      selectedElement.style.textAlign = align
      setTextAlign(align)
      saveToHistory()
    }
  }

  const applyBold = () => {
    if (selectedElement) {
      const currentWeight = window.getComputedStyle(selectedElement).fontWeight
      selectedElement.style.fontWeight = currentWeight === "700" || currentWeight === "bold" ? "normal" : "bold"
      saveToHistory()
    }
  }

  const applyItalic = () => {
    if (selectedElement) {
      const currentStyle = window.getComputedStyle(selectedElement).fontStyle
      selectedElement.style.fontStyle = currentStyle === "italic" ? "normal" : "italic"
      saveToHistory()
    }
  }

  const applyUnderline = () => {
    if (selectedElement) {
      const currentDecoration = window.getComputedStyle(selectedElement).textDecoration
      selectedElement.style.textDecoration = currentDecoration.includes("underline") ? "none" : "underline"
      saveToHistory()
    }
  }

  // Insert image
  const insertImage = async () => {
    if (!selectedElement) return

    // Create a file input
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        // Create a placeholder while uploading
        const imgPlaceholder = document.createElement("img")
        imgPlaceholder.src = "/placeholder.svg"
        imgPlaceholder.alt = "Uploading..."
        imgPlaceholder.style.maxWidth = "100%"
        imgPlaceholder.style.height = "auto"

        // Add the placeholder to the element
        selectedElement.appendChild(imgPlaceholder)

        // Upload the image to Supabase Storage
        const { data, error } = await supabase.storage
          .from("resume-images")
          .upload(`${userId}/${Date.now()}-${file.name}`, file)

        if (error) throw error

        // Get the public URL
        const { data: urlData } = supabase.storage.from("resume-images").getPublicUrl(data.path)

        // Replace the placeholder with the actual image
        const img = document.createElement("img")
        img.src = urlData.publicUrl
        img.alt = "Resume image"
        img.style.maxWidth = "100%"
        img.style.height = "auto"

        selectedElement.replaceChild(img, imgPlaceholder)
        saveToHistory()
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
    }

    input.click()
  }

  // Generate AI content
  const openAiDialog = () => {
    if (!selectedElement) return

    setAiTarget(selectedElement.tagName)

    // Determine the type of section to suggest an appropriate prompt
    const sectionText = selectedElement.textContent?.toLowerCase() || ""
    let defaultPrompt = "Generate professional content for this section."

    if (sectionText.includes("summary") || sectionText.includes("objective")) {
      defaultPrompt = "Generate a professional summary highlighting my skills and experience."
    } else if (sectionText.includes("experience") || sectionText.includes("work")) {
      defaultPrompt = "Generate professional achievements for my work experience."
    } else if (sectionText.includes("education")) {
      defaultPrompt = "Format my education details professionally."
    } else if (sectionText.includes("skills")) {
      defaultPrompt = "Suggest relevant professional skills for my resume."
    }

    setAiPrompt(defaultPrompt)
    setAiDialogOpen(true)
  }

  // Generate AI content
  const generateAiContent = async () => {
    if (!userId || !selectedElement) {
      toast({
        title: "Error",
        description: "Please select an element and ensure you're logged in.",
        variant: "destructive",
      })
      return
    }

    setAiLoading(true)

    try {
      let generatedContent = ""
      const sectionText = selectedElement.textContent || ""

      // Determine what type of content to generate based on the section and prompt
      if (aiPrompt.toLowerCase().includes("summary")) {
        // Extract skills from the skills section if available
        const skillsSection = editorRef.current?.querySelector('[class*="skills"]') as HTMLElement
        const skills = skillsSection?.textContent?.split(",").map((s) => s.trim()) || []

        generatedContent = await generateSummary(sectionText, skills)
      } else if (aiPrompt.toLowerCase().includes("skills")) {
        // Extract job description from the experience section
        const expSection = editorRef.current?.querySelector('[class*="experience"]') as HTMLElement
        const jobDescription = expSection?.textContent || ""

        // Extract current skills
        const currentSkills = sectionText.split(",").map((s) => s.trim())

        const suggestedSkills = await suggestSkills(jobDescription, currentSkills)
        generatedContent = `<ul>${suggestedSkills.map((skill) => `<li>${skill}</li>`).join("")}</ul>`
      } else if (aiPrompt.toLowerCase().includes("achievements")) {
        const achievements = await suggestAchievements(sectionText)
        generatedContent = `<ul>${achievements.map((achievement) => `<li>${achievement}</li>`).join("")}</ul>`
      } else {
        // Generic content generation
        generatedContent = await generateSummary(sectionText, [])
      }

      // Apply the generated content to the section
      if (selectedElement && generatedContent) {
        selectedElement.innerHTML = generatedContent
        saveToHistory()
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

  // Render style editor
  const renderStyleEditor = () => {
    if (!selectedElement)
      return <div className="p-4 text-center text-muted-foreground">Click on any element to edit its style</div>

    return (
      <div className="p-4 space-y-4">
        <h3 className="font-medium">Element Style</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">Font Family</label>
          <select
            value={fontFamily.replace(/['"]/g, "")}
            onChange={(e) => applyFontFamily(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Font Size</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={Number.parseInt(fontSize) || 16}
              onChange={(e) => applyFontSize(`${e.target.value}px`)}
              className="w-20 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            />
            <span className="self-center">px</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Text Formatting</label>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={applyBold} className="h-9 w-9">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={applyItalic} className="h-9 w-9">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={applyUnderline} className="h-9 w-9">
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Text Align</label>
          <div className="flex gap-2">
            <Button
              variant={textAlign === "left" ? "default" : "outline"}
              size="icon"
              onClick={() => applyTextAlign("left")}
              className="h-9 w-9"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={textAlign === "center" ? "default" : "outline"}
              size="icon"
              onClick={() => applyTextAlign("center")}
              className="h-9 w-9"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={textAlign === "right" ? "default" : "outline"}
              size="icon"
              onClick={() => applyTextAlign("right")}
              className="h-9 w-9"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Text Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => applyTextColor(e.target.value)}
              className="w-9 h-9 p-1 rounded-md border border-input"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => applyTextColor(e.target.value)}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={backgroundColor === "transparent" ? "#ffffff" : backgroundColor}
              onChange={(e) => applyBackgroundColor(e.target.value)}
              className="w-9 h-9 p-1 rounded-md border border-input"
            />
            <input
              type="text"
              value={backgroundColor === "transparent" ? "#ffffff" : backgroundColor}
              onChange={(e) => applyBackgroundColor(e.target.value)}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Actions</label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={insertImage} className="flex-1">
              <ImageIcon className="h-4 w-4 mr-2" />
              Insert Image
            </Button>
            <Button variant="outline" onClick={openAiDialog} className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Content
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If we're not on the client side, show a loading state
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
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
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4" />
          </Button>

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

          {lastSaved && (
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
          )}

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
          <div className="h-full flex">
            {/* Left sidebar for element editing */}
            <div className="w-64 border-r overflow-y-auto">{renderStyleEditor()}</div>

            {/* Main editor area */}
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
                <div
                  ref={editorRef}
                  className="resume-editor"
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                />
              </div>
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
  )
}

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(HTMLResumeBuilder), { ssr: false })
