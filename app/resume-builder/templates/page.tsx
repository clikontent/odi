"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Crown, Lock, ArrowRight } from 'lucide-react'
import { getResumeTemplates } from "@/lib/templates"
import { getUserSubscription } from "@/lib/subscription"
import type { ResumeTemplate } from "@/lib/types"
import Link from "next/link"

export default function TemplateSelectionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<ResumeTemplate[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [subData] = await Promise.all([getUserSubscription(user?.id || "")])

      setSubscription(subData)

      // Fetch all templates (we'll show premium ones with locks)
      const templatesData = await getResumeTemplates(true)
      setTemplates(templatesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const canUseTemplate = (template: ResumeTemplate) => {
    if (!template.is_premium) return true
    return subscription?.plan_type !== "free"
  }

  const handleTemplateSelect = (template: ResumeTemplate) => {
    if (!canUseTemplate(template)) {
      alert("This template requires a premium subscription. Please upgrade your plan.")
      return
    }
    setSelectedTemplate(template)
  }

  const proceedToBuilder = () => {
    if (!selectedTemplate) {
      alert("Please select a template first")
      return
    }
    
    // Navigate to resume builder with selected template
    router.push(`/resume-builder/create?template=${selectedTemplate.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Resume Template</h1>
        <p className="text-gray-600 mt-2">Select a professional template to get started with your resume</p>
      </div>

      {/* Template Categories */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">All Templates</Button>
          <Button variant="ghost" size="sm">Modern</Button>
          <Button variant="ghost" size="sm">Classic</Button>
          <Button variant="ghost" size="sm">Creative</Button>
          <Button variant="ghost" size="sm">Executive</Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => {
          const hasAccess = canUseTemplate(template)
          const isSelected = selectedTemplate?.id === template.id

          return (
            <Card
              key={template.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? "ring-2 ring-blue-500 border-blue-500" : ""
              } ${hasAccess ? "hover:scale-105" : "opacity-75"}`}
              onClick={() => handleTemplateSelect(template)}
            >
              {template.is_premium && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}

              {!hasAccess && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center text-white">
                    <Lock className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Premium Required</p>
                  </div>
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {template.preview_image_url ? (
                    <img
                      src={template.preview_image_url || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="w-32 h-40 bg-white rounded shadow-sm mx-auto mb-2 flex items-center justify-center">
                        <div className="text-xs text-gray-300">Preview</div>
                      </div>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </CardContent>

              {isSelected && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Selected
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Upgrade Banner for Free Users */}
      {subscription?.plan_type === "free" && (
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <Crown className="h-4 w-4" />
          <AlertDescription>
            <strong>Unlock Premium Templates:</strong> Upgrade to Premium or Professional to access exclusive templates
            designed by professionals.
            <Link href="/pricing" className="ml-2 text-purple-600 hover:text-purple-700 font-medium">
              View Plans →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={proceedToBuilder}
          disabled={!selectedTemplate}
          size="lg"
          className="min-w-[200px]"
        >
          Continue to Builder
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
