"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface TemplateData {
  id: string
  name: string
  html_content: string
  css_content?: string
  thumbnail_url?: string
  created_at?: string
}

interface TemplateSelectorProps {
  onSelect: (template: TemplateData) => void
  selectedTemplateId?: string
}

export function TemplateSelector({ onSelect, selectedTemplateId }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("resume_templates").select("*").order("name")

        if (error) throw error

        if (data) {
          setTemplates(data)
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [supabase])

  const handleSelectTemplate = (template: TemplateData) => {
    onSelect(template)
    setOpen(false)
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
        {selectedTemplate ? `Template: ${selectedTemplate.name}` : "Select Template"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Resume Template</DialogTitle>
            <DialogDescription>Select a template to use as the base for your resume</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:border-primary ${
                    selectedTemplateId === template.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectTemplate(template)}
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
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm">{template.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
