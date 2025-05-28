"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Edit, Share2, CreditCard, Crown, CheckCircle } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { getTemplateById, renderResumeHTML } from "@/lib/templates"
import { checkUsageLimit, incrementUsage, getUserSubscription } from "@/lib/subscription"
import { processPayment } from "@/lib/intasend"

export default function ResumePreviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const resumeId = params.id as string

  const [resume, setResume] = useState<any>(null)
  const [template, setTemplate] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [usageCheck, setUsageCheck] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  useEffect(() => {
    if (user && resumeId) {
      fetchResumeData()
    }
  }, [user, resumeId])

  const fetchResumeData = async () => {
    try {
      // Fetch resume
      const { data: resumeData, error: resumeError } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .eq("user_id", user?.id)
        .single()

      if (resumeError) throw resumeError

      // Fetch template
      const templateData = await getTemplateById(resumeData.template_id)

      // Fetch subscription and usage
      const [subData, usageData] = await Promise.all([
        getUserSubscription(user?.id || ""),
        checkUsageLimit(user?.id || "", "resumes"),
      ])

      setResume(resumeData)
      setTemplate(templateData)
      setSubscription(subData)
      setUsageCheck(usageData)
    } catch (error) {
      console.error("Error fetching resume data:", error)
    } finally {
      setLoading(false)
    }
  }

  const canDownloadFree = () => {
    if (subscription?.plan_type === "free") {
      return false // Free users must pay $6
    }
    return usageCheck?.allowed
  }

  const handleDownload = async () => {
    if (subscription?.plan_type === "free") {
      // Redirect to payment
      await handlePayment()
      return
    }

    if (!usageCheck?.allowed) {
      // Offer to pay $6 for additional download
      const confirmPayment = confirm(
        "You've reached your monthly download limit. Pay $6 for an additional download?"
      )
      if (confirmPayment) {
        await handlePayment()
        return
      }
      return
    }

    // Proceed with free download
    await processDownload()
  }

  const handlePayment = async () => {
    setPaymentProcessing(true)
    try {
      // Process $6 payment via IntaSend
      const paymentResult = await processPayment({
        amount: 6.00,
        currency: "USD",
        description: "Resume Download",
        user_id: user?.id,
        payment_type: "one_time_download",
      })

      if (paymentResult.success) {
        // Payment successful, proceed with download
        await processDownload()
        
        // Record payment
        await supabase.from("payments").insert({
          user_id: user?.id,
          intasend_transaction_id: paymentResult.transaction_id,
          payment_type: "one_time_download",
          amount: 6.00,
          currency: "USD",
          status: "completed",
          description: "Resume Download",
        })
      } else {
        alert("Payment failed. Please try again.")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setPaymentProcessing(false)
    }
  }

  const processDownload = async () => {
    setDownloading(true)
    try {
      // Generate PDF/DOCX file
      const html = renderResumeHTML(template, resume.content)
      
      // In a real implementation, you would:
      // 1. Send HTML to a PDF generation service
      // 2. Store the file in cloud storage
      // 3. Return download URL
      
      // For demo, we'll simulate the download
      const blob = new Blob([html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${resume.title || "resume"}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Record download
      await supabase.from("download_history").insert({
        user_id: user?.id,
        item_type: "resume",
        item_id: resumeId,
        download_format: "pdf",
        is_paid_download: subscription?.plan_type === "free",
      })

      // Increment usage if not a paid download
      if (subscription?.plan_type !== "free") {
        await incrementUsage(user?.id || "", "resumes")
      }

      alert("Download started!")
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!resume || !template) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Resume not found or you don't have permission to view it.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-lg font-semibold">{resume.title}</h1>
              <p className="text-sm text-gray-600">Ready to download</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push(`/resume-builder/create?template=${template.id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Resume
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleDownload}
                disabled={downloading || paymentProcessing}
                className="min-w-[140px]"
              >
                {paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Downloading...
                  </>
                ) : subscription?.plan_type === "free" ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay $6 & Download
                  </>
                ) : !usageCheck?.allowed ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay $6 & Download
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Template Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-16 bg-gray-100 rounded border"></div>
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-gray-600">{template.category}</p>
                    {template.is_premium && (
                      <Badge className="mt-1">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Download Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">PDF Format</p>
                    <p className="text-sm text-gray-600">Best for applications</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                  <div>
                    <p className="font-medium">DOCX Format</p>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Info */}
            {usageCheck && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Downloads this month</span>
                      <span>
                        {usageCheck.current}/{usageCheck.limit === -1 ? "∞" : usageCheck.limit}
                      </span>
                    </div>
                    {subscription?.plan_type === "free" && (
                      <Alert className="mt-3">
                        <CreditCard className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Free users pay $6 per download. Upgrade for unlimited downloads.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Resume Preview</CardTitle>
                <CardDescription>This is how your resume will look when downloaded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-200 rounded-lg p-8 min-h-[1000px] shadow-lg">
                  <div
                    className="resume-preview"
                    dangerouslySetInnerHTML={{
                      __html: renderResumeHTML(template, resume.content),
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
