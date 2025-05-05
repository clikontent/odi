"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  Save,
  ZoomIn,
  ZoomOut,
  Edit,
  Eye,
  Maximize,
  Minimize,
  FileIcon,
  Copy,
  Trash,
  Plus,
  ImageIcon,
  Type,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Minus,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Define element types
type ElementType = "text" | "heading" | "image" | "shape" | "divider" | "container"

// Define element interface
interface ResumeElement {
  id: string
  type: ElementType
  content: string
  x: number
  y: number
  width: number
  height: number
  style: {
    fontSize?: string
    fontWeight?: string
    fontFamily?: string
    color?: string
    backgroundColor?: string
    textAlign?: "left" | "center" | "right"
    borderWidth?: string
    borderStyle?: string
    borderColor?: string
    borderRadius?: string
    padding?: string
    lineHeight?: string
    opacity?: string
    zIndex?: number
    transform?: string
    [key: string]: any // Allow any CSS property
  }
  locked: boolean
  children?: ResumeElement[] // For container elements
  originalHtml?: string // Store original HTML for better preservation
}

// Define page interface
interface ResumePage {
  id: string
  elements: ResumeElement[]
  background: string
}

interface CanvasResumeBuilderProps {
  templateHtml?: string
  templateCss?: string
  onSave: (html: string) => void
}

// Toolbar Item component
const ToolbarItem = ({ type, label, icon: Icon, onDragStart }) => {
  return (
    <div
      className="flex items-center gap-2 p-2 rounded-md cursor-grab border hover:bg-accent"
      draggable="true"
      onDragStart={(e) => onDragStart(e, type)}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  )
}

