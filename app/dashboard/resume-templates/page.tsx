"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, Eye } from "lucide-react"
import { getResumeTemplates } from "@/lib/templates"
import type { ResumeTemplate } from "@/lib/supabase"

export default function ResumeTemplatesPage() {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ResumeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const templates = await getResumeTemplates()
        setTemplates(templates)
        setFilteredTemplates(templates)
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  useEffect(() => {
    // Filter templates based on search query and category
    let filtered = templates

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          (template.description && template.description.toLowerCase().includes(query)),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((template) => template.category === categoryFilter)
    }

    setFilteredTemplates(filtered)
  }, [searchQuery, categoryFilter, templates])

  // Get unique categories from templates
  const categories = ["all", ...new Set(templates.map((template) => template.category))]

  const handleSelectTemplate = (templateId: string) => {
    // Navigate to resume builder with selected template
    router.push(`/dashboard/resume-builder?template=${templateId}`)
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resume Templates</h1>
            <p className="text-muted-foreground">Choose a template to start building your resume</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full md:w-auto">
              <TabsList className="w-full md:w-auto">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="capitalize">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden flex flex-col">
                  <div className="relative aspect-[3/4] bg-muted">
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
                          <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 text-white w-full">
                        <h3 className="font-bold">{template.name}</h3>
                        <p className="text-sm opacity-90 capitalize">{template.category}</p>
                      </div>
                    </div>
                  </div>
                  <CardFooter className="flex justify-between p-4">
                    <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(template)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => handleSelectTemplate(template.id)}>
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{previewTemplate.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div
                className="bg-white shadow-lg rounded-lg"
                dangerouslySetInnerHTML={{
                  __html: `
                    <style>${previewTemplate.css_content || ""}</style>
                    ${previewTemplate.html_content}
                  `,
                }}
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => handleSelectTemplate(previewTemplate.id)}>Use This Template</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
