"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container py-12 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Simple, transparent pricing</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that's right for you and start building your professional career today.
            </p>
          </div>

          <div className="mt-12">
            <Tabs
              defaultValue="monthly"
              className="mx-auto max-w-4xl"
              onValueChange={(v) => setBillingInterval(v as "monthly" | "yearly")}
            >
              <div className="flex justify-center">
                <TabsList className="grid w-64 grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly (Save 30%)</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="monthly" className="mt-8">
                <div className="grid gap-8 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Free Plan</CardTitle>
                      <CardDescription>Pay-per-use, try before you buy</CardDescription>
                      <div className="mt-1 text-2xl font-bold">Free</div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>5 Free AI-Generated Cover Letters</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>One-Time Resume Download (KES 500)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Basic ATS Score (No Fixes)</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href="/signup">Get Started</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-primary">
                    <CardHeader className="pb-2">
                      <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full w-fit mb-1">
                        MOST POPULAR
                      </div>
                      <CardTitle>Premium Plan</CardTitle>
                      <CardDescription>Maximum value for job seekers</CardDescription>
                      <div className="mt-1 text-2xl font-bold">
                        KES 1,000<span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Unlimited AI-Generated Cover Letters</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Full ATS Optimization</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>10 Resume Downloads (All Templates)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>AI Interview Prep Tool</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href="/signup?plan=premium">Get Premium</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Corporate Plan</CardTitle>
                      <CardDescription>For businesses and recruiters</CardDescription>
                      <div className="mt-1 text-2xl font-bold">
                        KES 5,000<span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>All Premium Features</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Bulk Resume Analysis</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Candidate Matching</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Advanced Analytics</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Priority Support</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/contact-sales">Contact Sales</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="yearly" className="mt-8">
                <div className="grid gap-8 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Free Plan</CardTitle>
                      <CardDescription>Pay-per-use, try before you buy</CardDescription>
                      <div className="mt-1 text-2xl font-bold">Free</div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>5 Free AI-Generated Cover Letters</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>One-Time Resume Download (KES 500)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Basic ATS Score (No Fixes)</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href="/signup">Get Started</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="border-primary">
                    <CardHeader className="pb-2">
                      <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full w-fit mb-1">
                        BEST VALUE
                      </div>
                      <CardTitle>Premium Plan</CardTitle>
                      <CardDescription>Maximum value for job seekers</CardDescription>
                      <div className="mt-1 text-2xl font-bold">
                        KES 8,400<span className="text-sm font-normal text-muted-foreground">/year</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Save KES 3,600 compared to monthly</p>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Unlimited AI-Generated Cover Letters</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Full ATS Optimization</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>10 Resume Downloads (All Templates)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>AI Interview Prep Tool</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Advanced Resume Analytics</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href="/signup?plan=premium-yearly">Get Premium</Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Corporate Plan</CardTitle>
                      <CardDescription>For businesses and recruiters</CardDescription>
                      <div className="mt-1 text-2xl font-bold">
                        KES 42,000<span className="text-sm font-normal text-muted-foreground">/year</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Save KES 18,000 compared to monthly</p>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>All Premium Features</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Bulk Resume Analysis</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Candidate Matching</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Advanced Analytics</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                          <span>Priority Support</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/contact-sales">Contact Sales</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mx-auto mt-16 max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="mt-8 grid gap-4 text-left">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Can I switch plans later?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your
                  next billing cycle.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">What payment methods do you accept?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We accept all major credit cards, M-Pesa, and PayPal. Corporate clients can also pay via bank
                  transfer.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Is there a refund policy?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied, contact our support
                  team within 7 days of purchase.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
