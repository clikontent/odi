"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import Image from "@tiptap/extension-image"
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
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  Sparkles,
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
import { cn } from "@/lib/utils"

interface TiptapResumeBuilderProps {
  templateHtml: string
  templateCss: string
  onSave: (html: string) => void
}

// Define a menu item component for the editor toolbar
const MenuButton = ({
  icon,
  onClick,
  isActive = false,
  disabled = false,
  title,
}: {
  icon: React.ReactNode
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
}) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    size="icon"
    className={cn("h-8 w-8", isActive ? "bg-primary/20 hover:bg-primary/30" : "")}
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {icon}
  </Button>
)

// Main component
const TiptapResumeBuilder = ({ templateHtml, templateCss, onSave }: TiptapResumeBuilderProps) => {
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string>("")

  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize editor with Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing your resume content...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Image,
    ],
    content: templateHtml,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[297mm] p-4",
      },
    },
  })

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

  // Update preview when editor content changes
  useEffect(() => {
    if (previewRef.current && mode === "preview" && editor) {
      previewRef.current.innerHTML = editor.getHTML()

      // Apply CSS
      if (templateCss) {
        const styleElement = document.createElement("style")
        styleElement.textContent = templateCss
        previewRef.current.appendChild(styleElement)
      }
    }
  }, [mode, editor, templateCss])

  // Handle saving the resume
  const handleSave = () => {
    if (editor) {
      const finalHtml = editor.getHTML()
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
    if (!previewRef.current) return

    try {
      // In a real implementation, we would use html2pdf.js or similar
      // For now, just show a toast
      toast({
        title: "PDF Export",
        description: "PDF export functionality will be implemented soon.",
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
    if (!editor) return

    try {
      // In a real implementation, we would use file-saver or similar
      // For now, just show a toast
      toast({
        title: "Word Export",
        description: "Word export functionality will be implemented soon.",
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

  // Generate AI content
  const generateAiContent = async () => {
    setAiDialogOpen(false)

    toast({
      title: "AI Generation",
      description: "AI content generation will be implemented soon.",
    })
  }

  // Render editor menu
  const renderEditorMenu = () => {
    if (!editor) return null

    return (
      <div className="flex flex-wrap items-center gap-1 p-1 border rounded-md bg-background mb-4">
        <MenuButton
          icon={<Bold className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        />
        <MenuButton
          icon={<Italic className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        />
        <MenuButton
          icon={<UnderlineIcon className="h-4 w-4" />}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        />

        <div className="h-4 w-px bg-border mx-1" />

        <MenuButton
          icon={<AlignLeft className="h-4 w-4" />}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        />
        <MenuButton
          icon={<AlignCenter className="h-4 w-4" />}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        />
        <MenuButton
          icon={<AlignRight className="h-4 w-4" />}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        />

        <div className="h-4 w-px bg-border mx-1" />

        <MenuButton
          icon={<ImageIcon className="h-4 w-4" />}
          onClick={() => {
            const url = window.prompt("Enter the URL of the image:")
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
          title="Insert Image"
        />
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
                <Button onClick={generateAiContent}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
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
            {isFullscreen ? <Minimize className="h-4 w-4 mr-2" /> : <Maximize className="h-4 w-4 mr-2" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
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
                {renderEditorMenu()}
                <EditorContent editor={editor} className="h-full" />
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

export default TiptapResumeBuilder
