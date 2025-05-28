"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Download, Crown, Lock, CreditCard } from 'lucide-react'
import { getResumeTemplates } from "@/lib/templates"
import { getUserSubscription, checkUsageLimit } from "@/lib/subscription"
import type { ResumeTemplate } from "@/lib/types"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ResumeBuilderPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<ResumeTemplate[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [usageCheck, setUsageCheck] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [subData, usageData] = await Promise.all([
        getUserSubscription(user?.id || ""),
        checkUsageLimit(user?.id || "", "resumes"),
      ])

      setSubscription(subData)
      setUsageCheck(usageData)

      // Fetch templates based on subscription
      const includesPremium = subData?.plan_type !== "free"
      const templatesData = await getResumeTemplates(includesPremium)
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

  const canDownload = () => {
    if (subscription?.plan_type === "free") {
      return false // Free users need to pay $6
    }
    return usageCheck?.allowed
  }

  const handleTemplateSelect = (template: ResumeTemplate) => {
    if (!canUseTemplate(template)) {
      alert("This template requires a premium subscription. Please upgrade your plan.")
      return
    }
    setSelectedTemplate(template)
  }

  const handleDownload = () => {
    if (subscription?.plan_type === "free") {
      // Redirect to payment for $6
      alert("Free users need to pay $6 to download. Redirecting to payment...")
      // Here you would integrate with Stripe or your payment processor
      return
    }

    if (!usageCheck?.allowed) {
      alert("You've reached your monthly download limit. Please upgrade your plan.")
      return
    }

    // Proceed with download
    alert("Download started!")
  }

  useEffect(() => {
    // Redirect to template selection
    router.push("/resume-builder/templates")
  }, [router])

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
        <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
        <p className="text-gray-600 mt-2">Choose a professional template and create your resume</p>
      </div>

      {/* Usage Alert for Free Users */}
      {subscription?.plan_type === "free" && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <CreditCard className="h-4 w-4" />
          <AlertDescription>
            <strong>Free Plan:</strong> You can create resumes but need to pay $6 per download. Upgrade to Premium for
            unlimited downloads.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Choose from professional resume templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => {
                  const hasAccess = canUseTemplate(template)

                  return (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? "border-blue-500 bg-blue-50"
                          : hasAccess
                            ? "border-gray-200 hover:border-gray-300"
                            : "border-gray-200 opacity-60"
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        {template.is_premium && (
                          <Badge variant="outline" className="text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>

                      {!hasAccess && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Lock className="h-3 w-3 mr-1" />
                          Upgrade Required
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {subscription?.plan_type === "free" && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">Unlock Premium Templates</p>
                  <Link href="/pricing">
                    <Button size="sm" className="w-full">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <div className="space-y-6">
              {/* Template Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button onClick={handleDownload} disabled={!canDownload()}>
                        {subscription?.plan_type === "free" ? (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay $6 & Download
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Template Preview Area */}
                  <div className="bg-gray-50 rounded-lg p-8 min-h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-48 h-64 bg-white rounded-lg shadow-lg mb-4 mx-auto flex items-center justify-center">
                        <div className="text-gray-400">
                          <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="w-24 h-3 bg-gray-200 rounded mb-4"></div>
                          <div className="space-y-2">
                            <div className="w-36 h-2 bg-gray-200 rounded"></div>
                            <div className="w-32 h-2 bg-gray-200 rounded"></div>
                            <div className="w-28 h-2 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">Template Preview</p>
                      <p className="text-sm text-gray-500">Click "Preview" for full view</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resume Builder Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Build Your Resume</CardTitle>
                  <CardDescription>Fill in your information to create your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Resume builder form will be implemented here</p>
                    <Link href="/resumes/new">
                      <Button>Start Building Resume</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Template</h3>
                  <p className="text-gray-600">Choose a template from the sidebar to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Usage Information */}
      {usageCheck && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Download Usage</h4>
                <p className="text-sm text-gray-600">
                  {usageCheck.current}/{usageCheck.limit === -1 ? "∞" : usageCheck.limit} downloads this month
                </p>
              </div>
              {subscription?.plan_type === "free" && (
                <Link href="/pricing">
                  <Button variant="outline">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade for Unlimited
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