// Element component
const Element = ({
  element,
  isSelected,
  onClick,
  onUpdate,
  onDelete,
  onDuplicate,
  onLockToggle,
  onMoveForward,
  onMoveBackward,
  canvasRef,
}) => {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(element.content)
  const elementRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState("")
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 })
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 })

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  const saveContent = () => {
    onUpdate({ ...element, content })
    setEditing(false)
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (element.locked || editing) return

    e.stopPropagation()

    // Only start drag if it's not a resize handle
    if (!e.target.classList.contains("resize-handle")) {
      setIsDragging(true)

      const rect = elementRef.current.getBoundingClientRect()
      const canvasRect = canvasRef.current.getBoundingClientRect()

      // Calculate offset from mouse position to element top-left corner
      setDragOffset({
        x: e.clientX - rect.left + canvasRect.left,
        y: e.clientY - rect.top + canvasRect.top,
      })

      // Set initial position
      setInitialPosition({ x: element.x, y: element.y })
      setInitialMousePosition({ x: e.clientX, y: e.clientY })

      // Select the element
      onClick(element.id)
    }
  }

  // Handle resize start
  const handleResizeStart = (e, direction) => {
    if (element.locked) return

    e.stopPropagation()
    e.preventDefault()

    setResizing(true)
    setResizeDirection(direction)
    setInitialSize({ width: element.width, height: element.height })
    setInitialPosition({ x: element.x, y: element.y })
    setInitialMousePosition({ x: e.clientX, y: e.clientY })
  }

  // Add global mouse move and mouse up handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const canvasRect = canvasRef.current.getBoundingClientRect()

        // Calculate new position
        const newX = e.clientX - dragOffset.x + canvasRect.left
        const newY = e.clientY - dragOffset.y + canvasRect.top

        // Update element position
        onUpdate({
          ...element,
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        })
      } else if (resizing) {
        const dx = e.clientX - initialMousePosition.x
        const dy = e.clientY - initialMousePosition.y

        let newWidth = initialSize.width
        let newHeight = initialSize.height
        let newX = initialPosition.x
        let newY = initialPosition.y

        // Handle different resize directions
        switch (resizeDirection) {
          case "e": // Right
            newWidth = Math.max(50, initialSize.width + dx)
            break
          case "s": // Bottom
            newHeight = Math.max(50, initialSize.height + dy)
            break
          case "se": // Bottom-right
            newWidth = Math.max(50, initialSize.width + dx)
            newHeight = Math.max(50, initialSize.height + dy)
            break
          case "w": // Left
            newWidth = Math.max(50, initialSize.width - dx)
            newX = initialPosition.x + dx
            break
          case "n": // Top
            newHeight = Math.max(50, initialSize.height - dy)
            newY = initialPosition.y + dy
            break
          case "ne": // Top-right
            newWidth = Math.max(50, initialSize.width + dx)
            newHeight = Math.max(50, initialSize.height - dy)
            newY = initialPosition.y + dy
            break
          case "nw": // Top-left
            newWidth = Math.max(50, initialSize.width - dx)
            newHeight = Math.max(50, initialSize.height - dy)
            newX = initialPosition.x + dx
            newY = initialPosition.y + dy
            break
          case "sw": // Bottom-left
            newWidth = Math.max(50, initialSize.width - dx)
            newHeight = Math.max(50, initialSize.height + dy)
            newX = initialPosition.x + dx
            break
        }

        // Update element size and position
        onUpdate({
          ...element,
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setResizing(false)
    }

    if (isDragging || resizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    isDragging,
    resizing,
    dragOffset,
    element,
    onUpdate,
    resizeDirection,
    initialSize,
    initialPosition,
    initialMousePosition,
    canvasRef,
  ])

  const renderContent = () => {
    if (editing) {
      switch (element.type) {
        case "text":
        case "heading":
        case "container":
          return (
            <Textarea
              value={content}
              onChange={handleContentChange}
              className="w-full h-full min-h-[50px] resize-none"
              autoFocus
              onBlur={saveContent}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  saveContent()
                }
              }}
            />
          )
        case "image":
          return (
            <Input
              type="text"
              value={content}
              onChange={handleContentChange}
              placeholder="Image URL"
              className="w-full"
              onBlur={saveContent}
            />
          )
        default:
          return null
      }
    }

    switch (element.type) {
      case "text":
      case "heading":
      case "container":
        return <div dangerouslySetInnerHTML={{ __html: content }} />
      case "image":
        return content ? (
          <img src={content || "/placeholder.svg"} alt="Resume element" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="text-gray-400" />
          </div>
        )
      case "shape":
        return <div className="w-full h-full" />
      case "divider":
        return <hr className="w-full my-2" />
      default:
        return null
    }
  }

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-primary ring-offset-2",
        element.locked ? "cursor-not-allowed" : "cursor-move",
      )}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.style.zIndex || 1,
        ...element.style,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick(element.id)
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => !element.locked && setEditing(true)}
    >
      {renderContent()}

      {isSelected && !editing && (
        <>
          {/* Resize handles */}
          {!element.locked && (
            <>
              <div
                className="resize-handle absolute w-3 h-3 bg-primary rounded-full top-0 left-0 cursor-nw-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "nw")}
              />
              <div
                className="resize-handle absolute w-3 h-3 bg-primary rounded-full top-0 right-0 cursor-ne-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "ne")}
              />
              <div
                className="resize-handle absolute w-3 h-3 bg-primary rounded-full bottom-0 left-0 cursor-sw-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "sw")}
              />
              <div
                className="resize-handle absolute w-3 h-3 bg-primary rounded-full bottom-0 right-0 cursor-se-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "se")}
              />
              <div
                className="resize-handle absolute w-3 h-3 bg-primary rounded-full top-0 left-1/2 -translate-x-1/2 cursor-n-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "n")}
              />
              <div
                className="resize-handle absolute w-3 h-3 bg-primary rounded-full bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "s")}
              />
              <div
                className="resize-handle absolute w-3 h-3 bg-primary rounded-full left-0 top-1/2 -translate-y-1/2 cursor-w-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "w")}
              />
              <div
                className="resize-handle absolute w-3 h-3 bg-primary rounded-full right-0 top-1/2 -translate-y-1/2 cursor-e-resize z-50"
                onMouseDown={(e) => handleResizeStart(e, "e")}
              />
            </>
          )}

          {/* Control buttons */}
          <div className="absolute -top-10 right-0 flex bg-white shadow rounded-md z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                setEditing(true)
              }}
              disabled={element.locked}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(element.id)
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onLockToggle(element.id)
              }}
            >
              {element.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onMoveForward(element.id)
              }}
              disabled={element.locked}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onMoveBackward(element.id)
              }}
              disabled={element.locked}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(element.id)
              }}
              disabled={element.locked}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Canvas component
