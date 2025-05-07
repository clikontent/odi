"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/lib/supabase"

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user, refreshUser } = useUser()

  const handleSelectPlan = async (plan: string) => {
    try {
      setIsLoading(plan)

      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to select a plan",
        })
        router.push("/login")
        return
      }

      // Update user's subscription tier in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: plan,
          subscription_status: "active",
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(
            billingInterval === "yearly"
              ? Date.now() + 365 * 24 * 60 * 60 * 1000
              : Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      // If it's a paid plan, redirect to payment page
      if (plan !== "free") {
        router.push(`/payment?plan=${plan}&interval=${billingInterval}`)
      } else {
        // For free plan, just show success and redirect to dashboard
        toast({
          title: "Plan selected!",
          description: "You've successfully selected the Free plan.",
        })

        await refreshUser()
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error selecting plan:", error)
      toast({
        title: "Error",
        description: "Failed to select plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Plan</h1>
        <p className="max-w-[85%] text-muted-foreground sm:text-lg">
          Select the plan that best fits your needs. You can upgrade or downgrade at any time.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <Tabs
          defaultValue="monthly"
          className="w-full max-w-3xl"
          onValueChange={(v) => setBillingInterval(v as "monthly" | "yearly")}
        >
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save 30%)</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="monthly" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>Pay-per-use, try before you buy</CardDescription>
                  <div className="mt-4 text-3xl font-bold">Free</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>5 Free AI-Generated Cover Letters (One-Time)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>One-Time Resume/CV Download (KES 500)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Basic ATS Score (No Fixes)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Job Board (Read-Only)</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleSelectPlan("free")} disabled={isLoading !== null}>
                    {isLoading === "free" ? "Processing..." : "Select Free Plan"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="border-primary">
                <CardHeader>
                  <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full w-fit mb-2">
                    MOST POPULAR
                  </div>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>Maximum value for job seekers</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    KES 1,000<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Unlimited AI-Generated Cover Letters</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Full ATS Optimization (Not Just Scores)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>10 Resume/CV Downloads (All Templates)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Priority Job Board Access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>AI Interview Prep Tool</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSelectPlan("premium")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "premium" ? "Processing..." : "Select Premium Plan"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Corporate Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Corporate Plan</CardTitle>
                  <CardDescription>For employers & recruiters</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    KES 15,000<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Bulk Hiring Tools (100+ resumes/month)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>AI-powered candidate matching</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Featured job posts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Dashboard analytics & reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleSelectPlan("corporate")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "corporate" ? "Processing..." : "Contact Sales"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="yearly" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Free Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <CardDescription>Pay-per-use, try before you buy</CardDescription>
                  <div className="mt-4 text-3xl font-bold">Free</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>5 Free AI-Generated Cover Letters (One-Time)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>One-Time Resume/CV Download (KES 500)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Basic ATS Score (No Fixes)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Job Board (Read-Only)</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleSelectPlan("free")} disabled={isLoading !== null}>
                    {isLoading === "free" ? "Processing..." : "Select Free Plan"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="border-primary">
                <CardHeader>
                  <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full w-fit mb-2">
                    BEST VALUE
                  </div>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>Maximum value for job seekers</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    KES 8,000<span className="text-sm font-normal text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Save KES 4,000 compared to monthly</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Unlimited AI-Generated Cover Letters</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Full ATS Optimization (Not Just Scores)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>10 Resume/CV Downloads (All Templates)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Priority Job Board Access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>AI Interview Prep Tool</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSelectPlan("premium")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "premium" ? "Processing..." : "Select Premium Plan"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Corporate Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Corporate Plan</CardTitle>
                  <CardDescription>For employers & recruiters</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    KES 120,000<span className="text-sm font-normal text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Save KES 60,000 compared to monthly</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Bulk Hiring Tools (100+ resumes/month)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>AI-powered candidate matching</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Featured job posts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Dashboard analytics & reporting</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handleSelectPlan("corporate")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "corporate" ? "Processing..." : "Contact Sales"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-12 flex justify-center">
        <div className="flex items-start gap-2 max-w-2xl text-sm text-muted-foreground">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>
            All plans include access to our resume templates and job board. Premium and Corporate plans offer additional
            features and benefits. You can upgrade, downgrade, or cancel your subscription at any time. For more
            information, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}
