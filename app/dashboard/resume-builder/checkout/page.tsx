"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Check, CreditCard, FileText } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handleCheckout = () => {
    setIsProcessing(true)

    // Simulate Intasend checkout process
    setTimeout(() => {
      setIsProcessing(false)
      router.push("/dashboard/resume-builder/success")
    }, 2000)
  }

  return (
    <div className="container max-w-6xl py-8">
      <Button variant="ghost" className="mb-6" onClick={handleBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Preview
      </Button>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Complete your purchase to download your resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Payment Method</h3>

                <RadioGroup defaultValue="mpesa" className="space-y-3">
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="mpesa" id="mpesa" />
                    <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative">
                          <Image
                            src="/placeholder.svg?height=40&width=40"
                            alt="M-Pesa"
                            fill
                            className="object-contain"
                          />
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
                        <div className="h-10 w-10 flex items-center justify-center">
                          <CreditCard className="h-6 w-6" />
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

              <div className="space-y-4">
                <h3 className="font-medium">Contact Information</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" defaultValue="+254 712 345 678" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Professional Resume</p>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>KSh 500.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>KSh 80.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>KSh 580.00</span>
                </div>
              </div>

              <div className="rounded-md bg-muted p-3">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">What's included:</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li>High-quality PDF download</li>
                      <li>ATS-optimized format</li>
                      <li>Unlimited edits for 30 days</li>
                      <li>Email and print versions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Complete Payment"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

