"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Lock, Star, MessageSquare } from "lucide-react"
import { getUserSubscription } from "@/lib/subscription"
import Link from "next/link"

export default function InterviewPrepPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const subData = await getUserSubscription(user?.id || "")
      setSubscription(subData)
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const hasAccess = subscription?.plan_type === "professional" || subscription?.plan_type === "corporate"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-pink-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Interview Preparation</h1>
          <p className="text-xl text-gray-600">Professional Feature</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-pink-600" />
            </div>
            <CardTitle>Professional Plan Required</CardTitle>
            <CardDescription>
              AI Interview Preparation is exclusively available for Professional subscribers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-pink-200 bg-pink-50">
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <strong>What you'll get:</strong> AI-powered interview coaching, personalized questions based on job
                descriptions, real-time feedback, and performance analytics to ace your interviews.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-semibold">AI Interview Prep Features:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">AI-generated questions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Real-time feedback</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Performance analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Industry-specific prep</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Mock interview sessions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Confidence scoring</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Link href="/pricing">
                <Button size="lg" className="w-full">
                  <Crown className="mr-2 h-5 w-5" />
                  Upgrade to Professional
                </Button>
              </Link>
              <p className="text-sm text-gray-600">$19.99/month • Cancel anytime • 14-day money-back guarantee</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium mb-2">Success Story</h5>
              <blockquote className="text-sm text-gray-600 italic">
                "The AI interview prep helped me land my dream job at Google. The personalized feedback was
                game-changing!"
              </blockquote>
              <cite className="text-xs text-gray-500 mt-2 block">- Alex K., Senior Developer</cite>
            </div>

            <div className="border-t pt-4">
              <h5 className="font-medium mb-2">Why Professional Plan?</h5>
              <p className="text-sm text-gray-600">
                Interview preparation is our most advanced feature, requiring sophisticated AI models and personalized
                coaching algorithms. It's designed for serious job seekers who want the best possible preparation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user has access, show the actual interview prep
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Interview Preparation</h1>
        <p className="text-gray-600 mt-2">Practice with AI-powered interview questions and get personalized feedback</p>
      </div>

      <Alert className="mb-6 border-green-200 bg-green-50">
        <Crown className="h-4 w-4" />
        <AlertDescription>
          <strong>Professional Access Activated!</strong> You have full access to AI Interview Preparation.
        </AlertDescription>
      </Alert>

      {/* This would contain the actual interview prep functionality */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Loading AI Interview Preparation...</p>
            <p className="text-sm text-gray-500">
              This will include job description-based questions and experience-tailored coaching
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
