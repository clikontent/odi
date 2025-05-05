"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCorporate, setIsCorporate] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [companySize, setCompanySize] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Step 1: Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            is_corporate: isCorporate,
            company_name: isCorporate ? companyName : null,
            company_size: isCorporate ? companySize : null,
          },
        },
      })

      if (signUpError) throw signUpError

      if (!data.user) {
        throw new Error("User creation failed. Please try again.")
      }

      // Step 2: Wait to ensure user is created in auth.users
      // This helps prevent race conditions
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 3: Verify user exists before proceeding
      const { data: userData, error: userCheckError } = await supabase.auth.getUser()

      if (userCheckError) throw userCheckError
      if (!userData.user) {
        throw new Error("User verification failed. Please try again or contact support.")
      }

      // Step 4: Create profile in the database - only after user is verified
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: email.toLowerCase(),
        full_name: fullName,
        subscription_tier: "free", // Always default to free tier
        company_name: isCorporate ? companyName : null,
        company_size: isCorporate ? companySize : null,
        subscription_end_date: null, // No end date for free tier
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Continue despite profile error - we can fix this later
      }

      // Step 5: Create user settings
      const { error: settingsError } = await supabase.from("user_settings").insert({
        user_id: data.user.id,
        email_notifications: true,
        application_updates: true,
        marketing_emails: false,
        job_alerts: true,
        theme: "system",
        language: "en",
        timezone: "UTC",
      })

      if (settingsError) {
        console.error("Settings creation error:", settingsError)
        // Continue despite settings error - we can fix this later
      }

      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
      })

      // Always redirect to dashboard after signup
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error signing up:", error)
      setError(error.message || "An error occurred during sign up")
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: "google" | "facebook") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error)
      setError(error.message || `An error occurred during ${provider} sign in`)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="oauth">Google/Facebook</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <Card>
              <form onSubmit={handleSignUp}>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
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
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="corporate"
                        checked={isCorporate}
                        onCheckedChange={(checked) => setIsCorporate(checked === true)}
                      />
                      <label
                        htmlFor="corporate"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Register as a corporate user
                      </label>
                    </div>

                    {isCorporate && (
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            placeholder="Acme Inc."
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required={isCorporate}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="companySize">Company Size</Label>
                          <Input
                            id="companySize"
                            placeholder="e.g., 1-10, 11-50, 51-200, 201+"
                            value={companySize}
                            onChange={(e) => setCompanySize(e.target.value)}
                            required={isCorporate}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="oauth">
            <Card>
              <CardHeader>
                <CardTitle>Social Sign Up</CardTitle>
                <CardDescription>Sign up with your social accounts</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignUp("google")}
                  disabled={loading}
                >
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignUp("facebook")}
                  disabled={loading}
                >
                  Continue with Facebook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
