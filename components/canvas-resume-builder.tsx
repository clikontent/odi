"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tiptap } from "./tiptap-editor"

// Define element types
type ElementType =
  | "text"
  | "heading"
  | "image"
  | "shape"
  | "divider"
  | "container"
  | "experience"
  | "education"
  | "skills"
  | "header"

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
  gridArea?: string // For grid layout
}

// Define page interface
interface ResumePage {
  id: string
  elements: ResumeElement[]
  background: string
  gridTemplate?: string // For grid layout
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
      <GripVertical className="h-4 w-4 text-muted-foreground" />
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
  page,
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

  const handleContentChange = (newContent) => {
    setContent(newContent)
    onUpdate({ ...element, content: newContent })
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
        let newX = Math.max(0, e.clientX - dragOffset.x + canvasRect.left)
        let newY = Math.max(0, e.clientY - dragOffset.y + canvasRect.top)

        // Grid snapping (snap to 10px grid)
        newX = Math.round(newX / 10) * 10
        newY = Math.round(newY / 10) * 10

        // Ensure element stays within canvas bounds
        const canvasWidth = canvasRef.current.offsetWidth
        const canvasHeight = canvasRef.current.offsetHeight

        newX = Math.min(newX, canvasWidth - element.width)
        newY = Math.min(newY, canvasHeight - element.height)

        // Create a temporary element with the new position
        const tempElement = {
          ...element,
          x: newX,
          y: newY,
        }

        // Check for collisions with other elements
        const hasCollision = checkForCollision(tempElement, page.elements, element.id)

        // Only update if there's no collision
        if (!hasCollision) {
          onUpdate(tempElement)
        }
      } else if (resizing) {
        const dx = e.clientX - initialMousePosition.x
        const dy = e.clientY - initialMousePosition.y

        let newWidth = initialSize.width
        let newHeight = initialSize.height
        let newX = initialPosition.x
        let newY = initialPosition.y

        // Grid snapping for resizing
        const snapSize = (size) => Math.round(size / 10) * 10

        // Handle different resize directions
        switch (resizeDirection) {
          case "e": // Right
            newWidth = snapSize(Math.max(50, initialSize.width + dx))
            break
          case "s": // Bottom
            newHeight = snapSize(Math.max(50, initialSize.height + dy))
            break
          case "se": // Bottom-right
            newWidth = snapSize(Math.max(50, initialSize.width + dx))
            newHeight = snapSize(Math.max(50, initialSize.height + dy))
            break
          case "w": // Left
            newWidth = snapSize(Math.max(50, initialSize.width - dx))
            newX = initialPosition.x + dx
            break
          case "n": // Top
            newHeight = snapSize(Math.max(50, initialSize.height - dy))
            newY = initialPosition.y + dy
            break
          case "ne": // Top-right
            newWidth = snapSize(Math.max(50, initialSize.width + dx))
            newHeight = snapSize(Math.max(50, initialSize.height - dy))
            newY = initialPosition.y + dy
            break
          case "nw": // Top-left
            newWidth = snapSize(Math.max(50, initialSize.width - dx))
            newHeight = snapSize(Math.max(50, initialSize.height - dy))
            newX = initialPosition.x + dx
            newY = initialPosition.y + dy
            break
          case "sw": // Bottom-left
            newWidth = snapSize(Math.max(50, initialSize.width - dx))
            newHeight = snapSize(Math.max(50, initialSize.height + dy))
            newX = initialPosition.x + dx
            break
        }

        // Ensure element stays within canvas bounds
        const canvasWidth = canvasRef.current.offsetWidth
        const canvasHeight = canvasRef.current.offsetHeight

        if (newX < 0) {
          newWidth += newX
          newX = 0
        }

        if (newY < 0) {
          newHeight += newY
          newY = 0
        }

        if (newX + newWidth > canvasWidth) {
          newWidth = canvasWidth - newX
        }

        if (newY + newHeight > canvasHeight) {
          newHeight = canvasHeight - newY
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
    page.elements,
    page,
  ])