const Canvas = ({
  page,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onLockToggle,
  onMoveForward,
  onMoveBackward,
  onAddElement,
}) => {
  const canvasRef = useRef(null)

  // Handle drop from toolbar
  const handleDrop = (e) => {
    e.preventDefault()

    const type = e.dataTransfer.getData("elementType")
    if (!type) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - canvasRect.left
    const y = e.clientY - canvasRect.top

    // Create new element based on type
    let newElement = {
      id: `element-${Date.now()}`,
      type,
      x,
      y,
      locked: false,
    }

    switch (type) {
      case "text":
        newElement = {
          ...newElement,
          content: "<p>Double-click to edit this text</p>",
          width: 200,
          height: 100,
          style: {
            fontSize: "16px",
            fontFamily: "Arial",
            color: "#000000",
            textAlign: "left",
          },
        }
        break
      case "heading":
        newElement = {
          ...newElement,
          content: "<h2>Heading</h2>",
          width: 300,
          height: 60,
          style: {
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "Arial",
            color: "#000000",
            textAlign: "left",
          },
        }
        break
      case "image":
        newElement = {
          ...newElement,
          content: "",
          width: 200,
          height: 200,
          style: {
            borderRadius: "0px",
          },
        }
        break
      case "shape":
        newElement = {
          ...newElement,
          content: "",
          width: 100,
          height: 100,
          style: {
            backgroundColor: "#e0e0e0",
            borderRadius: "0px",
          },
        }
        break
      case "divider":
        newElement = {
          ...newElement,
          content: "",
          width: 300,
          height: 2,
          style: {
            backgroundColor: "#000000",
          },
        }
        break
      case "container":
        newElement = {
          ...newElement,
          content: "<div>Container element</div>",
          width: 300,
          height: 200,
          style: {
            border: "1px dashed #ccc",
            padding: "10px",
          },
        }
        break
    }

    onAddElement(newElement)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div
      ref={canvasRef}
      className="relative bg-white shadow-md"
      style={{
        width: "210mm",
        height: "297mm",
        backgroundColor: page.background || "white",
      }}
      onClick={() => onSelectElement(null)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {page.elements.map((element) => (
        <Element
          key={element.id}
          element={element}
          isSelected={selectedElementId === element.id}
          onClick={onSelectElement}
          onUpdate={onUpdateElement}
          onDelete={onDeleteElement}
          onDuplicate={onDuplicateElement}
          onLockToggle={onLockToggle}
          onMoveForward={onMoveForward}
          onMoveBackward={onMoveBackward}
          canvasRef={canvasRef}
        />
      ))}
    </div>
  )
}

// Style Editor component
const StyleEditor = ({ element, onUpdate }) => {
  if (!element) return null

  const updateStyle = (key, value) => {
    onUpdate({
      ...element,
      style: {
        ...element.style,
        [key]: value,
      },
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-medium">Element Style</h3>

      {(element.type === "text" || element.type === "heading" || element.type === "container") && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Size</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={Number.parseInt(element.style.fontSize || "16")}
                onChange={(e) => updateStyle("fontSize", `${e.target.value}px`)}
                className="w-20"
              />
              <span className="self-center">px</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Font Family</label>
            <Select
              value={element.style.fontFamily || "Arial"}
              onValueChange={(value) => updateStyle("fontFamily", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Font Weight</label>
            <Select
              value={element.style.fontWeight || "normal"}
              onValueChange={(value) => updateStyle("fontWeight", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="lighter">Lighter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Text Align</label>
            <div className="flex gap-2">
              <Button
                variant={element.style.textAlign === "left" ? "default" : "outline"}
                size="icon"
                onClick={() => updateStyle("textAlign", "left")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={element.style.textAlign === "center" ? "default" : "outline"}
                size="icon"
                onClick={() => updateStyle("textAlign", "center")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={element.style.textAlign === "right" ? "default" : "outline"}
                size="icon"
                onClick={() => updateStyle("textAlign", "right")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={element.style.color || "#000000"}
            onChange={(e) => updateStyle("color", e.target.value)}
            className="w-10 h-10 p-1"
          />
          <Input
            type="text"
            value={element.style.color || "#000000"}
            onChange={(e) => updateStyle("color", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Background Color</label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={element.style.backgroundColor || "#ffffff"}
            onChange={(e) => updateStyle("backgroundColor", e.target.value)}
            className="w-10 h-10 p-1"
          />
          <Input
            type="text"
            value={element.style.backgroundColor || "#ffffff"}
            onChange={(e) => updateStyle("backgroundColor", e.target.value)}
          />
        </div>
      </div>

      {(element.type === "shape" || element.type === "image") && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Border Radius</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={Number.parseInt(element.style.borderRadius || "0")}
              onChange={(e) => updateStyle("borderRadius", `${e.target.value}px`)}
              className="w-20"
            />
            <span className="self-center">px</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Padding</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={Number.parseInt(element.style.padding?.replace("px", "") || "0")}
            onChange={(e) => updateStyle("padding", `${e.target.value}px`)}
            className="w-20"
          />
          <span className="self-center">px</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Border</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={element.style.border || "none"}
            onChange={(e) => updateStyle("border", e.target.value)}
            placeholder="1px solid black"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Opacity</label>
        <Slider
          value={[Number.parseFloat(element.style.opacity || "1") * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => updateStyle("opacity", (value[0] / 100).toString())}
        />
        <div className="flex justify-between text-xs">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Z-Index</label>
        <Input
          type="number"
          value={element.style.zIndex || 1}
          onChange={(e) => updateStyle("zIndex", Number.parseInt(e.target.value))}
        />
      </div>
    </div>
  )
}

// Page Manager component
const PageManager = ({
  pages,
  currentPageIndex,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onSelectPage,
  onReorderPages,
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Pages</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onAddPage}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicatePage(currentPageIndex)}
            disabled={pages.length === 0}
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={cn(
              "flex items-center justify-between p-2 rounded-md border",
              index === currentPageIndex && "bg-accent",
            )}
          >
            <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => onSelectPage(index)}>
              <FileIcon className="h-4 w-4" />
              <span>Page {index + 1}</span>
            </div>

            <div className="flex gap-1">
              {index > 0 && (
                <Button size="icon" variant="ghost" onClick={() => onReorderPages(index, index - 1)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}

              {index < pages.length - 1 && (
                <Button size="icon" variant="ghost" onClick={() => onReorderPages(index, index + 1)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}

              {pages.length > 1 && (
                <Button size="icon" variant="ghost" onClick={() => onDeletePage(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main component
const CanvasResumeBuilder = ({ templateHtml, templateCss, onSave }: CanvasResumeBuilderProps) => {
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [zoom, setZoom] = useState(70)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pages, setPages] = useState<ResumePage[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [originalHtml, setOriginalHtml] = useState<string>("")

  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Initialize with template or default page
  useEffect(() => {
    if (templateHtml) {
      setOriginalHtml(templateHtml)

      try {
        // Create a temporary div to hold the template HTML
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = templateHtml

        // Apply template CSS if available
        if (templateCss) {
          const styleElement = document.createElement("style")
          styleElement.textContent = templateCss
          tempDiv.appendChild(styleElement)
        }

        // Extract elements from template
        const elements: ResumeElement[] = []
        let elementId = 0

        // Find major sections in the template
        const sections = tempDiv.querySelectorAll(
          'section, div, h1, h2, h3, p, ul, .resume-section, [class*="section"]',
        )

        if (sections.length > 0) {
          // Process each section as a separate element
          sections.forEach((section, index) => {
            // Skip nested sections to avoid duplication
            if (section.parentElement && Array.from(sections).some((s) => s !== section && s.contains(section))) {
              return
            }

            // Get section position and size
            const rect = section.getBoundingClientRect()

            // Create element for this section
            const sectionElement: ResumeElement = {
              id: `element-${elementId++}`,
              type:
                section.tagName.toLowerCase() === "h1" ||
                section.tagName.toLowerCase() === "h2" ||
                section.tagName.toLowerCase() === "h3"
                  ? "heading"
                  : "text",
              content: section.outerHTML,
              x: section.offsetLeft || 50 + index * 10,
              y: section.offsetTop || 50 + index * 30,
              width: Math.max(section.offsetWidth || 300, 100),
              height: Math.max(section.offsetHeight || 50, 30),
              style: {
                fontSize: window.getComputedStyle(section).fontSize || "16px",
                fontFamily: window.getComputedStyle(section).fontFamily || "Arial",
                color: window.getComputedStyle(section).color || "#000000",
                textAlign: (window.getComputedStyle(section).textAlign as any) || "left",
                zIndex: index + 1,
              },
              locked: false,
            }

            elements.push(sectionElement)
          })
        } else {
          // If no sections found, create a single container element
          const mainElement: ResumeElement = {
            id: `element-${elementId++}`,
            type: "container",
            content: templateHtml,
            x: 0,
            y: 0,
            width: 794, // A4 width in pixels (210mm at 96dpi)
            height: 1123, // A4 height in pixels (297mm at 96dpi)
            style: {},
            locked: false,
            originalHtml: templateHtml,
          }

          elements.push(mainElement)
        }

        // Create the page
        setPages([
          {
            id: "page-1",
            elements,
            background: "white",
          },
        ])
      } catch (error) {
        console.error("Error parsing template:", error)
        // Fallback to treating the whole template as one element
        const elements: ResumeElement[] = [
          {
            id: `element-${Date.now()}`,
            type: "container",
            content: templateHtml,
            x: 0,
            y: 0,
            width: 794,
            height: 1123,
            style: {},
            locked: false,
            originalHtml: templateHtml,
          },
        ]

        setPages([
          {
            id: "page-1",
            elements,
            background: "white",
          },
        ])
      }
    } else {
      createDefaultPage()
    }
  }, [templateHtml, templateCss])

  // Create a default page
  const createDefaultPage = () => {
    setPages([
      {
        id: "page-1",
        elements: [
          {
            id: "heading-1",
            type: "heading",
            content: "<h1>Your Name</h1>",
            x: 50,
            y: 50,
            width: 300,
            height: 60,
            style: {
              fontSize: "28px",
              fontWeight: "bold",
              fontFamily: "Arial",
              color: "#000000",
              textAlign: "left",
            },
            locked: false,
          },
          {
            id: "text-contact",
            type: "text",
            content: "<p>email@example.com | (123) 456-7890 | City, Country</p>",
            x: 50,
            y: 120,
            width: 500,
            height: 30,
            style: {
              fontSize: "14px",
              fontFamily: "Arial",
              color: "#666666",
              textAlign: "left",
            },
            locked: false,
          },
          {
            id: "divider-1",
            type: "divider",
            content: "",
            x: 50,
            y: 170,
            width: 500,
            height: 2,
            style: {
              backgroundColor: "#000000",
            },
            locked: false,
          },
          {
            id: "heading-summary",
            type: "heading",
            content: "<h2>Professional Summary</h2>",
            x: 50,
            y: 190,
            width: 300,
            height: 40,
            style: {
              fontSize: "20px",
              fontWeight: "bold",
              fontFamily: "Arial",
              color: "#000000",
              textAlign: "left",
            },
            locked: false,
          },
          {
            id: "text-summary",
            type: "text",
            content:
              "<p>Experienced professional with a track record of success. Double-click to edit this text and add your own professional summary.</p>",
            x: 50,
            y: 240,
            width: 500,
            height: 80,
            style: {
              fontSize: "16px",
              fontFamily: "Arial",
              color: "#000000",
              textAlign: "left",
            },
            locked: false,
          },
          {
            id: "heading-experience",
            type: "heading",
            content: "<h2>Work Experience</h2>",
            x: 50,
            y: 340,
            width: 300,
            height: 40,
            style: {
              fontSize: "20px",
              fontWeight: "bold",
              fontFamily: "Arial",
              color: "#000000",
              textAlign: "left",
            },
            locked: false,
          },
          {
            id: "text-experience",
            type: "text",
            content:
              "<p><strong>Job Title</strong> | Company Name | Date - Present<br>• Accomplishment 1<br>• Accomplishment 2<br>• Accomplishment 3</p>",
            x: 50,
            y: 390,
            width: 500,
            height: 120,
            style: {
              fontSize: "16px",
              fontFamily: "Arial",
              color: "#000000",
              textAlign: "left",
            },
            locked: false,
          },
        ],
        background: "white",
      },
    ])
  }

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

  // Update preview when pages change
  useEffect(() => {
    if (previewRef.current && mode === "preview") {
      // Generate HTML for preview
      const html = generateHtml()
      previewRef.current.innerHTML = html

      // Apply CSS
      if (templateCss) {
        const styleElement = document.createElement("style")
        styleElement.textContent = templateCss
        previewRef.current.appendChild(styleElement)
      }
    }
  }, [mode, pages, templateCss])

  // Save resume data to localStorage
  useEffect(() => {
    if (pages.length > 0) {
      try {
        localStorage.setItem("resumeData", JSON.stringify(pages))
      } catch (error) {
        console.error("Error saving to localStorage:", error)
      }
    }
  }, [pages])

  // Load resume data from localStorage on initial load
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("resumeData")
      if (savedData && !templateHtml) {
        setPages(JSON.parse(savedData))
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }, [templateHtml])

  // Generate HTML from pages
  const generateHtml = () => {
    // If we're using a template and want to preserve its structure
    if (originalHtml && pages.length > 0) {
      // Create a temporary div with the original HTML
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = originalHtml

      // Update each section with edited content
      pages.forEach((page) => {
        page.elements.forEach((element) => {
          if (element.type === "container" && element.originalHtml) {
            // For container elements that represent the whole template
            return element.content
          } else {
            // For individual elements, try to find and update the corresponding section
            const content = document.createElement("div")
            content.innerHTML = element.content

            // Extract the first element (the actual content)
            const contentElement = content.firstElementChild

            if (contentElement) {
              // Try to find a matching element in the original template
              const selector =
                contentElement.tagName +
                (contentElement.id ? `#${contentElement.id}` : "") +
                (contentElement.className ? `.${contentElement.className.split(" ").join(".")}` : "")

              try {
                const targetElement = tempDiv.querySelector(selector)
                if (targetElement) {
                  targetElement.innerHTML = contentElement.innerHTML
                }
              } catch (e) {
                console.error("Error updating element:", e)
              }
            }
          }
        })
      })

      return tempDiv.innerHTML
    }

    // Otherwise, generate HTML from scratch
    let html = ""

    pages.forEach((page, pageIndex) => {
      html += `<div class="resume-page" style="position: relative; width: 210mm; height: 297mm; background-color: ${page.background || "white"}; page-break-after: always; margin-bottom: 20px;">`

      // Sort elements by z-index
      const sortedElements = [...page.elements].sort((a, b) => (a.style.zIndex || 0) - (b.style.zIndex || 0))

      sortedElements.forEach((element) => {
        let elementHtml = ""

        switch (element.type) {
          case "text":
          case "heading":
          case "container":
            elementHtml = `<div style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; ${styleToString(element.style)}">${element.content}</div>`
            break
          case "image":
            elementHtml = `<img src="${element.content}" style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; ${styleToString(element.style)}" />`
            break
          case "shape":
            elementHtml = `<div style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; ${styleToString(element.style)}"></div>`
            break
          case "divider":
            elementHtml = `<hr style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; border: none; ${styleToString(element.style)}" />`
            break
        }

        html += elementHtml
      })

      html += "</div>"
    })

    return html
  }

  // Convert style object to string
  const styleToString = (style: any) => {
    return Object.entries(style)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
        return `${cssKey}: ${value};`
      })
      .join(" ")
  }

  // Handle saving the resume
  const handleSave = () => {
    const html = generateHtml()
    onSave(html)
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
    setZoom(Math.max(zoom - 10, 30))
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

      // Generate HTML
      const html = generateHtml()

      // Create a temporary div for the PDF content
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html

      // Add CSS to the element
      if (templateCss) {
        const style = document.createElement("style")
        style.textContent = templateCss
        tempDiv.appendChild(style)
      }

      const opt = {
        margin: 0,
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

  // Handle toolbar item drag start
  const handleToolbarDragStart = (e, type) => {
    e.dataTransfer.setData("elementType", type)
    e.dataTransfer.effectAllowed = "copy"
  }

  // Element operations
  const handleSelectElement = (elementId: string | null) => {
    setSelectedElementId(elementId)
  }

  const handleUpdateElement = (updatedElement: ResumeElement) => {
    setPages(
      pages.map((page, index) => {
        if (index === currentPageIndex) {
          return {
            ...page,
            elements: page.elements.map((element) => (element.id === updatedElement.id ? updatedElement : element)),
          }
        }
        return page
      }),
    )
  }

  const handleAddElement = (element: ResumeElement) => {
    setPages(
      pages.map((page, index) => {
        if (index === currentPageIndex) {
          return {
            ...page,
            elements: [...page.elements, { ...element, id: `element-${Date.now()}` }],
          }
        }
        return page
      }),
    )
  }

  const handleDeleteElement = (elementId: string) => {
    setPages(
      pages.map((page, index) => {
        if (index === currentPageIndex) {
          return {
            ...page,
            elements: page.elements.filter((element) => element.id !== elementId),
          }
        }
        return page
      }),
    )

    if (selectedElementId === elementId) {
      setSelectedElementId(null)
    }
  }

  const handleDuplicateElement = (elementId: string) => {
    setPages(
      pages.map((page, index) => {
        if (index === currentPageIndex) {
          const elementToDuplicate = page.elements.find((element) => element.id === elementId)

          if (elementToDuplicate) {
            const newElement = {
              ...elementToDuplicate,
              id: `element-${Date.now()}`,
              x: elementToDuplicate.x + 20,
              y: elementToDuplicate.y + 20,
            }

            return {
              ...page,
              elements: [...page.elements, newElement],
            }
          }
        }
        return page
      }),
    )
  }

  const handleLockToggle = (elementId: string) => {
    setPages(
      pages.map((page, index) => {
        if (index === currentPageIndex) {
          return {
            ...page,
            elements: page.elements.map((element) =>
              element.id === elementId ? { ...element, locked: !element.locked } : element,
            ),
          }
        }
        return page
      }),
    )
  }

  const handleMoveForward = (elementId: string) => {
    setPages(
      pages.map((page, index) => {
        if (index === currentPageIndex) {
          return {
            ...page,
            elements: page.elements.map((element) => {
              if (element.id === elementId) {
                return {
                  ...element,
                  style: {
                    ...element.style,
                    zIndex: (element.style.zIndex || 1) + 1,
                  },
                }
              }
              return element
            }),
          }
        }
        return page
      }),
    )
  }

  const handleMoveBackward = (elementId: string) => {
    setPages(
      pages.map((page, index) => {
        if (index === currentPageIndex) {
          return {
            ...page,
            elements: page.elements.map((element) => {
              if (element.id === elementId) {
                return {
                  ...element,
                  style: {
                    ...element.style,
                    zIndex: Math.max((element.style.zIndex || 1) - 1, 0),
                  },
                }
              }
              return element
            }),
          }
        }
        return page
      }),
    )
  }

  // Page operations
  const handleAddPage = () => {
    const newPage: ResumePage = {
      id: `page-${Date.now()}`,
      elements: [],
      background: "white",
    }

    setPages([...pages, newPage])
    setCurrentPageIndex(pages.length)
  }

  const handleDuplicatePage = (pageIndex: number) => {
    const pageToDuplicate = pages[pageIndex]

    if (pageToDuplicate) {
      const newPage: ResumePage = {
        id: `page-${Date.now()}`,
        elements: pageToDuplicate.elements.map((element) => ({
          ...element,
          id: `${element.id}-copy-${Date.now()}`,
        })),
        background: pageToDuplicate.background,
      }

      const newPages = [...pages]
      newPages.splice(pageIndex + 1, 0, newPage)

      setPages(newPages)
      setCurrentPageIndex(pageIndex + 1)
    }
  }

  const handleDeletePage = (pageIndex: number) => {
    if (pages.length > 1) {
      const newPages = pages.filter((_, index) => index !== pageIndex)
      setPages(newPages)

      if (currentPageIndex >= newPages.length) {
        setCurrentPageIndex(newPages.length - 1)
      } else if (currentPageIndex === pageIndex) {
        setCurrentPageIndex(Math.max(0, pageIndex - 1))
      }
    }
  }

  const handleSelectPage = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex)
    setSelectedElementId(null)
  }

  const handleReorderPages = (fromIndex: number, toIndex: number) => {
    const newPages = [...pages]
    const [movedPage] = newPages.splice(fromIndex, 1)
    newPages.splice(toIndex, 0, movedPage)

    setPages(newPages)

    if (currentPageIndex === fromIndex) {
      setCurrentPageIndex(toIndex)
    } else if (currentPageIndex === toIndex) {
      setCurrentPageIndex(fromIndex)
    }
  }

  // Get the selected element
  const selectedElement =
    currentPageIndex >= 0 && currentPageIndex < pages.length && selectedElementId
      ? pages[currentPageIndex].elements.find((element) => element.id === selectedElementId) || null
      : null

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

      {mode === "edit" ? (
        <div className="flex-1 flex">
          <div className="w-64 border-r overflow-y-auto">
            <Tabs defaultValue="elements">
              <TabsList className="w-full">
                <TabsTrigger value="elements" className="flex-1">
                  Elements
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex-1">
                  Pages
                </TabsTrigger>
              </TabsList>
              <TabsContent value="elements" className="p-0">
                <div className="p-4 space-y-4">
                  <h3 className="font-medium">Add Elements</h3>
                  <div className="space-y-2">
                    <ToolbarItem type="text" label="Text" icon={Type} onDragStart={handleToolbarDragStart} />
                    <ToolbarItem type="heading" label="Heading" icon={Type} onDragStart={handleToolbarDragStart} />
                    <ToolbarItem type="image" label="Image" icon={ImageIcon} onDragStart={handleToolbarDragStart} />
                    <ToolbarItem type="shape" label="Shape" icon={Square} onDragStart={handleToolbarDragStart} />
                    <ToolbarItem type="divider" label="Divider" icon={Minus} onDragStart={handleToolbarDragStart} />
                    <ToolbarItem
                      type="container"
                      label="Container"
                      icon={Layers}
                      onDragStart={handleToolbarDragStart}
                    />
                  </div>
                </div>

                {selectedElement && <StyleEditor element={selectedElement} onUpdate={handleUpdateElement} />}
              </TabsContent>
              <TabsContent value="pages" className="p-0">
                <PageManager
                  pages={pages}
                  currentPageIndex={currentPageIndex}
                  onAddPage={handleAddPage}
                  onDuplicatePage={handleDuplicatePage}
                  onDeletePage={handleDeletePage}
                  onSelectPage={handleSelectPage}
                  onReorderPages={handleReorderPages}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease",
              }}
              className="resume-pages-container"
            >
              {currentPageIndex >= 0 && currentPageIndex < pages.length && (
                <Canvas
                  page={pages[currentPageIndex]}
                  selectedElementId={selectedElementId}
                  onSelectElement={handleSelectElement}
                  onUpdateElement={handleUpdateElement}
                  onDeleteElement={handleDeleteElement}
                  onDuplicateElement={handleDuplicateElement}
                  onLockToggle={handleLockToggle}
                  onMoveForward={handleMoveForward}
                  onMoveBackward={handleMoveBackward}
                  onAddElement={handleAddElement}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <Card className="flex-1 overflow-auto">
          <CardContent className="p-8">
            <div ref={previewRef} className="space-y-4" />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center items-center gap-4 p-2 bg-muted rounded-b-md">
        <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 30}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="w-32">
          <Slider value={[zoom]} min={30} max={200} step={10} onValueChange={(value) => setZoom(value[0])} />
        </div>
        <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-sm">{zoom}%</span>

        {lastSaved && (
          <div className="ml-4">
            <Button variant="outline" size="sm" onClick={exportToPdf}>
              <FileIcon className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CanvasResumeBuilder
