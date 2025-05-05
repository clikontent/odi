"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PaymentPage() {
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [amount, setAmount] = useState(500) // Default amount in KES
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

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
    }
  }, [user])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Please log in to complete your payment",
      })
      return
    }

    setProcessingPayment(true)
    setPaymentError(null)

    try {
      if (paymentMethod === "mpesa") {
        // Process M-Pesa payment
        const response = await processMpesaPayment(mpesaNumber, amount, "KES", "Resume Builder Payment")

        if (!response.success) {
          throw new Error(response.message)
        }

        // Record payment in database
        await recordPayment(
          user.id,
          amount,
          "KES",
          "mpesa",
          response.transactionId || "",
          response.status || "PENDING",
          response.paymentDetails,
        )

        toast({
          title: "M-Pesa request sent",
          description: "Please check your phone and enter your PIN to complete the payment",
        })

        setPaymentSuccess(true)
      } else if (paymentMethod === "card") {
        // In a real implementation, you would integrate with a card payment processor
        // For this demo, we'll simulate a successful payment

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Record payment in database
        await recordPayment(user.id, amount, "KES", "card", `CARD-${Date.now()}`, "COMPLETE", {
          last4: cardDetails.number.slice(-4),
        })

        toast({
          title: "Payment successful",
          description: "Your card payment has been processed successfully",
        })

        setPaymentSuccess(true)
      } else if (paymentMethod === "bank") {
        // Simulate bank transfer processing
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Record payment in database
        await recordPayment(user.id, amount, "KES", "bank", `BANK-${Date.now()}`, "PENDING", {
          accountName: bankDetails.accountName,
          bankName: bankDetails.bankName,
        })

        toast({
          title: "Bank transfer initiated",
          description: "Please complete the bank transfer using the provided details",
        })

        setPaymentSuccess(true)
      }

      // Redirect to success page after successful payment
      setTimeout(() => {
        router.push("/dashboard")
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Payment</CardTitle>
                  <CardDescription>Complete your payment to access premium features</CardDescription>
                </div>
                <Building className="h-10 w-10 text-primary" />
              </div>
            </CardHeader>

            {paymentSuccess ? (
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-green-50 p-6 text-center dark:bg-green-900/20">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <h3 className="mb-2 text-xl font-medium">Payment Successful!</h3>
                  <p className="text-muted-foreground">
                    Thank you for your payment. You will be redirected to the dashboard shortly.
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
                          <p className="font-medium">Resume Builder Premium</p>
                          <p className="text-sm text-muted-foreground">One-time payment</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="flex items-center">
                            <Label htmlFor="amount" className="mr-2">
                              KSh
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              min="100"
                              value={amount}
                              onChange={(e) => setAmount(Number(e.target.value))}
                              className="w-24 text-right"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Approximately ${(amount / 130).toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">Access to premium resume templates</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">AI-powered resume optimization</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">Unlimited exports to PDF and Word</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">Priority customer support</span>
                        </div>
                      </div>
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
                            transfer within 24 hours.
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
                    {processingPayment ? "Processing..." : `Pay KSh ${amount}`}
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
