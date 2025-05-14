"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/lib/supabase"
import { Download, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ResumeDownloadPage() {
  const { user, incrementResumeDownloadCount } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const resumeId = searchParams.get("id")

  const [isLoading, setIsLoading] = useState(true)
  const [resume, setResume] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid" | "pending" | "failed">("unpaid")
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    const checkResumeAndPayment = async () => {
      if (!resumeId || !user) {
        router.push("/dashboard/resume-builder")
        return
      }

      setIsLoading(true)
      try {
        // Get the resume
        const { data: resumeData, error: resumeError } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", resumeId)
          .eq("user_id", user.id)
          .single()

        if (resumeError) throw resumeError

        if (!resumeData) {
          toast({
            variant: "destructive",
            title: "Resume not found",
            description: "The requested resume could not be found.",
          })
          router.push("/dashboard/resume-builder")
          return
        }

        setResume(resumeData)

        // Check payment status
        if (resumeData.payment_status) {
          setPaymentStatus(resumeData.payment_status as any)
        } else {
          // Check if there's a payment record for this resume
          const { data: paymentData, error: paymentError } = await supabase
            .from("payments")
            .select("*")
            .eq("user_id", user.id)
            .eq("payment_details->resumeId", resumeId)
            .order("created_at", { ascending: false })
            .limit(1)

          if (!paymentError && paymentData && paymentData.length > 0) {
            setPaymentStatus(paymentData[0].payment_status as any)

            // Update the resume payment status if needed
            if (paymentData[0].payment_status === "completed" || paymentData[0].payment_status === "paid") {
              await supabase.from("resumes").update({ payment_status: "paid" }).eq("id", resumeId)
            }
          }
        }

        // Generate a temporary download URL if payment is confirmed
        if (paymentStatus === "paid" || resumeData.payment_status === "paid") {
          // In a real app, you would generate the PDF here
          // For now, we'll just simulate it
          setDownloadUrl(`/api/resumes/${resumeId}/download`)
        }
      } catch (error) {
        console.error("Error checking resume and payment:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load resume data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkResumeAndPayment()
  }, [resumeId, user, router, toast, paymentStatus])

  const handleDownload = async () => {
    if (!user || !resumeId) return

    setIsDownloading(true)
    try {
      // Increment the resume download count
      const success = await incrementResumeDownloadCount()

      if (!success) {
        toast({
          variant: "destructive",
          title: "Download limit reached",
          description:
            "You have reached your resume download limit. Please upgrade your plan to download more resumes.",
        })
        return
      }

      // In a real app, you would download the PDF here
      // For now, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Resume downloaded",
        description: "Your resume has been downloaded successfully.",
      })

      // Log the download activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        activity_type: "resume",
        action: "download",
        entity_id: resumeId,
        entity_type: "resume",
        activity_details: {
          resume_id: resumeId,
          resume_title: resume?.title,
        },
      })
    } catch (error) {
      console.error("Error downloading resume:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download resume. Please try again.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleGoBack = () => {
    router.push(`/dashboard/resume-builder?id=${resumeId}`)
  }

  const handlePayNow = () => {
    router.push(`/payment?resumeId=${resumeId}`)
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Checking payment status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" className="mb-4 flex items-center" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resume Builder
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Resume Download</CardTitle>
            <CardDescription>{resume?.title || "My Resume"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {paymentStatus === "paid" ? (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Payment Confirmed</AlertTitle>
                <AlertDescription>Your payment has been confirmed. You can now download your resume.</AlertDescription>
              </Alert>
            ) : paymentStatus === "pending" ? (
              <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Payment Pending</AlertTitle>
                <AlertDescription>
                  Your payment is being processed. Once confirmed, you will be able to download your resume. This may
                  take a few minutes.
                </AlertDescription>
              </Alert>
            ) : paymentStatus === "failed" ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Failed</AlertTitle>
                <AlertDescription>Your payment could not be processed. Please try again.</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Required</AlertTitle>
                <AlertDescription>Please complete the payment to download your resume.</AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg border p-6 text-center">
              <h3 className="text-xl font-medium mb-2">{resume?.title || "My Resume"}</h3>
              <p className="text-muted-foreground mb-6">
                Created on {new Date(resume?.created_at).toLocaleDateString()}
              </p>

              {paymentStatus === "paid" ? (
                <Button onClick={handleDownload} disabled={isDownloading} className="w-full md:w-auto">
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" /> Download Resume
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handlePayNow} className="w-full md:w-auto">
                  Pay Now to Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
