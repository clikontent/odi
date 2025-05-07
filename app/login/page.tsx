"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Facebook, Loader2, AlertCircle, CheckCircle, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginStatus, setLoginStatus] = useState<{
    success?: boolean
    message?: string
  } | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginStatus(null)

    try {
      // Create a new Supabase client for the component
      const supabase = createClientComponentClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setLoginStatus({
        success: true,
        message: "Login successful! Redirecting to dashboard...",
      })

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      })

      // Force a hard navigation to ensure the context is refreshed
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Login error:", error)
      setLoginStatus({
        success: false,
        message: error.message || "Invalid email or password",
      })

      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Failed to connect to authentication service",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      setLoginStatus(null)
      // Create a new Supabase client for the component
      const supabase = createClientComponentClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error("Social login error:", error)
      setLoginStatus({
        success: false,
        message: error.message || "Social login failed",
      })

      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Failed to connect to authentication service",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
        <div className="flex flex-col justify-center space-y-6 rounded-lg bg-primary/5 p-8">
          <div>
            <h1 className="text-3xl font-bold">CV Chap Chap</h1>
            <p className="text-xl text-muted-foreground mt-2">Build your career with AI-powered tools</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Choose the right plan for you</h2>

            <Tabs
              defaultValue="monthly"
              className="w-full"
              onValueChange={(v) => setBillingInterval(v as "monthly" | "yearly")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly (Save 30%)</TabsTrigger>
              </TabsList>

              <TabsContent value="monthly" className="mt-4 space-y-4">
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
                </Card>
              </TabsContent>

              <TabsContent value="yearly" className="mt-4 space-y-4">
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
                </Card>

                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full w-fit mb-1">
                      BEST VALUE
                    </div>
                    <CardTitle>Premium Plan</CardTitle>
                    <CardDescription>Maximum value for job seekers</CardDescription>
                    <div className="mt-1 text-2xl font-bold">
                      KES 8,000<span className="text-sm font-normal text-muted-foreground">/year</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Save KES 4,000 compared to monthly</p>
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
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>Enter your email and password to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              {loginStatus && (
                <Alert
                  className={`mb-4 ${loginStatus.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
                >
                  {loginStatus.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>{loginStatus.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{loginStatus.message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </form>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("google")}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                      <path d="M12 8v8" />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("facebook")}>
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                </div>
              </div>

              <div className="flex flex-col space-y-4 mt-6">
                <Button type="submit" className="w-full" disabled={loading} onClick={handleEmailLogin}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">Don&apos;t have an account? </span>
                  <Link href="/signup" className="text-sm text-primary underline-offset-4 hover:underline">
                    Sign up
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
