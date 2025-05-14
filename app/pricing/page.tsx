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
        router.push("/login?redirect=/pricing")
        return
      }

      // For free plan, just show success and redirect to dashboard
      if (plan === "free") {
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

        toast({
          title: "Plan selected!",
          description: "You've successfully selected the Free plan.",
        })

        await refreshUser()
        router.push("/dashboard")
      } else {
        // For paid plans, redirect to payment page
        router.push(`/payment?plan=${plan}&interval=${billingInterval}`)
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
          className="w-full max-w-5xl"
          onValueChange={(v) => setBillingInterval(v as "monthly" | "yearly")}
        >
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save 30%)</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="monthly" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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
                      <span>5 Free AI-Generated Cover Letters</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Resumes cost $5 each</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>ATS Optimizer (Locked)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Interview Prep (Locked)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Job Board (Public Jobs Only)</span>
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
              <Card>
                <CardHeader>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>Great value for job seekers</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    $15<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>10 AI-Generated Cover Letters/month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>5 Resume Downloads/month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Full ATS Optimization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>AI Interview Prep Tool</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Job Board (Public + Private Jobs)</span>
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

              {/* Professional Plan */}
              <Card className="border-primary">
                <CardHeader>
                  <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full w-fit mb-2">
                    MOST POPULAR
                  </div>
                  <CardTitle>Professional Plan</CardTitle>
                  <CardDescription>Unlimited access for serious job seekers</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    $25<span className="text-sm font-normal text-muted-foreground">/month</span>
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
                      <span>Unlimited Resume Downloads</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Advanced ATS Optimization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Premium Interview Prep Tool</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Full Job Board Access</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSelectPlan("professional")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "professional" ? "Processing..." : "Select Professional Plan"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Corporate Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Corporate Plan</CardTitle>
                  <CardDescription>For employers & recruiters</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    $150<span className="text-sm font-normal text-muted-foreground">/month</span>
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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
                      <span>5 Free AI-Generated Cover Letters</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Resumes cost $5 each</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>ATS Optimizer (Locked)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Interview Prep (Locked)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Job Board (Public Jobs Only)</span>
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
              <Card>
                <CardHeader>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>Great value for job seekers</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    $126<span className="text-sm font-normal text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Save $54 compared to monthly</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>10 AI-Generated Cover Letters/month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>5 Resume Downloads/month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Full ATS Optimization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>AI Interview Prep Tool</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Job Board (Public + Private Jobs)</span>
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

              {/* Professional Plan */}
              <Card className="border-primary">
                <CardHeader>
                  <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full w-fit mb-2">
                    BEST VALUE
                  </div>
                  <CardTitle>Professional Plan</CardTitle>
                  <CardDescription>Unlimited access for serious job seekers</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    $210<span className="text-sm font-normal text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Save $90 compared to monthly</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Unlimited AI-Generated Cover Letters</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Unlimited Resume Downloads</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Advanced ATS Optimization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Premium Interview Prep Tool</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                      <span>Full Job Board Access</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSelectPlan("professional")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "professional" ? "Processing..." : "Select Professional Plan"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Corporate Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Corporate Plan</CardTitle>
                  <CardDescription>For employers & recruiters</CardDescription>
                  <div className="mt-4 text-3xl font-bold">
                    $1,260<span className="text-sm font-normal text-muted-foreground">/year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Save $540 compared to monthly</p>
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
            All plans include access to our resume templates and job board. Premium, Professional, and Corporate plans
            offer additional features and benefits. You can upgrade, downgrade, or cancel your subscription at any time.
            For more information, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}
