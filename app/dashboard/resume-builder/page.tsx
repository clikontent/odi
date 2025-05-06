"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Check, FileIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getResumeTemplates, getResumeTemplateById } from "@/lib/templates"
import type { ResumeTemplate } from "@/lib/supabase"
import ErrorBoundary from "@/components/error-boundary"
import { toast } from "@/components/ui/use-toast"

// Dynamically import the resume builders with no SSR
const PlaceholderResumeBuilder = dynamic(() => import("@/components/placeholder-resume-builder"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
})

export default function ResumeBuilder() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("template")

  const [step, setStep] = useState<"template" | "edit" | "preview" | "checkout">("template")
  const [resumeTitle, setResumeTitle] = useState("My Resume")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(templateId)
  const [templates, setTemplates] = useState<ResumeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [resumeHtml, setResumeHtml] = useState<string | null>(null)
  const [resumeData, setResumeData] = useState<any | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [builderType, setBuilderType] = useState<"html" | "placeholder">("placeholder")
  const [hasPaid, setHasPaid] = useState(false)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // If template ID is provided in URL, go directly to edit step
  useEffect(() => {
    if (templateId) {
      setSelectedTemplateId(templateId)
      setStep("edit")
    }
  }, [templateId])

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data } = await supabase.auth.getUser()

        if (data?.user) {
          setUserId(data.user.id)
        }

        const templates = await getResumeTemplates()

        if (templates && templates.length > 0) {
          setTemplates(templates)

          // If no template is selected yet, use the first one
          if (!selectedTemplateId) {
            setSelectedTemplateId(templates[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
        toast({
          title: "Error",
          description: "Failed to load resume templates. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [selectedTemplateId])

  useEffect(() => {
    async function fetchSelectedTemplate() {
      if (selectedTemplateId) {
        try {
          setLoading(true)
          const template = await getResumeTemplateById(selectedTemplateId)
          if (template) {
            setSelectedTemplate(template)

            // If we're in the edit step, make sure we have the template before proceeding
            if (step === "edit" && !template.html_content) {
              console.error("Template has no HTML content")
              toast({
                title: "Error",
                description: "The selected template is missing content. Please choose another template.",
                variant: "destructive",
              })
              // Fallback to template selection if the template has no content
              setStep("template")
            }
          }
        } catch (error) {
          console.error("Error fetching template:", error)
          toast({
            title: "Error",
            description: "Failed to load the selected template. Please try again.",
            variant: "destructive",
          })
          // Fallback to template selection if there's an error
          setStep("template")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchSelectedTemplate()
  }, [selectedTemplateId, step])

  const saveResume = async (html: string, data?: any) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to save a resume",
        variant: "destructive",
      })
      return
    }

    try {
      setResumeHtml(html)
      setResumeData(data || null)

      // Save to resumes table
      const { data: savedData, error } = await supabase.from("resumes").insert({
        user_id: userId,
        title: resumeTitle,
        content: { html, data },
        template_id: selectedTemplateId,
        is_public: false,
        is_paid: hasPaid,
      })

      if (error) {
        console.error("Error details:", error)
        throw error
      }

      setHasSaved(true)
      toast({
        title: "Success",
        description: "Your resume has been saved successfully!",
      })

      // Move to preview step
      setStep("preview")
    } catch (error) {
      console.error("Error saving resume:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    setStep("edit")
  }

  const exportToPdf = () => {
    // Implement your PDF export logic here
    // This is a placeholder function
    toast({
      title: "Download PDF",
      description: "Downloading PDF functionality is not yet implemented.",
    })
  }

  const renderStepContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    switch (step) {
      case "template":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
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
                  </div>
                  <CardContent className="p-3 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{template.category}</p>
                    </div>
                    <Button className="w-full mt-2" onClick={() => handleSelectTemplate(template.id)} size="sm">
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => router.push("/dashboard/resume-templates")}>
                View All Templates
              </Button>
            </div>
          </div>
        )

      case "edit":
        return selectedTemplate ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex-1">
                <Label htmlFor="resumeTitle">Resume Title</Label>
                <Input
                  id="resumeTitle"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="h-[calc(100vh-180px)]">
              <ErrorBoundary>
                {isClient && (
                  <PlaceholderResumeBuilder
                    templateHtml={selectedTemplate.html_content}
                    templateCss={selectedTemplate.css_content || ""}
                    onSave={saveResume}
                  />
                )}
              </ErrorBoundary>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Please select a template</p>
          </div>
        )

      case "preview":
        return (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardHeader className="py-2">
                <CardTitle className="text-lg">{resumeTitle}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-white p-6">
                  {resumeHtml && selectedTemplate && (
                    <div
                      className="min-h-[800px]"
                      dangerouslySetInnerHTML={{
                        __html: `
                          <style>
                            ${selectedTemplate.css_content || ""}
                            .page-break {
                              height: 20px;
                              background-color: #f5f5f5;
                              margin: 20px 0;
                              border-top: 1px dashed #ccc;
                              border-bottom: 1px dashed #ccc;
                            }
                            @media print {
                              .page-break {
                                page-break-before: always;
                                height: 0;
                                margin: 0;
                                border: none;
                              }
                            }
                          </style>
                          ${resumeHtml}
                        `,
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {!hasPaid ? (
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Download Your Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    To download your resume as a PDF, please pay the one-time fee of KES 500 (approx. $4).
                  </p>
                  <Button onClick={() => setStep("checkout")} className="w-full">
                    Pay KES 500 to Download
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("edit")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Editor
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => exportToPdf()}>
                    <FileIcon className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      case "checkout":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-medium">Resume Download</h3>
                    <p className="text-sm text-muted-foreground">{resumeTitle}</p>
                  </div>
                  <div className="font-bold">KES 500</div>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expMonth">Expiry Month</Label>
                      <Input id="expMonth" placeholder="MM" />
                    </div>
                    <div>
                      <Label htmlFor="expYear">Expiry Year</Label>
                      <Input id="expYear" placeholder="YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setHasPaid(true)
                      toast({
                        title: "Payment Successful",
                        description: "Your payment was successful. You can now download your resume.",
                      })
                      setStep("preview")
                    }}
                  >
                    Pay KES 500 & Download
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("preview")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Preview
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-4">
        <div className="flex flex-col gap-4">
          {step !== "edit" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
                  <p className="text-muted-foreground">Create and customize your professional resume</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-1 bg-primary transition-all"
                    style={{
                      width:
                        step === "template" ? "25%" : step === "edit" ? "50%" : step === "preview" ? "75%" : "100%",
                    }}
                  />
                </div>

                <div className="flex justify-between pt-6 pb-6">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${step === "template" ? "bg-primary text-white" : "bg-muted"}`}
                    >
                      {step === "template" ? "1" : <Check className="h-4 w-4" />}
                    </div>
                    <span className="text-xs mt-1">Choose Template</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${step === "edit" ? "bg-primary text-white" : step === "template" ? "bg-muted" : "bg-primary text-white"}`}
                    >
                      {step === "edit" ? "2" : step === "template" ? "2" : <Check className="h-4 w-4" />}
                    </div>
                    <span className="text-xs mt-1">Edit Content</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${step === "preview" ? "bg-primary text-white" : step === "checkout" ? "bg-primary text-white" : "bg-muted"}`}
                    >
                      {step === "preview" ? "3" : step === "checkout" ? <Check className="h-4 w-4" /> : "3"}
                    </div>
                    <span className="text-xs mt-1">Preview</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${step === "checkout" ? "bg-primary text-white" : "bg-muted"}`}
                    >
                      {step === "checkout" ? "4" : "4"}
                    </div>
                    <span className="text-xs mt-1">Checkout</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {renderStepContent()}
        </div>
      </div>
    </DashboardLayout>
  )
}
