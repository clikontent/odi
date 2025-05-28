"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Lock, Star, Briefcase } from "lucide-react"
import { getUserSubscription } from "@/lib/subscription"
import Link from "next/link"

export default function JobBoardPage() {
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

  const hasAccess =
    subscription?.plan_type === "premium" ||
    subscription?.plan_type === "professional" ||
    subscription?.plan_type === "corporate"

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
          <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Exclusive Job Board</h1>
          <p className="text-xl text-gray-600">Premium Feature</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle>Upgrade Required</CardTitle>
            <CardDescription>
              Access exclusive job opportunities available only to Premium and Professional subscribers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-indigo-200 bg-indigo-50">
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <strong>What you'll get:</strong> Access to exclusive job postings, direct company connections, and
                priority application processing from top employers.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-semibold">Exclusive Job Board Features:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Hidden job opportunities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Direct employer connections</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Priority application processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Salary insights</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Link href="/pricing">
                <Button size="lg" className="w-full">
                  <Crown className="mr-2 h-5 w-5" />
                  Upgrade to Premium
                </Button>
              </Link>
              <p className="text-sm text-gray-600">
                Starting at $9.99/month • Cancel anytime • 14-day money-back guarantee
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium mb-2">Success Story</h5>
              <blockquote className="text-sm text-gray-600 italic">
                "I found my dream job through the exclusive job board. The hidden opportunities gave me access to
                positions I never would have found elsewhere!"
              </blockquote>
              <cite className="text-xs text-gray-500 mt-2 block">- Michael R., Product Manager</cite>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user has access, redirect to the actual job board
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Exclusive Job Board</h1>
        <p className="text-gray-600 mt-2">Discover premium job opportunities from top employers</p>
      </div>

      <Alert className="mb-6 border-green-200 bg-green-50">
        <Crown className="h-4 w-4" />
        <AlertDescription>
          <strong>Premium Access Activated!</strong> You have access to exclusive job opportunities.
        </AlertDescription>
      </Alert>

      {/* Redirect to actual job board page */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Loading exclusive job opportunities...</p>
            <Link href="/jobs">
              <Button>Continue to Job Board</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
