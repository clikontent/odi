"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { processMpesaPayment, recordPayment } from "@/lib/intasend"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  CreditCard,
  Building,
  CheckCircle,
  Loader2,
  Phone,
  BuildingIcon as BuildingBank,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function PaymentPage() {
  const { user, refreshUser, isPremium, isProfessional } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentVerified, setPaymentVerified] = useState(false)

  // Get plan and interval from URL params
  const plan = searchParams.get("plan") || (isPremium ? "professional" : "premium")
  const interval = searchParams.get("interval") || "monthly"
  const resumeId = searchParams.get("resumeId") || null

  // Calculate amount based on plan and interval
  const [amount, setAmount] = useState(() => {
    if (resumeId) {
      return 5 // $5 for a single resume
    }

    if (plan === "premium") {
      return interval === "yearly" ? 126 : 15
    } else if (plan === "professional") {
      return interval === "yearly" ? 210 : 25
    } else if (plan === "corporate") {
      return interval === "yearly" ? 1260 : 150
    }
    return 5 // Default amount for one-time purchases
  })

  // Payment method specific states
  const [mpesaNumber, setMpesaNumber] = useState("")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  })
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  })

  useEffect(() => {
    // Check if user is logged in
    if (user) {
      setLoading(false)
    } else {
      // Redirect to login if not logged in
      router.push("/login?redirect=/payment")
    }
  }, [user, router])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Please log in to complete your payment",
      })
      router.push("/login?redirect=/payment")
      return
    }

    setProcessingPayment(true)
    setPaymentError(null)

    try {
      if (paymentMethod === "mpesa") {
        // Process M-Pesa payment
        const response = await processMpesaPayment(
          mpesaNumber,
          amount,
          "USD",
          resumeId ? "Resume Download" : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan (${interval})`,
        )

        if (!response.success) {
          throw new Error(response.message || "Payment processing failed")
        }

        // Record payment in database
        await recordPayment(
          user.id,
          amount,
          "USD",
          "mpesa",
          response.transactionId || "",
          response.status || "PENDING",
          {
            plan: resumeId ? "resume_download" : plan,
            interval: resumeId ? "one_time" : interval,
            resumeId: resumeId,
            paymentDetails: response.paymentDetails,
          },
        )

        // Only update subscription if payment is successful or pending verification
        // AND if this is a subscription payment (not a resume download)
        if ((response.status === "COMPLETE" || response.status === "PENDING") && !resumeId) {
          await updateSubscription(plan, interval)
        }

        // For resume downloads, mark the payment as verified for testing
        if (resumeId) {
          setPaymentVerified(true)
        }

        toast({
          title: "M-Pesa request sent",
          description: "Please check your phone and enter your PIN to complete the payment",
        })

        setPaymentSuccess(true)
      } else if (paymentMethod === "card") {
        // Simulate API call for card payment
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Record payment in database
        await recordPayment(user.id, amount, "USD", "card", `CARD-${Date.now()}`, "COMPLETE", {
          plan: resumeId ? "resume_download" : plan,
          interval: resumeId ? "one_time" : interval,
          resumeId: resumeId,
          last4: cardDetails.number.slice(-4),
        })

        // Update subscription if this is a subscription payment
        if (!resumeId) {
          await updateSubscription(plan, interval)
        } else {
          // For resume downloads, mark the payment as verified
          setPaymentVerified(true)
        }

        toast({
          title: "Payment successful",
          description: "Your card payment has been processed successfully",
        })

        setPaymentSuccess(true)
      } else if (paymentMethod === "bank") {
        // Simulate bank transfer processing
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Record payment in database
        await recordPayment(user.id, amount, "USD", "bank", `BANK-${Date.now()}`, "PENDING", {
          plan: resumeId ? "resume_download" : plan,
          interval: resumeId ? "one_time" : interval,
          resumeId: resumeId,
          accountName: bankDetails.accountName,
          bankName: bankDetails.bankName,
        })

        // For bank transfers, we don't update subscription until payment is confirmed
        toast({
          title: "Bank transfer initiated",
          description:
            "Please complete the bank transfer using the provided details. Your subscription will be activated once payment is confirmed.",
        })

        setPaymentSuccess(true)
      }

      // Refresh user data
      await refreshUser()

      // Redirect to success page after successful payment
      setTimeout(() => {
        if (resumeId && paymentVerified) {
          // If this was a resume payment and it's verified, redirect to the resume download
          router.push(`/dashboard/resume-builder/download?id=${resumeId}`)
        } else {
          // Otherwise go to dashboard
          router.push("/dashboard")
        }
      }, 3000)
    } catch (error: any) {
      console.error("Payment error:", error)
      setPaymentError(error.message || "There was an error processing your payment. Please try again.")
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: error.message || "There was an error processing your payment. Please try again.",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  // Helper function to update subscription in database
  const updateSubscription = async (planType: string, billingInterval: string) => {
    try {
      const endDate = new Date()
      if (billingInterval === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1)
      } else {
        endDate.setMonth(endDate.getMonth() + 1)
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: planType,
          subscription_status: "pending", // Set to pending until payment is verified
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: endDate.toISOString(),
          subscription_interval: billingInterval,
        })
        .eq("id", user.id)

      if (error) throw error

      // Also create or update subscription record
      const { error: subError } = await supabase.from("subscriptions").upsert({
        user_id: user.id,
        plan: planType,
        status: "pending", // Set to pending until payment is verified
        interval: billingInterval,
        current_period_start: new Date().toISOString(),
        current_period_end: endDate.toISOString(),
        cancel_at_period_end: false,
      })

      if (subError) throw subError

      return true
    } catch (error) {
      console.error("Error updating subscription:", error)
      return false
    }
  }

  const handleCancel = () => {
    if (resumeId) {
      router.push(`/dashboard/resume-builder?id=${resumeId}`)
    } else {
      router.push("/pricing")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <Button variant="ghost" className="mb-4 flex items-center" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {resumeId ? "Back to Resume Builder" : "Back to Pricing"}
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
                  <CardDescription>
                    {resumeId
                      ? "Resume Download"
                      : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan (${interval.charAt(0).toUpperCase() + interval.slice(1)})`}
                  </CardDescription>
                </div>
                <Building className="h-10 w-10 text-primary" />
              </div>
            </CardHeader>

            {paymentSuccess ? (
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-green-50 p-6 text-center dark:bg-green-900/20">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <h3 className="mb-2 text-xl font-medium">Payment Initiated!</h3>
                  <p className="text-muted-foreground">
                    {paymentMethod === "mpesa"
                      ? "Please check your phone and enter your M-Pesa PIN to complete the payment."
                      : paymentMethod === "bank"
                        ? "Please complete the bank transfer using the provided details. Your subscription will be activated once payment is confirmed."
                        : "Thank you for your payment. Your subscription has been activated."}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    {resumeId && paymentVerified
                      ? "You will be redirected to download your resume shortly."
                      : "You will be redirected to the dashboard shortly."}
                  </p>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handlePayment}>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Payment Amount</h3>
                    <div className="mt-3 rounded-lg border bg-card p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">
                            {resumeId ? "Resume Download" : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {resumeId
                              ? "One-time payment"
                              : interval === "yearly"
                                ? "Annual billing"
                                : "Monthly billing"}
                          </p>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-xl font-bold">${amount.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground">Approximately KES {(amount * 130).toFixed(0)}</p>
                        </div>
                      </div>
                      {!resumeId && (
                        <div className="mt-4 space-y-2">
                          {plan === "premium" && (
                            <>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">10 cover letters per month</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">5 resume downloads per month</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Full ATS optimization</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">AI interview prep tool</span>
                              </div>
                            </>
                          )}
                          {plan === "professional" && (
                            <>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Unlimited cover letters</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Unlimited resume downloads</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Advanced ATS optimization</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Premium interview prep tool</span>
                              </div>
                            </>
                          )}
                          {plan === "corporate" && (
                            <>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Bulk hiring tools (100+ resumes/month)</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">AI-powered candidate matching</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Featured job posts</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Dashboard analytics & reporting</span>
                              </div>
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-sm">Dedicated account manager</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Payment Method</h3>
                    <Tabs defaultValue={paymentMethod} onValueChange={setPaymentMethod}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mpesa" className="flex items-center justify-center">
                          <Phone className="mr-2 h-4 w-4" />
                          M-Pesa
                        </TabsTrigger>
                        <TabsTrigger value="card" className="flex items-center justify-center">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Card
                        </TabsTrigger>
                        <TabsTrigger value="bank" className="flex items-center justify-center">
                          <BuildingBank className="mr-2 h-4 w-4" />
                          Bank
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="mpesa" className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="mpesaNumber">M-Pesa Phone Number</Label>
                          <Input
                            id="mpesaNumber"
                            placeholder="e.g., 0712345678"
                            value={mpesaNumber}
                            onChange={(e) => setMpesaNumber(e.target.value)}
                            required
                          />
                          <p className="mt-2 text-sm text-muted-foreground">
                            You will receive an M-Pesa prompt on your phone to complete the payment.
                          </p>
                        </div>
                      </TabsContent>

                      <TabsContent value="card" className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input
                            id="cardName"
                            placeholder="John Doe"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardExpiry">Expiry Date</Label>
                            <Input
                              id="cardExpiry"
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardCvc">CVC</Label>
                            <Input
                              id="cardCvc"
                              placeholder="123"
                              value={cardDetails.cvc}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="bank" className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="accountName">Account Name</Label>
                          <Input
                            id="accountName"
                            placeholder="Your full name"
                            value={bankDetails.accountName}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            placeholder="e.g., Equity Bank"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            placeholder="Your account number"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                            required
                          />
                        </div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Bank Transfer Information</AlertTitle>
                          <AlertDescription>
                            After submitting this form, you will receive bank transfer details. Please complete the
                            transfer within 24 hours. Your subscription will be activated once payment is confirmed.
                          </AlertDescription>
                        </Alert>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {paymentError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Payment Error</AlertTitle>
                      <AlertDescription>{paymentError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={processingPayment}>
                    {processingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {processingPayment ? "Processing..." : `Pay $${amount.toLocaleString()}`}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    By proceeding, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