  const renderContent = () => {
    if (editing) {
      return <Tiptap content={content} onChange={handleContentChange} onBlur={() => setEditing(false)} />
    }

    switch (element.type) {
      case "text":
      case "heading":
      case "container":
      case "experience":
      case "education":
      case "skills":
      case "header":
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

  // Get section title based on element type
  const getSectionTitle = () => {
    switch (element.type) {
      case "header":
        return "Header"
      case "experience":
        return "Work Experience"
      case "education":
        return "Education"
      case "skills":
        return "Skills"
      default:
        return element.type.charAt(0).toUpperCase() + element.type.slice(1)
    }
  }

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute border border-transparent hover:border-gray-200 rounded-md shadow-sm",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-primary ring-offset-2",
        element.locked ? "cursor-not-allowed" : "cursor-move",
        element.type === "header" && "bg-gray-50",
        element.type === "experience" && "bg-gray-50",
        element.type === "education" && "bg-gray-50",
        element.type === "skills" && "bg-gray-50",
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
      {/* Section title for special sections */}
      {(element.type === "header" ||
        element.type === "experience" ||
        element.type === "education" ||
        element.type === "skills") && (
        <div className="absolute -top-6 left-0 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-t-md border border-gray-200">
          {getSectionTitle()}
        </div>
      )}

      <div className="w-full h-full overflow-hidden p-2">{renderContent()}</div>

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
  checkForCollision,
}) => {
  const canvasRef = useRef(null)

  // Handle drop from toolbar
  const handleDrop = (e) => {
    e.preventDefault()

    const type = e.dataTransfer.getData("elementType")
    if (!type) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = Math.round((e.clientX - canvasRect.left) / 10) * 10 // Snap to grid
    const y = Math.round((e.clientY - canvasRect.top) / 10) * 10 // Snap to grid

    // Create new element based on type
    let newElement = {
      id: `element-${Date.now()}`,
      type,
      x,
      y,
      locked: false,
    }

    // Default content for each section type
    const getDefaultContent = (type) => {
      switch (type) {
        case "header":
          return `<div class="flex flex-col items-center">
            <h1 class="text-2xl font-bold">Your Name</h1>
            <p class="text-sm text-gray-600">email@example.com | (123) 456-7890 | City, Country</p>
          </div>`
        case "experience":
          return `<div>
            <h3 class="text-lg font-semibold">Job Title</h3>
            <p class="text-sm font-medium">Company Name | Location | Date - Present</p>
            <ul class="list-disc pl-5 mt-2 text-sm">
              <li>Accomplishment 1</li>
              <li>Accomplishment 2</li>
              <li>Accomplishment 3</li>
            </ul>
          </div>`
        case "education":
          return `<div>
            <h3 class="text-lg font-semibold">Degree Name</h3>
            <p class="text-sm font-medium">University Name | Location | Graduation Date</p>
            <p class="text-sm mt-1">GPA: 3.8/4.0</p>
          </div>`
        case "skills":
          return `<div>
            <ul class="grid grid-cols-2 gap-2 text-sm">
              <li>Skill 1</li>
              <li>Skill 2</li>
              <li>Skill 3</li>
              <li>Skill 4</li>
              <li>Skill 5</li>
              <li>Skill 6</li>
            </ul>
          </div>`
        default:
          return ""
      }
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
      case "header":
        newElement = {
          ...newElement,
          content: getDefaultContent("header"),
          width: 500,
          height: 100,
          style: {
            padding: "10px",
            backgroundColor: "#f9fafb",
          },
        }
        break
      case "experience":
        newElement = {
          ...newElement,
          content: getDefaultContent("experience"),
          width: 500,
          height: 150,
          style: {
            padding: "10px",
            backgroundColor: "#f9fafb",
          },
        }
        break
      case "education":
        newElement = {
          ...newElement,
          content: getDefaultContent("education"),
          width: 500,
          height: 120,
          style: {
            padding: "10px",
            backgroundColor: "#f9fafb",
          },
        }
        break
      case "skills":
        newElement = {
          ...newElement,
          content: getDefaultContent("skills"),
          width: 400,
          height: 150,
          style: {
            padding: "10px",
            backgroundColor: "#f9fafb",
          },
        }
        break
    }

    onAddElement(newElement)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Draw grid lines
  const drawGrid = () => {
    const gridSize = 10
    const gridColor = "#f0f0f0"
    const width = 210 * 3.78 // A4 width in pixels (210mm at 96dpi)
    const height = 297 * 3.78 // A4 height in pixels (297mm at 96dpi)

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal lines */}
        {Array.from({ length: Math.floor(height / gridSize) }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0 border-t border-dashed"
            style={{
              top: `${i * gridSize}px`,
              borderColor: gridColor,
              borderWidth: i % 5 === 0 ? "0.5px" : "0.25px",
              opacity: i % 5 === 0 ? 0.5 : 0.25,
            }}
          />
        ))}

        {/* Vertical lines */}
        {Array.from({ length: Math.floor(width / gridSize) }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 border-l border-dashed"
            style={{
              left: `${i * gridSize}px`,
              borderColor: gridColor,
              borderWidth: i % 5 === 0 ? "0.5px" : "0.25px",
              opacity: i % 5 === 0 ? 0.5 : 0.25,
            }}
          />
        ))}
      </div>
    )
  }

  // Check for collision between elements
  const checkForCollision = (newElement, currentElements, movingElementId) => {
    // Skip collision check for the element being moved
    const otherElements = currentElements.filter((el) => el.id !== movingElementId)

    for (const element of otherElements) {
      // Simple box collision detection
      if (
        newElement.x < element.x + element.width &&
        newElement.x + newElement.width > element.x &&
        newElement.y < element.y + element.height &&
        newElement.y + newElement.height > element.y
      ) {
        return true // Collision detected
      }
    }
    return false // No collision
  }

  return (
    <div
      ref={canvasRef}
      className="relative bg-white shadow-md overflow-hidden"
      style={{
        width: "210mm",
        height: "297mm",
        backgroundColor: page.background || "white",
      }}
      onClick={() => onSelectElement(null)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {drawGrid()}

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
          page={page}
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

      {(element.type === "text" ||
        element.type === "heading" ||
        element.type === "container" ||
        element.type === "experience" ||
        element.type === "education" ||
        element.type === "skills" ||
        element.type === "header") && (
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
              <GripVertical className="h-4 w-4 text-muted-foreground" />
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

  // Create a default page with resume sections
  const createDefaultPage = () => {
    setPages([
      {
        id: "page-1",
        elements: [
          {
            id: "header-1",
            type: "header",
            content: `<div class="flex flex-col items-center">
              <h1 class="text-2xl font-bold">Your Name</h1>
              <p class="text-sm text-gray-600">email@example.com | (123) 456-7890 | City, Country</p>
            </div>`,
            x: 50,
            y: 50,
            width: 500,
            height: 100,
            style: {
              padding: "10px",
              backgroundColor: "#f9fafb",
            },
            locked: false,
          },
          {
            id: "experience-1",
            type: "experience",
            content: `<div>
              <h3 class="text-lg font-semibold">Job Title</h3>
              <p class="text-sm font-medium">Company Name | Location | Date - Present</p>
              <ul class="list-disc pl-5 mt-2 text-sm">
                <li>Accomplishment 1</li>
                <li>Accomplishment 2</li>
                <li>Accomplishment 3</li>
              </ul>
            </div>`,
            x: 50,
            y: 170,
            width: 500,
            height: 150,
            style: {
              padding: "10px",
              backgroundColor: "#f9fafb",
            },
            locked: false,
          },
          {
            id: "education-1",
            type: "education",
            content: `<div>
              <h3 class="text-lg font-semibold">Degree Name</h3>
              <p class="text-sm font-medium">University Name | Location | Graduation Date</p>
              <p class="text-sm mt-1">GPA: 3.8/4.0</p>
            </div>`,
            x: 50,
            y: 340,
            width: 500,
            height: 120,
            style: {
              padding: "10px",
              backgroundColor: "#f9fafb",
            },
            locked: false,
          },
          {
            id: "skills-1",
            type: "skills",
            content: `<div>
              <ul class="grid grid-cols-2 gap-2 text-sm">
                <li>Skill 1</li>
                <li>Skill 2</li>
                <li>Skill 3</li>
                <li>Skill 4</li>
                <li>Skill 5</li>
                <li>Skill 6</li>
              </ul>
            </div>`,
            x: 50,
            y: 480,
            width: 500,
            height: 150,
            style: {
              padding: "10px",
              backgroundColor: "#f9fafb",
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
                (contentElement.id ? `#contentElement.id}` : "") +
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
          case "experience":
          case "education":
          case "skills":
          case "header":
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
            Save
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
                  <h3 className="font-medium">Resume Sections</h3>
                  <div className="space-y-2">
                    <ToolbarItem type="header" label="Header" icon={Type} onDragStart={handleToolbarDragStart} />
                    <ToolbarItem
                      type="experience"
                      label="Experience"
                      icon={Layers}
                      onDragStart={handleToolbarDragStart}
                    />
                    <ToolbarItem
                      type="education"
                      label="Education"
                      icon={Layers}
                      onDragStart={handleToolbarDragStart}
                    />
                    <ToolbarItem type="skills" label="Skills" icon={Layers} onDragStart={handleToolbarDragStart} />
                  </div>

                  <h3 className="font-medium mt-6">Basic Elements</h3>
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
                  checkForCollision={checkForCollision}
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
      </div>
    </div>
  )
}

export default CanvasResumeBuilder
