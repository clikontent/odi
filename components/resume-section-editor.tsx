"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ResumeSectionEditorProps {
  isOpen: boolean
  onClose: () => void
  sectionHtml: string
  onSave: (html: string) => void
  sectionTitle: string
}

export function ResumeSectionEditor({ isOpen, onClose, sectionHtml, onSave, sectionTitle }: ResumeSectionEditorProps) {
  const [html, setHtml] = useState(sectionHtml)
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual")
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHtml(sectionHtml)
  }, [sectionHtml])

  useEffect(() => {
    if (isOpen && editorRef.current && activeTab === "visual") {
      editorRef.current.innerHTML = html
      editorRef.current.focus()
    }
  }, [isOpen, html, activeTab])

  const handleSave = () => {
    let finalHtml = html

    if (activeTab === "visual" && editorRef.current) {
      finalHtml = editorRef.current.innerHTML
    }

    onSave(finalHtml)
    onClose()
  }

  const execCommand = (command: string, value?: string) => {
    if (activeTab === "visual") {
      document.execCommand(command, false, value)
      if (editorRef.current) {
        editorRef.current.focus()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit {sectionTitle}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "visual" | "html")}
          className="flex-1 flex flex-col"
        >
          <TabsList>
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="flex-1 flex flex-col">
            <div className="border-b p-2 flex flex-wrap gap-1">
              <Button variant="ghost" size="icon" onClick={() => execCommand("bold")}>
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => execCommand("italic")}>
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => execCommand("underline")}>
                <Underline className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="ghost" size="icon" onClick={() => execCommand("insertUnorderedList")}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => execCommand("insertOrderedList")}>
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="ghost" size="icon" onClick={() => execCommand("justifyLeft")}>
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => execCommand("justifyCenter")}>
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => execCommand("justifyRight")}>
                <AlignRight className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const url = prompt("Enter URL:")
                  if (url) execCommand("createLink", url)
                }}
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>

            <div
              ref={editorRef}
              className="flex-1 p-4 overflow-auto border rounded-md mt-2"
              contentEditable
              dangerouslySetInnerHTML={{ __html: html }}
              onBlur={() => {
                if (editorRef.current) {
                  setHtml(editorRef.current.innerHTML)
                }
              }}
            />
          </TabsContent>

          <TabsContent value="html" className="flex-1 flex flex-col">
            <textarea
              className="flex-1 p-4 font-mono text-sm border rounded-md"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
