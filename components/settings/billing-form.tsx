"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, CreditCard, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BillingForm() {
  const { user } = useUser()

  const [selectedPlan, setSelectedPlan] = useState(user?.subscription_tier || "free")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currency, setCurrency] = useState<"USD" | "KES">("KES")

  const exchangeRate = 130 // 1 USD = 130 KES (approximate)

  const formatPrice = (usdPrice: number) => {
    if (currency === "USD") {
      return `$${usdPrice}`
    } else {
      return `KSh ${Math.round(usdPrice * exchangeRate)}`
    }
  }

  const plans = [
    {
      id: "free",
      name: "Individual",
      price: "Free Registration",
      description: "Pay per resume",
      features: [
        `${formatPrice(4)} per resume/CV`,
        "Unlimited access to job board",
        "Resume ATS analyzer",
        "Export to PDF and Word",
      ],
      current: user?.subscription_tier === "free",
    },
    {
      id: "corporate",
      name: "Corporate",
      price: formatPrice(19.99),
      period: "month",
      description: "For businesses and recruitment agencies",
      features: [
        "Post unlimited job listings",
        "Access to candidate database",
        "Staff onboarding tools",
        "Advanced analytics and reporting",
        "Priority support",
      ],
      current: user?.subscription_tier === "corporate",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      // In a real app, you would implement payment processing here
      // This is just a simplified example

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (selectedPlan !== "free") {
        throw new Error("Payment processing is not implemented in this demo")
      }

      setSuccess("Subscription updated successfully!")
    } catch (error: any) {
      console.error("Error updating subscription:", error)
      setError(error.message || "Failed to update subscription. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your subscription and billing information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">
                  {plans.find((plan) => plan.id === user?.subscription_tier)?.name || "Individual"}
                </p>
              </div>
              <Badge variant={user?.subscription_status === "active" ? "default" : "secondary"}>
                {user?.subscription_status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="font-medium">Currency</p>
              <Select value={currency} onValueChange={(value) => setCurrency(value as "USD" | "KES")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="KES">KES (KSh)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col p-4 border rounded-lg ${plan.current ? "border-primary" : ""}`}
                  >
                    {plan.current && (
                      <Badge className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3">Current</Badge>
                    )}
                    <div className="flex items-start">
                      <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                      <div className="ml-3 space-y-2 flex-1">
                        <Label htmlFor={plan.id} className="font-medium text-lg">
                          {plan.name}
                        </Label>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          {plan.period && <span className="ml-1 text-sm text-muted-foreground">/{plan.period}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <ul className="space-y-1 mt-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="text-sm flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || selectedPlan === user?.subscription_tier}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Updating..." : "Update Subscription"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 mr-3" />
              <div>
                <p className="font-medium">No payment method</p>
                <p className="text-sm text-muted-foreground">Add a payment method to upgrade your plan</p>
              </div>
            </div>
            <Button variant="outline">Add Payment Method</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No billing history available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
