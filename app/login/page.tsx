"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Facebook, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useUser } from "@/contexts/user-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [loginStatus, setLoginStatus] = useState<{
    success?: boolean
    message?: string
  } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/dashboard"
  const { toast } = useToast()
  const { refreshUser } = useUser()

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClientComponentClient()
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        // Already logged in, redirect to dashboard
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [router])

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

      // Refresh user data in context
      await refreshUser()

      // Redirect to the specified path or dashboard
      router.push(redirectPath)
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
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectPath}`,
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="grid w-full max-w-[1200px] grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
        <div className="flex flex-col justify-center space-y-6 rounded-lg bg-primary/5 p-8">
          <div>
            <h1 className="text-3xl font-bold">ResumeAI</h1>
            <p className="text-xl text-muted-foreground mt-2">Build your career with AI-powered tools</p>
          </div>
          <blockquote className="border-l-4 border-primary pl-4 italic">
            "The future belongs to those who believe in the beauty of their dreams."
            <footer className="text-sm text-muted-foreground mt-2">— Eleanor Roosevelt</footer>
          </blockquote>
          <img
            src="/placeholder.svg?height=400&width=400"
            alt="Login illustration"
            className="mx-auto rounded-lg object-cover"
            width={400}
            height={400}
          />
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

                <div className="flex flex-col space-y-4 mt-6">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </Button>
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

              <div className="text-center mt-6">
                <span className="text-sm text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/signup" className="text-sm text-primary underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
