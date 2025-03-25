"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Loader2, Phone } from "lucide-react"

interface IntasendCheckoutProps {
  amount: number
  currency?: string
  description: string
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
}

export function IntasendCheckout({ amount, currency = "KES", description, onSuccess, onError }: IntasendCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const handlePayment = async () => {
    setIsProcessing(true)
    setError("")

    try {
      // In a real implementation, this would call the Intasend API
      // const response = await fetch('/api/payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount,
      //     currency,
      //     description,
      //     paymentMethod,
      //     phoneNumber: paymentMethod === 'mpesa' ? phoneNumber : undefined,
      //     cardDetails: paymentMethod === 'card' ? cardDetails : undefined
      //   })
      // })
      // const data = await response.json()

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful payment
      const transactionId = `TRX${Math.random().toString(36).substring(2, 10).toUpperCase()}`

      if (onSuccess) {
        onSuccess(transactionId)
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError("An error occurred while processing your payment. Please try again.")

      if (onError) {
        onError("Payment processing failed")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid = () => {
    if (paymentMethod === "mpesa") {
      return phoneNumber.length >= 10
    } else {
      return (
        cardDetails.number.length >= 16 &&
        cardDetails.expiry.length === 5 &&
        cardDetails.cvc.length >= 3 &&
        cardDetails.name.length > 0
      )
    }
  }

  const formatCardExpiry = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "")

    // Format as MM/YY
    if (digits.length <= 2) {
      return digits
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardExpiry(e.target.value)
    setCardDetails({ ...cardDetails, expiry: formatted })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Complete your payment to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md bg-muted p-4">
          <div className="flex justify-between">
            <span>Amount</span>
            <span className="font-medium">
              {currency} {amount.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        <div className="space-y-4">
          <Label>Payment Method</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as "mpesa" | "card")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="mpesa" id="mpesa" />
              <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">M-Pesa</p>
                    <p className="text-sm text-muted-foreground">Pay with M-Pesa mobile money</p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or other cards</p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {paymentMethod === "mpesa" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="e.g., 0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter the M-Pesa registered phone number</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Cardholder Name</Label>
              <Input
                id="card-name"
                placeholder="Name on card"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handlePayment} disabled={isProcessing || !isFormValid()}>
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isProcessing ? "Processing..." : `Pay ${currency} ${amount.toFixed(2)}`}
        </Button>
      </CardFooter>
    </Card>
  )
}

