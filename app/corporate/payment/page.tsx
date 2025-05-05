"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, Building, CheckCircle } from "lucide-react"

export default function CorporatePayment() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  })
  const [mpesaNumber, setMpesaNumber] = useState("")
  const [processingPayment, setProcessingPayment] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

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

    try {
      // In a real app, you would integrate with a payment provider here
      // For this demo, we'll simulate a successful payment

      // Record the payment in the database
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: 2500,
          currency: "KES",
          payment_method: paymentMethod,
          payment_status: "completed",
          payment_provider: paymentMethod === "card" ? "stripe" : "mpesa",
          payment_details:
            paymentMethod === "card"
              ? {
                  last4: cardDetails.number.slice(-4),
                }
              : {
                  phone: mpesaNumber,
                },
        })
        .select()

      if (paymentError) throw paymentError

      // Create a subscription
      const now = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      const { error: subscriptionError } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_name: "corporate",
        plan_price: 2500,
        currency: "KES",
        billing_cycle: "monthly",
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
        auto_renew: true,
        payment_id: paymentData?.[0]?.id,
      })

      if (subscriptionError) throw subscriptionError

      // Update user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_tier: "corporate",
          subscription_expires_at: endDate.toISOString(),
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      toast({
        title: "Payment successful",
        description: "Your corporate subscription is now active",
      })

      // Redirect to corporate dashboard
      router.push("/corporate/dashboard")
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access this page</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-3xl">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Corporate Subscription</CardTitle>
                <CardDescription>Complete your payment to activate your corporate account</CardDescription>
              </div>
              <Building className="h-10 w-10 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Subscription Details</h3>
                <div className="mt-3 rounded-lg border bg-card p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Corporate Plan</p>
                      <p className="text-sm text-muted-foreground">Monthly subscription</p>
                    </div>
                    <p className="font-bold">KSh 2,500</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-sm">Post unlimited job listings</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-sm">Review applications and candidate profiles</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-sm">Access to candidate database</span>
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
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <RadioGroupItem value="mpesa" id="mpesa" />
                    <Label htmlFor="mpesa" className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                      </svg>
                      M-Pesa
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <form onSubmit={handlePayment}>
                {paymentMethod === "card" ? (
                  <div className="space-y-4">
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
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="mpesaNumber">M-Pesa Phone Number</Label>
                    <Input
                      id="mpesaNumber"
                      placeholder="254712345678"
                      value={mpesaNumber}
                      onChange={(e) => setMpesaNumber(e.target.value)}
                      required
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      You will receive an M-Pesa prompt on your phone to complete the payment.
                    </p>
                  </div>
                )}

                <Button type="submit" className="mt-6 w-full" disabled={processingPayment}>
                  {processingPayment ? "Processing..." : "Pay KSh 2,500"}
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support at{" "}
              <a href="mailto:support@resumeai.com" className="text-primary hover:underline">
                support@resumeai.com
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
