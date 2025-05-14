"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CreditCard, Phone } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan")
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mpesa">("card")
  const [planDetails, setPlanDetails] = useState<any>(null)
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    phoneNumber: "",
  })
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Get current user (if logged in)
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          setUserId(userData.user.id)
        }

        // Fetch plan details
        if (planId) {
          const { data: planData, error } = await supabase
            .from("subscription_plans")
            .select("*")
            .eq("id", planId)
            .single()

          if (error) {
            console.error("Error fetching plan:", error)
            toast({
              title: "Error",
              description: "Failed to load plan details. Please try again.",
              variant: "destructive",
            })
          } else {
            setPlanDetails(planData)
          }
        } else {
          // Default to basic plan if no plan ID is provided
          const { data: planData, error } = await supabase
            .from("subscription_plans")
            .select("*")
            .eq("name", "Basic")
            .single()

          if (!error && planData) {
            setPlanDetails(planData)
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [planId, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessingPayment(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // If user is not logged in, redirect to signup with plan info
      if (!userId) {
        router.push(`/signup?plan=${planId}`)
        return
      }

      // Otherwise, process payment and redirect to dashboard
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            {planDetails ? (
              <>
                {planDetails.name} Plan - {planDetails.currency}
                {planDetails.price}/{planDetails.billing_cycle}
              </>
            ) : (
              "Select a payment method to continue"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="card" onValueChange={(value) => setPaymentMethod(value as "card" | "mpesa")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card">
                <CreditCard className="h-4 w-4 mr-2" />
                Credit Card
              </TabsTrigger>
              <TabsTrigger value="mpesa">
                <Phone className="h-4 w-4 mr-2" />
                M-Pesa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card">
              <form onSubmit={handlePayment} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input
                      id="cardCvc"
                      name="cardCvc"
                      placeholder="123"
                      value={formData.cardCvc}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={processingPayment}>
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    `Pay ${planDetails ? `${planDetails.currency}${planDetails.price}` : ""}`
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="mpesa">
              <form onSubmit={handlePayment} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="254XXXXXXXXX"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={processingPayment}>
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    `Pay with M-Pesa ${planDetails ? `${planDetails.currency}${planDetails.price}` : ""}`
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
